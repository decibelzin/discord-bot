import { StringSelectMenuInteraction, ButtonInteraction, MessageFlags, ChannelType, VoiceChannel, PermissionFlagsBits, PermissionsBitField, SeparatorBuilder, SeparatorSpacingSize, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { logger } from '../utils/logger';
import { isDynamicChannel, getChannelOwner } from '../events/voiceStateUpdate';
import { protectionService, UserChannelSettingsService } from '../services';
import { VCModalBuilder, VCMessageBuilder } from '../builders';
import { MESSAGES, TIMEOUTS } from '../constants';

type VCInteraction = StringSelectMenuInteraction | ButtonInteraction;

async function deferEphemeralIfNeeded(interaction: VCInteraction): Promise<void> {
  if (interaction.deferred || interaction.replied) return;
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
}

async function safeRespondEphemeral(interaction: VCInteraction, content: string): Promise<void> {
  try {
    if (interaction.deferred) {
      await interaction.editReply({ content });
    } else if (interaction.replied) {
      await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content, flags: MessageFlags.Ephemeral });
    }
  } catch {
    // If the interaction expired between the defer and this response,
    // Discord will throw "Unknown interaction" (10062). At this point,
    // there's nothing useful we can do for the user.
  }
}

function getSelectedValue(interaction: VCInteraction): string {
  return interaction.isButton() ? interaction.customId : interaction.values[0];
}

async function verifyChannelOwner(interaction: VCInteraction): Promise<{ voiceChannel: VoiceChannel; ownerId: string } | null> {
  const safeReply = async (content: string) => {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content, flags: MessageFlags.Ephemeral });
    }
  };

  if (!interaction.guild || !interaction.channel) {
    await safeReply('❌ Erro ao processar comando!');
    return null;
  }

  const channel = await interaction.guild.channels.fetch(interaction.channel.id);
  if (!channel || channel.type !== ChannelType.GuildVoice || !isDynamicChannel(channel.id)) {
    await safeReply('❌ Este comando só funciona em canais dinâmicos!');
    return null;
  }

  const voiceChannel = channel as VoiceChannel;
  const ownerId = getChannelOwner(voiceChannel.id);
  
  if (!ownerId || ownerId !== interaction.user.id) {
    await safeReply('❌ Apenas o criador do canal pode fazer isso!');
    return null;
  }

  return { voiceChannel, ownerId };
}

export async function handleManageChannelSubmenu(interaction: VCInteraction | ButtonInteraction): Promise<void> {
  const selectedValue = getSelectedValue(interaction);

  if (selectedValue === 'vc_back_main') {
    try {
      await interaction.update({
        content: '⬅️ Voltando ao menu principal...',
        components: [],
      });
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch {
        }
      }, 1500);
    } catch {
      await interaction.deferUpdate();
      await interaction.deleteReply().catch(() => {});
    }
    return;
  }

  const result = await verifyChannelOwner(interaction);
  if (!result) return;
  const { voiceChannel } = result;

  switch (selectedValue) {
    case 'vc_rename_channel':
      await showRenameModal(interaction, voiceChannel);
      break;
    case 'vc_lock_channel':
      await lockChannel(interaction, voiceChannel);
      break;
    case 'vc_unlock_channel':
      await unlockChannel(interaction, voiceChannel);
      break;
    case 'vc_hide_channel':
      await hideChannel(interaction, voiceChannel);
      break;
    case 'vc_show_channel':
      await showChannel(interaction, voiceChannel);
      break;
    case 'vc_transfer_ownership':
      await showTransferOwnershipMenu(interaction, voiceChannel);
      break;
    case 'vc_bitrate':
      await showBitrateModal(interaction, voiceChannel);
      break;
    case 'vc_reset_permissions':
      await resetPermissions(interaction, voiceChannel);
      break;
    case 'vc_video_menu':
      await showVideoMenu(interaction, voiceChannel);
      break;
  }
}

