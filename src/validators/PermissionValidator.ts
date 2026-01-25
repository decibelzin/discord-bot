/**
 * Validator for permission operations
 */

import { GuildMember, VoiceChannel, PermissionFlagsBits } from 'discord.js';
import { ValidationResult, PermissionCheckResult } from '../types';
import { dynamicChannelService } from '../services';

/**
 * Validator class for permission-related operations
 */
export class PermissionValidator {
  /**
   * Validate that a member is the owner of a dynamic channel
   */
  static validateOwnership(memberId: string, channelId: string): ValidationResult {
    const ownerId = dynamicChannelService.getOwner(channelId);
    
    if (!ownerId) {
      return {
        valid: false,
        error: 'Canal não é dinâmico ou não foi encontrado',
        field: 'channelId',
      };
    }
    
    if (ownerId !== memberId) {
      return {
        valid: false,
        error: 'Apenas o criador do canal pode realizar esta ação',
        field: 'memberId',
      };
    }
    
    return {
      valid: true,
    };
  }
  
  /**
   * Validate that a member can manage a channel
   */
  static validateCanManage(member: GuildMember, channel: VoiceChannel): ValidationResult {
    const permissions = channel.permissionsFor(member);
    
    if (!permissions) {
      return {
        valid: false,
        error: 'Não foi possível verificar permissões',
        field: 'member',
      };
    }
    
    if (!permissions.has(PermissionFlagsBits.ManageChannels)) {
      return {
        valid: false,
        error: 'Você não tem permissão para gerenciar este canal',
        field: 'member',
      };
    }
    
    return {
      valid: true,
    };
  }
  
  /**
   * Validate that a member is an administrator
   */
  static validateIsAdmin(member: GuildMember): ValidationResult {
    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      return {
        valid: false,
        error: 'Apenas administradores podem realizar esta ação',
        field: 'member',
      };
    }
    
    return {
      valid: true,
    };
  }
  
  /**
   * Validate that a member is not a bot
   */
  static validateNotBot(member: GuildMember): ValidationResult {
    if (member.user.bot) {
      return {
        valid: false,
        error: 'Não é possível realizar esta ação em bots',
        field: 'member',
      };
    }
    
    return {
      valid: true,
    };
  }
  
  /**
   * Validate that a member is in a voice channel
   */
  static validateInVoiceChannel(member: GuildMember): ValidationResult {
    if (!member.voice.channel) {
      return {
        valid: false,
        error: 'Você precisa estar em um canal de voz',
        field: 'member',
      };
    }
    
    return {
      valid: true,
      value: member.voice.channel,
    };
  }
  
  /**
   * Validate that a member is in a specific voice channel
   */
  static validateInSpecificChannel(member: GuildMember, channelId: string): ValidationResult {
    if (!member.voice.channel) {
      return {
        valid: false,
        error: 'Você precisa estar em um canal de voz',
        field: 'member',
      };
    }
    
    if (member.voice.channel.id !== channelId) {
      return {
        valid: false,
        error: 'Você precisa estar neste canal de voz',
        field: 'member',
      };
    }
    
    return {
      valid: true,
    };
  }
  
  /**
   * Validate transfer ownership operation
   */
  static validateTransferOwnership(currentOwnerId: string, newOwnerId: string, newOwner: GuildMember): ValidationResult {
    if (newOwnerId === currentOwnerId) {
      return {
        valid: false,
        error: 'Você já é o dono do canal',
        field: 'newOwnerId',
      };
    }
    
    if (newOwner.user.bot) {
      return {
        valid: false,
        error: 'Não é possível transferir propriedade para bots',
        field: 'newOwner',
      };
    }
    
    return {
      valid: true,
    };
  }
  
  /**
   * Validate that a user can be blocked
   */
  static validateCanBlock(userId: string, ownerId: string): ValidationResult {
    if (userId === ownerId) {
      return {
        valid: false,
        error: 'Você não pode bloquear a si mesmo',
        field: 'userId',
      };
    }
    
    return {
      valid: true,
    };
  }
  
  /**
   * Comprehensive permission check for channel operations
   */
  static async checkChannelOperationPermission(
    member: GuildMember,
    channel: VoiceChannel,
    requireOwnership: boolean = true
  ): Promise<PermissionCheckResult> {
    // Check if channel is dynamic
    if (!dynamicChannelService.isDynamic(channel.id)) {
      return {
        allowed: false,
        reason: 'Este canal não é um canal dinâmico',
      };
    }
    
    // Admins can do anything
    if (member.permissions.has(PermissionFlagsBits.Administrator)) {
      return {
        allowed: true,
      };
    }
    
    // Check ownership if required
    if (requireOwnership) {
      const ownerId = dynamicChannelService.getOwner(channel.id);
      if (ownerId !== member.id) {
        return {
          allowed: false,
          reason: 'Apenas o criador do canal pode realizar esta ação',
        };
      }
    }
    
    return {
      allowed: true,
    };
  }
}
