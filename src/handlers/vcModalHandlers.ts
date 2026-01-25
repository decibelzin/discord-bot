import { ModalSubmitInteraction, UserSelectMenuInteraction, MessageFlags, ChannelType, VoiceChannel } from 'discord.js';
import { logger } from '../utils/logger';
import { dynamicChannelService, UserChannelSettingsService } from '../services';
import { ChannelValidator } from '../validators';
import { MESSAGES } from '../constants';
import { getChannelOwner } from '../events/voiceStateUpdate';

export async function handleStatusModal(interaction: ModalSubmitInteraction, channelId: string): Promise<void> {
  try {
    if (!interaction.guild) return;
    
    const newStatus = interaction.fields.getTextInputValue('channel_status').trim();
    
    const validation = ChannelValidator.validateChannelStatus(newStatus);
    if (!validation.valid && newStatus) {
      await interaction.reply({
        content: `❌ ${validation.error}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    
    const channel = await interaction.guild.channels.fetch(channelId);
    
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      await interaction.reply({
        content: MESSAGES.ERRORS.CHANNEL_NOT_FOUND,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      const endpoint = `/channels/${channelId}/voice-status` as `/channels/${string}/voice-status`;
      
      if (newStatus) {
        await interaction.client.rest.put(endpoint, {
          body: { status: newStatus },
        });
      } else {
        await interaction.client.rest.delete(endpoint);
      }
      
      const ownerId = getChannelOwner(channelId);
      if (ownerId && interaction.guild) {
        if (newStatus) {
          UserChannelSettingsService.updateSetting(
            ownerId,
            interaction.guild.id,
            'status',
            newStatus
          );
        } else {
          UserChannelSettingsService.removeSetting(
            ownerId,
            interaction.guild.id,
            'status'
          );
        }
      }
      
      await interaction.reply({
        content: newStatus 
          ? MESSAGES.SUCCESS.STATUS_UPDATED(newStatus)
          : MESSAGES.SUCCESS.STATUS_REMOVED,
        flags: MessageFlags.Ephemeral,
      });
    } catch (apiError: any) {
      logger.error('Erro na API do Discord:', apiError);
      
      try {
        await interaction.client.rest.patch(`/channels/${channelId}` as `/channels/${string}`, {
          body: { status: newStatus || null },
        });
        
        await interaction.reply({
          content: newStatus 
            ? MESSAGES.SUCCESS.STATUS_UPDATED(newStatus)
            : MESSAGES.SUCCESS.STATUS_REMOVED,
          flags: MessageFlags.Ephemeral,
        });
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
  } catch (error) {
    logger.error('Erro ao alterar status do canal:', error as Error);
    
    const errorMsg = error instanceof Error ? error.message : '';
    const isRateLimit = errorMsg.includes('rate limit') || errorMsg.includes('too fast');
    const isNotFound = errorMsg.includes('404') || errorMsg.includes('Unknown');
    
    await interaction.reply({
      content: isRateLimit 
        ? MESSAGES.ERRORS.RATE_LIMIT
        : isNotFound
        ? MESSAGES.ERRORS.ENDPOINT_UNAVAILABLE
        : MESSAGES.ERRORS.STATUS_UPDATE_FAILED,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleRenameModal(interaction: ModalSubmitInteraction, channelId: string): Promise<void> {
  try {
    if (!interaction.guild) return;
    
    const newName = interaction.fields.getTextInputValue('channel_name').trim();
    
    const validation = ChannelValidator.validateChannelName(newName);
    if (!validation.valid) {
      await interaction.reply({
        content: `❌ ${validation.error}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    
    const channel = await interaction.guild.channels.fetch(channelId);
    
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      await interaction.reply({
        content: MESSAGES.ERRORS.CHANNEL_NOT_FOUND,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await channel.setName(validation.value as string);
    
    const ownerId = getChannelOwner(channelId);
    if (ownerId && interaction.guild) {
      UserChannelSettingsService.updateSetting(
        ownerId,
        interaction.guild.id,
        'channelName',
        validation.value as string
      );
    }
    
    await interaction.reply({
      content: MESSAGES.SUCCESS.CHANNEL_RENAMED(validation.value as string),
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    logger.error('Erro ao renomear canal:', error as Error);
    
    const errorMsg = error instanceof Error ? error.message : '';
    const isRateLimit = errorMsg.includes('rate limit') || errorMsg.includes('too fast');
    
    await interaction.reply({
      content: isRateLimit 
        ? MESSAGES.ERRORS.RATE_LIMIT
        : MESSAGES.ERRORS.RENAME_FAILED,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleBitrateModal(interaction: ModalSubmitInteraction, channelId: string): Promise<void> {
  try {
    if (!interaction.guild) return;
    
    const bitrateValue = interaction.fields.getTextInputValue('bitrate_value');
    const bitrate = parseInt(bitrateValue);
    
    const validation = ChannelValidator.validateBitrate(bitrate, interaction.guild.premiumTier);
    if (!validation.valid) {
      const premiumTier = interaction.guild.premiumTier;
      const maxBitrate = [96, 128, 256, 384][premiumTier];
      
      await interaction.reply({
        content: MESSAGES.ERRORS.BITRATE_INVALID(maxBitrate, premiumTier),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const channel = await interaction.guild.channels.fetch(channelId);
    
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      await interaction.reply({
        content: MESSAGES.ERRORS.CHANNEL_NOT_FOUND,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const voiceChannel = channel as VoiceChannel;
    await voiceChannel.setBitrate(bitrate * 1000);

    const ownerId = getChannelOwner(channelId);
    if (ownerId && interaction.guild) {
      UserChannelSettingsService.updateSetting(
        ownerId,
        interaction.guild.id,
        'bitrate',
        bitrate
      );
    }

    await interaction.reply({
      content: MESSAGES.SUCCESS.BITRATE_UPDATED(bitrate),
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    logger.error('Erro ao ajustar bitrate:', error as Error);
    
    const errorMsg = error instanceof Error ? error.message : '';
    const isPermissionError = errorMsg.includes('Missing Permissions') || errorMsg.includes('permission');
    
    await interaction.reply({
      content: isPermissionError 
        ? MESSAGES.ERRORS.BOT_NO_PERMISSION
        : MESSAGES.ERRORS.BITRATE_FAILED,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleUserLimitModal(interaction: ModalSubmitInteraction, channelId: string): Promise<void> {
  try {
    if (!interaction.guild) return;
    
    const limitValue = interaction.fields.getTextInputValue('user_limit_value');
    const limit = parseInt(limitValue);
    
    const validation = ChannelValidator.validateUserLimit(limit);
    if (!validation.valid) {
      await interaction.reply({
        content: `❌ ${validation.error}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const channel = await interaction.guild.channels.fetch(channelId);
    
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      await interaction.reply({
        content: MESSAGES.ERRORS.CHANNEL_NOT_FOUND,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const voiceChannel = channel as VoiceChannel;
    await voiceChannel.setUserLimit(limit);

    const ownerId = getChannelOwner(channelId);
    if (ownerId && interaction.guild) {
      UserChannelSettingsService.updateSetting(
        ownerId,
        interaction.guild.id,
        'userLimit',
        limit
      );
    }

    const limitText = limit === 0 ? 'ilimitado' : limit.toString();
    await interaction.reply({
      content: MESSAGES.SUCCESS.USER_LIMIT_UPDATED(limitText),
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    logger.error('Erro ao definir limite de usuários:', error as Error);
    await interaction.reply({
      content: MESSAGES.ERRORS.USER_LIMIT_FAILED,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleAllowUser(interaction: UserSelectMenuInteraction, channelId: string): Promise<void> {
  try {
    if (!interaction.guild) return;
    
    const userId = interaction.values[0];
    
    const member = await interaction.guild.members.fetch(userId).catch(() => null);
    if (!member) {
      await interaction.reply({
        content: MESSAGES.ERRORS.USER_NOT_FOUND,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    
    if (member.user.bot) {
      await interaction.reply({
        content: MESSAGES.ERRORS.CANNOT_MANAGE_BOTS,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    
    const channel = await interaction.guild.channels.fetch(channelId);
    
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      await interaction.reply({
        content: MESSAGES.ERRORS.CHANNEL_NOT_FOUND,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const voiceChannel = channel as VoiceChannel;

    await voiceChannel.permissionOverwrites.edit(userId, {
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

    await interaction.reply({
      content: MESSAGES.SUCCESS.USER_ALLOWED(userId),
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    logger.error('Erro ao permitir usuário:', error as Error);
    await interaction.reply({
      content: MESSAGES.ERRORS.ALLOW_USER_FAILED,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleKickUser(interaction: UserSelectMenuInteraction, channelId: string): Promise<void> {
  try {
    if (!interaction.guild) return;
    
    const userId = interaction.values[0];
    const member = await interaction.guild.members.fetch(userId);
    
    if (!member.voice.channel || member.voice.channel.id !== channelId) {
      await interaction.reply({
        content: MESSAGES.ERRORS.USER_NOT_IN_CHANNEL,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await member.voice.disconnect('Removido pelo dono do canal');

    await interaction.reply({
      content: MESSAGES.SUCCESS.USER_KICKED(userId),
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    logger.error('Erro ao kickar usuário:', error as Error);
    await interaction.reply({
      content: MESSAGES.ERRORS.KICK_USER_FAILED,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleBlockUser(interaction: UserSelectMenuInteraction, channelId: string): Promise<void> {
  try {
    if (!interaction.guild) return;
    
    const userId = interaction.values[0];
    
    if (userId === interaction.user.id) {
      await interaction.reply({
        content: MESSAGES.ERRORS.CANNOT_BLOCK_YOURSELF,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    
    const channel = await interaction.guild.channels.fetch(channelId);
    
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      await interaction.reply({
        content: MESSAGES.ERRORS.CHANNEL_NOT_FOUND,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const voiceChannel = channel as VoiceChannel;

    await voiceChannel.permissionOverwrites.edit(userId, {
      Connect: false,
      ViewChannel: false,
    });

    try {
      const member = await interaction.guild.members.fetch(userId);
      if (member.voice.channel?.id === channelId) {
        await member.voice.disconnect('Bloqueado pelo dono do canal');
      }
    } catch {
    }

    await interaction.reply({
      content: MESSAGES.SUCCESS.USER_BLOCKED(userId),
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    logger.error('Erro ao bloquear usuário:', error as Error);
    await interaction.reply({
      content: MESSAGES.ERRORS.BLOCK_USER_FAILED,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleUnblockUser(interaction: UserSelectMenuInteraction, channelId: string): Promise<void> {
  try {
    if (!interaction.guild) return;
    
    const userId = interaction.values[0];
    const channel = await interaction.guild.channels.fetch(channelId);
    
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      await interaction.reply({
        content: MESSAGES.ERRORS.CHANNEL_NOT_FOUND,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const voiceChannel = channel as VoiceChannel;

    await voiceChannel.permissionOverwrites.edit(userId, {
      Connect: null,
      ViewChannel: null,
    });

    await interaction.reply({
      content: MESSAGES.SUCCESS.USER_UNBLOCKED(userId),
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    logger.error('Erro ao desbloquear usuário:', error as Error);
    await interaction.reply({
      content: MESSAGES.ERRORS.UNBLOCK_USER_FAILED,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleTransferOwnership(interaction: UserSelectMenuInteraction, channelId: string): Promise<void> {
  try {
    if (!interaction.guild) return;
    
    const newOwnerId = interaction.values[0];
    
    if (newOwnerId === interaction.user.id) {
      await interaction.reply({
        content: MESSAGES.ERRORS.ALREADY_OWNER,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    
    const newOwner = await interaction.guild.members.fetch(newOwnerId).catch(() => null);
    if (!newOwner) {
      await interaction.reply({
        content: MESSAGES.ERRORS.USER_NOT_FOUND,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    
    if (newOwner.user.bot) {
      await interaction.reply({
        content: MESSAGES.ERRORS.CANNOT_TRANSFER_TO_BOT,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    
    const channel = await interaction.guild.channels.fetch(channelId);
    
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      await interaction.reply({
        content: MESSAGES.ERRORS.CHANNEL_NOT_FOUND,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const voiceChannel = channel as VoiceChannel;

    // Usar o service para transferir propriedade
    const result = await dynamicChannelService.transferOwnership(
      channelId,
      newOwnerId,
      interaction.user.id,
      voiceChannel
    );

    if (!result.success) {
      await interaction.reply({
        content: MESSAGES.ERRORS.TRANSFER_FAILED,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.reply({
      content: MESSAGES.SUCCESS.OWNERSHIP_TRANSFERRED(newOwnerId),
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    logger.error('Erro ao transferir propriedade:', error as Error);
    await interaction.reply({
      content: MESSAGES.ERRORS.TRANSFER_FAILED,
      flags: MessageFlags.Ephemeral,
    });
  }
}