export async function handleManageUsersSubmenu(interaction: VCInteraction | ButtonInteraction): Promise<void> {
  const selectedValue = getSelectedValue(interaction);

  if (selectedValue === 'vc_back_main') {
    try {
      await interaction.update({
        content: '⬅️ Voltando ao menu principal...',
        components: [],
      });
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch {
        }
      }, 1500);
    } catch {
      await interaction.deferUpdate();
      await interaction.deleteReply().catch(() => {});
    }
    return;
  }

  const result = await verifyChannelOwner(interaction);
  if (!result) return;
  const { voiceChannel } = result;

  switch (selectedValue) {
    case 'vc_toggle_protection':
      await toggleProtection(interaction, voiceChannel);
      break;
    case 'vc_manage_users_detailed':
      await showManageUsersDetailedMenu(interaction, voiceChannel);
      break;
    case 'vc_allow_user':
      await showAllowUserMenu(interaction, voiceChannel);
      break;
    case 'vc_kick_user':
      await showKickUserMenu(interaction, voiceChannel);
      break;
    case 'vc_block_user':
      await showBlockUserMenu(interaction, voiceChannel);
      break;
    case 'vc_unblock_user':
      await showUnblockUserMenu(interaction, voiceChannel);
      break;
  }
}

export async function handleAdvancedSubmenu(interaction: VCInteraction | ButtonInteraction): Promise<void> {
  const selectedValue = getSelectedValue(interaction);

  if (selectedValue === 'vc_back_main') {
    try {
      await interaction.update({
        content: '⬅️ Voltando ao menu principal...',
        components: [],
      });
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch {
        }
      }, 1500);
    } catch {
      await interaction.deferUpdate();
      await interaction.deleteReply().catch(() => {});
    }
    return;
  }

  const result = await verifyChannelOwner(interaction);
  if (!result) return;
  const { voiceChannel } = result;

  switch (selectedValue) {
    case 'vc_bitrate':
      await showBitrateModal(interaction, voiceChannel);
      break;
    case 'vc_region':
      await showRegionMenu(interaction, voiceChannel);
      break;
    case 'vc_disable_video':
      await disableVideo(interaction, voiceChannel);
      break;
    case 'vc_enable_video':
      await enableVideo(interaction, voiceChannel);
      break;
    case 'vc_disable_screenshare':
      await disableScreenshare(interaction, voiceChannel);
      break;
    case 'vc_enable_screenshare':
      await enableScreenshare(interaction, voiceChannel);
      break;
  }
}

export async function handleOtherSubmenu(interaction: VCInteraction | ButtonInteraction): Promise<void> {
  const selectedValue = getSelectedValue(interaction);

  if (selectedValue === 'vc_back_main') {
    try {
      await interaction.update({
        content: '⬅️ Voltando ao menu principal...',
        components: [],
      });
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch {
        }
      }, 1500);
    } catch {
      await interaction.deferUpdate();
      await interaction.deleteReply().catch(() => {});
    }
    return;
  }

  const result = await verifyChannelOwner(interaction);
  if (!result) return;
  const { voiceChannel } = result;

  switch (selectedValue) {
    case 'vc_user_limit':
      await showUserLimitModal(interaction, voiceChannel);
      break;
    case 'vc_reset_permissions':
      await resetPermissions(interaction, voiceChannel);
      break;
  }
}

async function showVideoMenu(interaction: VCInteraction, _voiceChannel: VoiceChannel): Promise<void> {
  const menuData = VCMessageBuilder.buildVideoMenu();

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(menuData);
  } else {
    await interaction.reply(menuData);
  }
}

async function showRenameModal(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  const modal = VCModalBuilder.buildRenameModal(voiceChannel.id, voiceChannel.name);
  await interaction.showModal(modal);
}

