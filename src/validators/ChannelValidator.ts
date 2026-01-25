import { VoiceChannel, ChannelType, Guild, Snowflake } from 'discord.js';
import { ValidationResult } from '../types';
import { LIMITS } from '../constants';

export class ChannelValidator {
  static validateChannelName(name: string): ValidationResult {
    const trimmed = name.trim();
    
    if (trimmed.length === 0) {
      return {
        valid: false,
        error: 'O nome do canal não pode estar vazio',
        field: 'name',
      };
    }
    
    if (trimmed.length > LIMITS.VOICE_CHANNEL.NAME_MAX_LENGTH) {
      return {
        valid: false,
        error: `O nome do canal deve ter no máximo ${LIMITS.VOICE_CHANNEL.NAME_MAX_LENGTH} caracteres`,
        field: 'name',
      };
    }
    
    const invalidChars = /[\x00-\x1F\x7F]/;
    if (invalidChars.test(trimmed)) {
      return {
        valid: false,
        error: 'O nome do canal contém caracteres inválidos',
        field: 'name',
      };
    }
    
    return {
      valid: true,
      value: trimmed,
    };
  }
  
  static validateUserLimit(limit: number): ValidationResult {
    if (!Number.isInteger(limit)) {
      return {
        valid: false,
        error: 'O limite de usuários deve ser um número inteiro',
        field: 'userLimit',
      };
    }
    
    if (limit < LIMITS.VOICE_CHANNEL.USER_LIMIT_MIN) {
      return {
        valid: false,
        error: `O limite de usuários deve ser no mínimo ${LIMITS.VOICE_CHANNEL.USER_LIMIT_MIN}`,
        field: 'userLimit',
      };
    }
    
    if (limit > LIMITS.VOICE_CHANNEL.USER_LIMIT_MAX) {
      return {
        valid: false,
        error: `O limite de usuários deve ser no máximo ${LIMITS.VOICE_CHANNEL.USER_LIMIT_MAX}`,
        field: 'userLimit',
      };
    }
    
    return {
      valid: true,
      value: limit,
    };
  }
  
  static validateBitrate(bitrate: number, guildPremiumTier: number): ValidationResult {
    if (!Number.isInteger(bitrate)) {
      return {
        valid: false,
        error: 'O bitrate deve ser um número inteiro',
        field: 'bitrate',
      };
    }
    
    if (bitrate < LIMITS.VOICE_CHANNEL.BITRATE_MIN) {
      return {
        valid: false,
        error: `O bitrate deve ser no mínimo ${LIMITS.VOICE_CHANNEL.BITRATE_MIN} kbps`,
        field: 'bitrate',
      };
    }
    
    let maxBitrate = 96;
    if (guildPremiumTier === 1) maxBitrate = 128;
    else if (guildPremiumTier === 2) maxBitrate = 256;
    else if (guildPremiumTier === 3) maxBitrate = 384;
    
    if (bitrate > maxBitrate) {
      return {
        valid: false,
        error: `O limite de bitrate para este servidor é ${maxBitrate} kbps (Nível de Boost: ${guildPremiumTier})`,
        field: 'bitrate',
      };
    }
    
    return {
      valid: true,
      value: bitrate,
    };
  }
  
  static validateChannelStatus(status: string): ValidationResult {
    const trimmed = status.trim();
    
    if (trimmed.length > LIMITS.VOICE_CHANNEL.STATUS_MAX_LENGTH) {
      return {
        valid: false,
        error: `O status deve ter no máximo ${LIMITS.VOICE_CHANNEL.STATUS_MAX_LENGTH} caracteres`,
        field: 'status',
      };
    }
    
    return {
      valid: true,
      value: trimmed,
    };
  }
  
  static async validateVoiceChannel(channelId: Snowflake, guild: Guild): Promise<ValidationResult> {
    try {
      const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId);
      
      if (!channel) {
        return {
          valid: false,
          error: 'Canal não encontrado',
          field: 'channelId',
        };
      }
      
      if (channel.type !== ChannelType.GuildVoice) {
        return {
          valid: false,
          error: 'Este não é um canal de voz',
          field: 'channelId',
        };
      }
      
      return {
        valid: true,
        value: channel as VoiceChannel,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Erro ao validar canal',
        field: 'channelId',
      };
    }
  }
  
  static validateManageable(channel: VoiceChannel): ValidationResult {
    if (!channel.manageable) {
      return {
        valid: false,
        error: 'O bot não tem permissão para gerenciar este canal',
        field: 'channel',
      };
    }
    
    return {
      valid: true,
      value: channel,
    };
  }
  
  static validateDeletable(channel: VoiceChannel): ValidationResult {
    if (!channel.deletable) {
      return {
        valid: false,
        error: 'O bot não tem permissão para deletar este canal',
        field: 'channel',
      };
    }
    
    return {
      valid: true,
      value: channel,
    };
  }
}
