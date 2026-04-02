/**
 * Service for managing dynamic voice channels
 */

import { VoiceChannel, Guild, Snowflake, ChannelType, PermissionFlagsBits } from 'discord.js';
import { logger } from '../utils/logger';
import { OWNER_PERMISSIONS, TIMEOUTS } from '../constants';
import { DynamicChannelData, CreateDynamicChannelOptions, DynamicChannelOperationResult } from '../types';

/**
 * Service class for dynamic channel operations
 */
export class DynamicChannelService {
  private dynamicChannels: Map<Snowflake, DynamicChannelData>;
  
  constructor() {
    this.dynamicChannels = new Map();
  }
  
  /**
   * Register a new dynamic channel
   */
  register(channelId: Snowflake, data: DynamicChannelData): void {
    this.dynamicChannels.set(channelId, data);
    logger.info(`Canal dinâmico registrado: ${channelId}`);
  }
  
  /**
   * Unregister a dynamic channel
   */
  unregister(channelId: Snowflake): boolean {
    const deleted = this.dynamicChannels.delete(channelId);
    if (deleted) {
      logger.info(`Canal dinâmico removido do registro: ${channelId}`);
    }
    return deleted;
  }
  
  /**
   * Check if a channel is dynamic
   */
  isDynamic(channelId: Snowflake): boolean {
    return this.dynamicChannels.has(channelId);
  }
  
  /**
   * Get dynamic channel data
   */
  getData(channelId: Snowflake): DynamicChannelData | undefined {
    return this.dynamicChannels.get(channelId);
  }
  
  /**
   * Get the owner of a dynamic channel
   */
  getOwner(channelId: Snowflake): Snowflake | undefined {
    return this.dynamicChannels.get(channelId)?.ownerId;
  }
  
  /**
   * Set the owner of a dynamic channel
   */
  setOwner(channelId: Snowflake, ownerId: Snowflake): boolean {
    const data = this.dynamicChannels.get(channelId);
    if (!data) return false;
    
    data.ownerId = ownerId;
    this.dynamicChannels.set(channelId, data);
    logger.info(`Dono do canal ${channelId} alterado para ${ownerId}`);
    return true;
  }
  
  /**
   * Get all dynamic channels
   */
  getAll(): Map<Snowflake, DynamicChannelData> {
    return new Map(this.dynamicChannels);
  }
  
  /**
   * Get all dynamic channels for a specific guild
   */
  getByGuild(guildId: Snowflake): DynamicChannelData[] {
    return Array.from(this.dynamicChannels.values())
      .filter(data => data.guildId === guildId);
  }
  
  /**
   * Get all dynamic channels owned by a specific user
   */
  getByOwner(ownerId: Snowflake): DynamicChannelData[] {
    return Array.from(this.dynamicChannels.values())
      .filter(data => data.ownerId === ownerId);
  }
  
  /**
   * Create a new dynamic voice channel
   */
  async create(options: CreateDynamicChannelOptions): Promise<DynamicChannelOperationResult> {
    try {
      const { guild, member, creatorChannelId, categoryId, customName } = options;
      
      // Get category
      const category = guild.channels.cache.get(categoryId);
      if (!category || category.type !== ChannelType.GuildCategory) {
        return {
          success: false,
          error: 'Categoria não encontrada',
        };
      }
      
      // Create channel name
      const channelName = customName || `${member.user.username}'s channel`;
      
      // Create permission overwrites - WITHOUT protection by default
      const permissionOverwrites = [
        {
          id: guild.roles.everyone.id,
          allow: [PermissionFlagsBits.Connect],
        },
        {
          id: member.id,
          allow: OWNER_PERMISSIONS,
        },
      ];
      
      // Create the channel
      const newChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildVoice,
        parent: categoryId,
        permissionOverwrites,
      });
      
      // Register the channel
      const channelData: DynamicChannelData = {
        channelId: newChannel.id,
        ownerId: member.id,
        creatorChannelId,
        guildId: guild.id,
        createdAt: Date.now(),
      };
      
      this.register(newChannel.id, channelData);
      
      // Move member to the new channel
      try {
        await member.voice.setChannel(newChannel);
      } catch (moveError) {
        logger.warn(
          `Não foi possível mover ${member.user.tag} para o novo canal: ${moveError instanceof Error ? moveError.message : String(moveError)}`,
        );
      }
      
      logger.info(`Canal dinâmico criado: ${newChannel.name} (${newChannel.id}) para ${member.user.tag}`);
      
      return {
        success: true,
        data: {
          channel: newChannel,
          channelData,
        },
      };
    } catch (error) {
      logger.error('Erro ao criar canal dinâmico:', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }
  
  /**
   * Delete a dynamic channel
   */
  async delete(channelId: Snowflake, guild: Guild): Promise<DynamicChannelOperationResult> {
    try {
      const channel = guild.channels.cache.get(channelId);
      if (!channel) {
        return {
          success: false,
          error: 'Canal não encontrado',
        };
      }
      
      // Delete the channel
      await channel.delete('Canal dinâmico vazio');
      
      // Unregister
      this.unregister(channelId);
      
      logger.info(`Canal dinâmico deletado: ${channelId}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Erro ao deletar canal dinâmico:', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }
  
  /**
   * Check if a channel is empty and schedule deletion
   */
  async checkAndDeleteIfEmpty(channelId: Snowflake, guild: Guild): Promise<void> {
    setTimeout(async () => {
      try {
        const channel = guild.channels.cache.get(channelId);
        if (!channel || channel.type !== ChannelType.GuildVoice) return;
        
        const voiceChannel = channel as VoiceChannel;
        if (voiceChannel.members.size === 0) {
          await this.delete(channelId, guild);
        }
      } catch (error) {
        logger.error('Erro ao verificar canal vazio:', error as Error);
      }
    }, TIMEOUTS.CHANNEL_EMPTY_CHECK);
  }
  
  /**
   * Transfer ownership of a channel
   */
  async transferOwnership(
    channelId: Snowflake,
    newOwnerId: Snowflake,
    oldOwnerId: Snowflake,
    channel: VoiceChannel
  ): Promise<DynamicChannelOperationResult> {
    try {
      // Remove admin permissions from old owner
      await channel.permissionOverwrites.edit(oldOwnerId, {
        ManageChannels: false,
        ManageRoles: false,
        MuteMembers: false,
        DeafenMembers: false,
        MoveMembers: false,
        PrioritySpeaker: false,
      });
      
      // Give full permissions to new owner
      await channel.permissionOverwrites.edit(newOwnerId, {
        ManageChannels: true,
        ManageRoles: true,
        Connect: true,
        Speak: true,
        Stream: true,
        UseVAD: true,
        PrioritySpeaker: true,
        MuteMembers: true,
        DeafenMembers: true,
        MoveMembers: true,
      });
      
      // Update owner in the system
      this.setOwner(channelId, newOwnerId);
      
      logger.info(`Propriedade do canal ${channelId} transferida de ${oldOwnerId} para ${newOwnerId}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Erro ao transferir propriedade:', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }
  
  /**
   * Clear all dynamic channels (used on bot restart)
   */
  clear(): void {
    this.dynamicChannels.clear();
    logger.info('Todos os canais dinâmicos foram removidos da memória');
  }
  
  /**
   * Load dynamic channels from a map
   */
  loadFromMap(data: Map<Snowflake, DynamicChannelData>): void {
    this.dynamicChannels = new Map(data);
    logger.info(`${this.dynamicChannels.size} canais dinâmicos carregados`);
  }
}

// Export singleton instance
export const dynamicChannelService = new DynamicChannelService();