async function lockChannel(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  try {
    await deferEphemeralIfNeeded(interaction);

    const guild = interaction.guild!;
    const everyoneRole = guild.roles.everyone;
    
    const newOverwrites: any[] = [];
    
    const everyoneOverwrite = voiceChannel.permissionOverwrites.cache.get(everyoneRole.id);
    const everyoneDeny = everyoneOverwrite?.deny || new PermissionsBitField();
    const everyoneAllow = everyoneOverwrite?.allow || new PermissionsBitField();
    
    newOverwrites.push({
      id: everyoneRole.id,
      deny: new PermissionsBitField(everyoneDeny).add(PermissionFlagsBits.Connect),
      allow: new PermissionsBitField(everyoneAllow).remove(PermissionFlagsBits.Connect),
    });
    
    for (const [roleId, role] of guild.roles.cache) {
      if (roleId === everyoneRole.id) continue;
      
      if (role.permissions.has(PermissionFlagsBits.Administrator)) continue;
      
      const roleOverwrite = voiceChannel.permissionOverwrites.cache.get(roleId);
      if (roleOverwrite) {
        newOverwrites.push({
          id: roleId,
          deny: new PermissionsBitField(roleOverwrite.deny).add(PermissionFlagsBits.Connect),
          allow: new PermissionsBitField(roleOverwrite.allow).remove(PermissionFlagsBits.Connect),
        });
      } else {
        newOverwrites.push({
          id: roleId,
          deny: new PermissionsBitField().add(PermissionFlagsBits.Connect),
        });
      }
    }
    
    for (const [id, overwrite] of voiceChannel.permissionOverwrites.cache) {
      if (overwrite.type === 1) {
        if (id === interaction.user.id) continue;
        
        newOverwrites.push({
          id: id,
          allow: overwrite.allow,
          deny: overwrite.deny,
        });
      }
    }
    
    newOverwrites.push({
      id: interaction.user.id,
      allow: new PermissionsBitField([PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel]),
    });
    
    await voiceChannel.permissionOverwrites.set(newOverwrites);
    
    await safeRespondEphemeral(
      interaction,
      '🔒 Canal trancado! Apenas você, admins e usuários com permissão explícita podem entrar.\n💡 *Dica: Use "Permitir usuário" para dar acesso a alguém.*'
    );
  } catch (error) {
    logger.error('Erro ao trancar canal:', error as Error);
    await safeRespondEphemeral(
      interaction,
      '❌ Erro ao trancar o canal. Verifique as permissões do bot.'
    );
  }
}

async function unlockChannel(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  try {
    await deferEphemeralIfNeeded(interaction);

    const newOverwrites: any[] = [];
    
    for (const [id, overwrite] of voiceChannel.permissionOverwrites.cache) {
      const newDeny = new PermissionsBitField(overwrite.deny).remove(PermissionFlagsBits.Connect);
      
      const isEmpty = newDeny.bitfield === 0n && 
                      overwrite.allow.bitfield === 0n && 
                      overwrite.type === 0;
      
      if (!isEmpty) {
        newOverwrites.push({
          id: id,
          allow: overwrite.allow,
          deny: newDeny,
        });
      }
      else if (overwrite.type === 1) {
        newOverwrites.push({
          id: id,
          allow: overwrite.allow,
          deny: newDeny,
        });
      }
    }
    
    await voiceChannel.permissionOverwrites.set(newOverwrites);
    
    await safeRespondEphemeral(interaction, '🔓 Canal destrancado! Todos podem entrar novamente.');
  } catch (error) {
    logger.error('Erro ao destrancar canal:', error as Error);
    await safeRespondEphemeral(
      interaction,
      '❌ Erro ao destrancar o canal. Verifique as permissões do bot.'
    );
  }
}

