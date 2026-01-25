/**
 * Service for managing channel protection (auto-kick unauthorized users)
 */

import { VoiceChannel, GuildMember, PermissionFlagsBits, MessageFlags, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { logger } from '../utils/logger';
import { MESSAGES, TIMEOUTS } from '../constants';
import { ChannelProtectionStatus, PermissionCheckResult } from '../types';

/**
 * Service class for channel protection operations
 */
export class ProtectionService {
  /**
   * Check if a channel is protected
   */
  isProtected(channel: VoiceChannel): boolean {
    const everyoneRole = channel.guild.roles.everyone;
    const everyonePerms = channel.permissionOverwrites.cache.get(everyoneRole.id);
    return everyonePerms?.deny.has(PermissionFlagsBits.Connect) || false;
  }
  
  /**
   * Get protection status of a channel
   */
  getProtectionStatus(channel: VoiceChannel): ChannelProtectionStatus {
    const isProtected = this.isProtected(channel);
    
    const allowedUsers: string[] = [];
    const blockedUsers: string[] = [];
    
    for (const [overwriteId, overwrite] of channel.permissionOverwrites.cache) {
      if (overwrite.type === 1) { // User overwrite
        if (overwrite.allow.has(PermissionFlagsBits.Connect)) {
          allowedUsers.push(overwriteId);
        }
        if (overwrite.deny.has(PermissionFlagsBits.Connect)) {
          blockedUsers.push(overwriteId);
        }
      }
    }
    
    return {
      isProtected,
      allowedUsers,
      blockedUsers,
    };
  }
  
  /**
   * Enable protection on a channel
   */
  async enableProtection(channel: VoiceChannel, ownerId: string): Promise<void> {
    try {
      const guild = channel.guild;
      
      // Deny @everyone
      await channel.permissionOverwrites.edit(guild.roles.everyone.id, {
        Connect: false,
      });
      
      // Deny all non-admin roles
      const nonAdminRoles = guild.roles.cache.filter(role => 
        !role.permissions.has(PermissionFlagsBits.Administrator) && 
        role.id !== guild.roles.everyone.id
      );
      
      for (const role of nonAdminRoles.values()) {
        await channel.permissionOverwrites.edit(role.id, {
          Connect: false,
        });
      }
      
      // Preserve explicit user allows
      for (const [overwriteId, overwrite] of channel.permissionOverwrites.cache) {
        if (overwrite.type === 1 && overwrite.allow.has(PermissionFlagsBits.Connect)) {
          await channel.permissionOverwrites.edit(overwriteId, {
            Connect: true,
          });
        }
      }
      
      // Ensure owner can always connect
      await channel.permissionOverwrites.edit(ownerId, {
        Connect: true,
      });
      
      logger.info(`Proteção ativada no canal ${channel.id}`);
    } catch (error) {
      logger.error('Erro ao ativar proteção:', error as Error);
      throw error;
    }
  }
  
  /**
   * Disable protection on a channel
   */
  async disableProtection(channel: VoiceChannel, ownerId: string): Promise<void> {
    try {
      const guild = channel.guild;
      
      // Allow @everyone
      await channel.permissionOverwrites.edit(guild.roles.everyone.id, {
        Connect: true,
      });
      
      // Remove deny from all non-admin roles
      const nonAdminRoles = guild.roles.cache.filter(role => 
        !role.permissions.has(PermissionFlagsBits.Administrator) && 
        role.id !== guild.roles.everyone.id
      );
      
      for (const role of nonAdminRoles.values()) {
        await channel.permissionOverwrites.edit(role.id, {
          Connect: null,
        });
      }
      
      // Preserve explicit user blocks
      for (const [overwriteId, overwrite] of channel.permissionOverwrites.cache) {
        if (overwrite.type === 1 && overwrite.deny.has(PermissionFlagsBits.Connect)) {
          await channel.permissionOverwrites.edit(overwriteId, {
            Connect: false,
          });
        }
      }
      
      // Ensure owner can always connect
      await channel.permissionOverwrites.edit(ownerId, {
        Connect: true,
      });
      
      logger.info(`Proteção desativada no canal ${channel.id}`);
    } catch (error) {
      logger.error('Erro ao desativar proteção:', error as Error);
      throw error;
    }
  }
  
  /**
   * Toggle protection on a channel
   */
  async toggleProtection(channel: VoiceChannel, ownerId: string): Promise<boolean> {
    const isCurrentlyProtected = this.isProtected(channel);
    
    if (isCurrentlyProtected) {
      await this.disableProtection(channel, ownerId);
      return false; // Now unprotected
    } else {
      await this.enableProtection(channel, ownerId);
      return true; // Now protected
    }
  }
  
  /**
   * Check if a member is allowed to join a protected channel
   */
  canJoinProtectedChannel(member: GuildMember, channel: VoiceChannel, ownerId: string): PermissionCheckResult {
    // Owner can always join
    if (member.id === ownerId) {
      return { allowed: true };
    }
    
    // Admins can always join
    if (member.permissions.has(PermissionFlagsBits.Administrator)) {
      return { allowed: true };
    }
    
    // Check explicit allow permission
    const memberPerms = channel.permissionOverwrites.cache.get(member.id);
    if (memberPerms?.allow.has(PermissionFlagsBits.Connect)) {
      return { allowed: true };
    }
    
    // If protected and no explicit allow, deny
    if (this.isProtected(channel)) {
      return {
        allowed: false,
        reason: MESSAGES.PROTECTION.NO_PERMISSION(member.toString()),
      };
    }
    
    // Channel is not protected
    return { allowed: true };
  }
  
  /**
   * Auto-kick a member from a protected channel
   */
  async autoKick(member: GuildMember, channel: VoiceChannel, reason: string): Promise<void> {
    try {
      // Send message in channel before disconnecting
      try {
        const components = [
          new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(reason),
            ),
        ];
        
        const message = await (channel as any).send({
          components: components.map(c => c.toJSON()),
          flags: MessageFlags.IsComponentsV2,
        });
        
        // Delete message after timeout
        setTimeout(async () => {
          try {
            await message.delete();
          } catch (deleteError) {
            // Ignore if already deleted
          }
        }, TIMEOUTS.MESSAGE_AUTO_DELETE);
      } catch (sendError) {
        logger.error('Erro ao enviar mensagem de bloqueio no canal:', sendError as Error);
      }
      
      // Disconnect member
      await member.voice.disconnect('Canal protegido - sem permissão para entrar');
      
      logger.info(`${member.user.tag} foi desconectado do canal protegido ${channel.id}`);
    } catch (error) {
      logger.error('Erro ao desconectar membro do canal protegido:', error as Error);
      throw error;
    }
  }
  
  /**
   * Allow a user to join a protected channel
   */
  async allowUser(channel: VoiceChannel, userId: string): Promise<void> {
    await channel.permissionOverwrites.edit(userId, {
      Connect: true,
    });
    logger.info(`Usuário ${userId} permitido no canal ${channel.id}`);
  }
  
  /**
   * Block a user from joining a channel
   */
  async blockUser(channel: VoiceChannel, userId: string): Promise<void> {
    await channel.permissionOverwrites.edit(userId, {
      Connect: false,
      ViewChannel: false,
    });
    logger.info(`Usuário ${userId} bloqueado no canal ${channel.id}`);
  }
  
  /**
   * Unblock a user from a channel
   */
  async unblockUser(channel: VoiceChannel, userId: string): Promise<void> {
    await channel.permissionOverwrites.edit(userId, {
      Connect: null,
      ViewChannel: null,
    });
    logger.info(`Usuário ${userId} desbloqueado no canal ${channel.id}`);
  }
}

// Export singleton instance
export const protectionService = new ProtectionService();