// Esconder canal
async function hideChannel(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  try {
    await deferEphemeralIfNeeded(interaction);

    const guild = interaction.guild!;
    const everyoneRole = guild.roles.everyone;
    
    const newOverwrites: any[] = [];
    
    const everyoneOverwrite = voiceChannel.permissionOverwrites.cache.get(everyoneRole.id);
    const everyoneDeny = everyoneOverwrite?.deny || new PermissionsBitField();
    const everyoneAllow = everyoneOverwrite?.allow || new PermissionsBitField();
    
    newOverwrites.push({
      id: everyoneRole.id,
      deny: new PermissionsBitField(everyoneDeny).add(PermissionFlagsBits.ViewChannel),
      allow: new PermissionsBitField(everyoneAllow).remove(PermissionFlagsBits.ViewChannel),
    });
    
    for (const [roleId, role] of guild.roles.cache) {
      if (roleId === everyoneRole.id) continue;
      
      if (role.permissions.has(PermissionFlagsBits.Administrator)) continue;
      
      const roleOverwrite = voiceChannel.permissionOverwrites.cache.get(roleId);
      if (roleOverwrite) {
        newOverwrites.push({
          id: roleId,
          deny: new PermissionsBitField(roleOverwrite.deny).add(PermissionFlagsBits.ViewChannel),
          allow: new PermissionsBitField(roleOverwrite.allow).remove(PermissionFlagsBits.ViewChannel),
        });
      } else {
        newOverwrites.push({
          id: roleId,
          deny: new PermissionsBitField().add(PermissionFlagsBits.ViewChannel),
        });
      }
    }
    
    for (const [id, overwrite] of voiceChannel.permissionOverwrites.cache) {
      if (overwrite.type === 1) {
        if (id === interaction.user.id) continue;
        
        newOverwrites.push({
          id: id,
          allow: overwrite.allow,
          deny: overwrite.deny,
        });
      }
    }
    
    newOverwrites.push({
      id: interaction.user.id,
      allow: new PermissionsBitField([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]),
    });
    
    await voiceChannel.permissionOverwrites.set(newOverwrites);
    
    await safeRespondEphemeral(
      interaction,
      '👁️ Canal escondido! Apenas você, admins e usuários com permissão podem ver.'
    );
  } catch (error) {
    logger.error('Erro ao esconder canal:', error as Error);
    await safeRespondEphemeral(
      interaction,
      '❌ Erro ao esconder o canal. Verifique as permissões do bot.'
    );
  }
}

async function showChannel(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  try {
    await deferEphemeralIfNeeded(interaction);

    const newOverwrites: any[] = [];
    
    for (const [id, overwrite] of voiceChannel.permissionOverwrites.cache) {
      const newDeny = new PermissionsBitField(overwrite.deny).remove(PermissionFlagsBits.ViewChannel);
      
      const isEmpty = newDeny.bitfield === 0n && 
                      overwrite.allow.bitfield === 0n && 
                      overwrite.type === 0;
      
      if (!isEmpty) {
        newOverwrites.push({
          id: id,
          allow: overwrite.allow,
          deny: newDeny,
        });
      }
      else if (overwrite.type === 1) {
        newOverwrites.push({
          id: id,
          allow: overwrite.allow,
          deny: newDeny,
        });
      }
    }
    
    await voiceChannel.permissionOverwrites.set(newOverwrites);
    
    await safeRespondEphemeral(
      interaction,
      '👁️‍🗨️ Canal visível! Todos podem ver novamente.'
    );
  } catch (error) {
    logger.error('Erro ao mostrar canal:', error as Error);
    await safeRespondEphemeral(
      interaction,
      '❌ Erro ao mostrar o canal. Verifique as permissões do bot.'
    );
  }
}

async function showTransferOwnershipMenu(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  const menuData = VCMessageBuilder.buildTransferOwnershipMenu(voiceChannel.id);

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(menuData);
  } else {
    await interaction.reply(menuData);
  }
}

async function showAllowUserMenu(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  const menuData = VCMessageBuilder.buildAllowUserMenu(voiceChannel.id);

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(menuData);
  } else {
    await interaction.reply(menuData);
  }
}

async function showKickUserMenu(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  const menuData = VCMessageBuilder.buildKickUserMenu(voiceChannel.id);

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(menuData);
  } else {
    await interaction.reply(menuData);
  }
}

async function showBlockUserMenu(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  const menuData = VCMessageBuilder.buildBlockUserMenu(voiceChannel.id);

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(menuData);
  } else {
    await interaction.reply(menuData);
  }
}

async function showUnblockUserMenu(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  const menuData = VCMessageBuilder.buildUnblockUserMenu(voiceChannel.id);

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(menuData);
  } else {
    await interaction.reply(menuData);
  }
}

async function toggleProtection(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  try {
    const ownerId = getChannelOwner(voiceChannel.id);
    if (!ownerId) {
      await interaction.reply({
        content: MESSAGES.ERRORS.ONLY_DYNAMIC_CHANNEL,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    
    const nowProtected = await protectionService.toggleProtection(voiceChannel, ownerId);
    
    if (interaction.guild) {
      UserChannelSettingsService.updateSetting(
        ownerId,
        interaction.guild.id,
        'protectionEnabled',
        nowProtected
      );
    }
    
    const components = [
      new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            nowProtected 
              ? MESSAGES.PROTECTION.ACTIVATED.TITLE
              : MESSAGES.PROTECTION.DEACTIVATED.TITLE
          ),
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            nowProtected 
              ? MESSAGES.PROTECTION.ACTIVATED.DESCRIPTION
              : MESSAGES.PROTECTION.DEACTIVATED.DESCRIPTION
          ),
        ),
    ];
    
    await interaction.update({
      components: components.map(c => c.toJSON()),
      flags: MessageFlags.IsComponentsV2,
    });
    
    logger.info(`Proteção ${nowProtected ? 'ativada' : 'desativada'} no canal ${voiceChannel.name}`);
    
    setTimeout(async () => {
      const { showManageUsersMenu } = await import('./vcSettingsHandler');
      await showManageUsersMenu(interaction as any, voiceChannel);
    }, TIMEOUTS.MENU_RELOAD);
  } catch (error) {
    logger.error('Erro ao alternar proteção:', error as Error);
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: MESSAGES.ERRORS.PERMISSION_DENIED,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: MESSAGES.ERRORS.PERMISSION_DENIED,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}

async function showManageUsersDetailedMenu(interaction: VCInteraction, _voiceChannel: VoiceChannel): Promise<void> {
  const menuData = VCMessageBuilder.buildManageUsersDetailedMenu();

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(menuData);
  } else {
    await interaction.reply(menuData);
  }
}

async function showBitrateModal(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  const modal = VCModalBuilder.buildBitrateModal(voiceChannel.id, voiceChannel.bitrate);
  await interaction.showModal(modal);
}

async function showRegionMenu(interaction: VCInteraction, _voiceChannel: VoiceChannel): Promise<void> {
  await interaction.reply({
    content: '🌍 A região do canal será definida automaticamente para melhor latência. O Discord gerencia isso automaticamente.',
    flags: MessageFlags.Ephemeral,
  });
}

async function disableVideo(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  try {
    await deferEphemeralIfNeeded(interaction);

    const guild = interaction.guild!;
    const everyoneRole = guild.roles.everyone;
    const newOverwrites: any[] = [];
    
    const everyoneOverwrite = voiceChannel.permissionOverwrites.cache.get(everyoneRole.id);
    const everyoneDeny = everyoneOverwrite?.deny || new PermissionsBitField();
    const everyoneAllow = everyoneOverwrite?.allow || new PermissionsBitField();
    
    newOverwrites.push({
      id: everyoneRole.id,
      deny: new PermissionsBitField(everyoneDeny).add(PermissionFlagsBits.Stream),
      allow: new PermissionsBitField(everyoneAllow).remove(PermissionFlagsBits.Stream),
    });
    
    for (const [roleId, role] of guild.roles.cache) {
      if (roleId === everyoneRole.id) continue;
      if (role.permissions.has(PermissionFlagsBits.Administrator)) continue;
      
      const roleOverwrite = voiceChannel.permissionOverwrites.cache.get(roleId);
      if (roleOverwrite) {
        newOverwrites.push({
          id: roleId,
          deny: new PermissionsBitField(roleOverwrite.deny).add(PermissionFlagsBits.Stream),
          allow: new PermissionsBitField(roleOverwrite.allow).remove(PermissionFlagsBits.Stream),
        });
      } else {
        newOverwrites.push({
          id: roleId,
          deny: new PermissionsBitField().add(PermissionFlagsBits.Stream),
        });
      }
    }
    
    for (const [id, overwrite] of voiceChannel.permissionOverwrites.cache) {
      if (overwrite.type === 1) {
        newOverwrites.push({
          id: id,
          allow: overwrite.allow,
          deny: overwrite.deny,
        });
      }
    }
    
    await voiceChannel.permissionOverwrites.set(newOverwrites);
    
    await safeRespondEphemeral(
      interaction,
      '📹🖥️ Câmera e compartilhamento de tela desativados para todos!\n⚠️ *Nota: Admins ainda podem usar. O Discord controla ambos com a mesma permissão.*'
    );
  } catch (error) {
    logger.error('Erro ao desativar vídeo:', error as Error);
    await safeRespondEphemeral(interaction, '❌ Erro ao desativar vídeo.');
  }
}

async function enableVideo(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  try {
    await deferEphemeralIfNeeded(interaction);

    const newOverwrites: any[] = [];
    
    for (const [id, overwrite] of voiceChannel.permissionOverwrites.cache) {
      const newDeny = new PermissionsBitField(overwrite.deny).remove(PermissionFlagsBits.Stream);
      
      const isEmpty = newDeny.bitfield === 0n && overwrite.allow.bitfield === 0n && overwrite.type === 0;
      
      if (!isEmpty) {
        newOverwrites.push({
          id: id,
          allow: overwrite.allow,
          deny: newDeny,
        });
      } else if (overwrite.type === 1) {
        newOverwrites.push({
          id: id,
          allow: overwrite.allow,
          deny: newDeny,
        });
      }
    }
    
    await voiceChannel.permissionOverwrites.set(newOverwrites);
    
    await safeRespondEphemeral(
      interaction,
      '📹🖥️ Câmera e compartilhamento de tela ativados!\n⚠️ *Nota: O Discord controla ambos com a mesma permissão.*'
    );
  } catch (error) {
    logger.error('Erro ao ativar vídeo:', error as Error);
    await safeRespondEphemeral(interaction, '❌ Erro ao ativar vídeo.');
  }
}

async function disableScreenshare(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  await disableVideo(interaction, voiceChannel);
}

async function enableScreenshare(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  await enableVideo(interaction, voiceChannel);
}

async function showUserLimitModal(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  const modal = VCModalBuilder.buildUserLimitModal(voiceChannel.id, voiceChannel.userLimit);
  await interaction.showModal(modal);
}

async function resetPermissions(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  try {
    await deferEphemeralIfNeeded(interaction);

    const guild = interaction.guild!;
    const everyoneRole = guild.roles.everyone;
    const newOverwrites: any[] = [];
    
    let removedUsersCount = 0;
    let removedRolesCount = 0;
    
    newOverwrites.push({
      id: everyoneRole.id,
      allow: new PermissionsBitField(),
      deny: new PermissionsBitField(),
    });
    
    for (const [id, overwrite] of voiceChannel.permissionOverwrites.cache) {
      if (id === everyoneRole.id) continue;
      
      if (overwrite.type === 0) {
        removedRolesCount++;
      } else if (overwrite.type === 1) {
        if (id === interaction.user.id) {
          newOverwrites.push({
            id: id,
            allow: new PermissionsBitField([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.Connect,
            ]),
            deny: new PermissionsBitField(),
          });
        } else {
          removedUsersCount++;
        }
      }
    }
    
    await voiceChannel.permissionOverwrites.set(newOverwrites);
    
    const message = `🔄 Permissões resetadas para o padrão!\n` +
                    `${removedUsersCount > 0 ? `👤 ${removedUsersCount} usuário(s) removido(s)\n` : ''}` +
                    `${removedRolesCount > 0 ? `🎭 ${removedRolesCount} cargo(s) resetado(s)` : ''}`;
    
    await safeRespondEphemeral(interaction, message.trim());
  } catch (error) {
    logger.error('Erro ao resetar permissões:', error as Error);
    await safeRespondEphemeral(interaction, '❌ Erro ao resetar permissões.');
  }
}
