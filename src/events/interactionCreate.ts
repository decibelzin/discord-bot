import { Event } from '../types';
import { logger } from '../utils/logger';
import { handleLastMeadowModalSubmit } from '../features/last-meadow/lastMeadowModalHandler';
import { LAST_MEADOW_MODAL_CUSTOM_ID } from '../features/last-meadow/constants';
import { MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, VoiceChannel, UserSelectMenuBuilder, type MessageActionRowComponentBuilder, ContainerBuilder, TextDisplayBuilder, Role, type ClientEvents, type Interaction } from 'discord.js';
import { isDynamicChannel, getChannelOwner } from './voiceStateUpdate';
import { handleMainSettingsMenu } from '../handlers/vcSettingsHandler';
import { handleManageChannelSubmenu, handleManageUsersSubmenu, handleAdvancedSubmenu, handleOtherSubmenu } from '../handlers/vcActionsHandler';
import { handleRenameModal, handleBitrateModal, handleUserLimitModal, handleAllowUser, handleKickUser, handleBlockUser, handleUnblockUser, handleTransferOwnership, handleStatusModal } from '../handlers/vcModalHandlers';
import { CUSTOM_IDS, extractChannelId } from '../constants';

const event: Event<'interactionCreate'> = {
  name: 'interactionCreate',
  execute: async (...args: ClientEvents['interactionCreate']) => {
    const interaction = args[0] as Interaction;
    if (!interaction) return;
    if (interaction.isButton()) {
      const customId = interaction.customId;
      
      if (([
        CUSTOM_IDS.MAIN_PANEL.USER_LIMIT,
        CUSTOM_IDS.MAIN_PANEL.CALL_STATUS,
        CUSTOM_IDS.MAIN_PANEL.MANAGE_USERS,
        CUSTOM_IDS.MAIN_PANEL.TRANSFER_OWNERSHIP,
        CUSTOM_IDS.MAIN_PANEL.MORE_OPTIONS
      ] as readonly string[]).includes(customId)) {
        await handleMainSettingsMenu(interaction);
        return;
      }
      
      if (([
        CUSTOM_IDS.MANAGE_USERS.TOGGLE_PROTECTION,
        CUSTOM_IDS.MANAGE_USERS.DETAILED_MENU
      ] as readonly string[]).includes(customId)) {
        await handleManageUsersSubmenu(interaction);
        return;
      }
      
      if (customId === CUSTOM_IDS.OTHER.JOIN_BUTTON) {
        try {
          if (!interaction.guild || !interaction.member) {
            await interaction.reply({
              content: 'Este botão só funciona em servidores!',
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          const verifiedRole = interaction.guild.roles.cache.find(
            (role: Role) => role.name.toLowerCase() === 'verified'
          );

          if (!verifiedRole) {
            await interaction.reply({
              content: 'O cargo "verified" não foi encontrado no servidor!',
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          const member = await interaction.guild.members.fetch(interaction.user.id);
          
          if (member.roles.cache.has(verifiedRole.id)) {
            await interaction.reply({
              content: 'Você já possui o cargo verified!',
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          await member.roles.add(verifiedRole);
          
          await interaction.reply({
            content: '✅ Cargo verified adicionado com sucesso!',
            flags: MessageFlags.Ephemeral,
          });

          logger.info(`Cargo verified adicionado para ${interaction.user.tag} no servidor ${interaction.guild.name}`);
        } catch (error) {
          logger.error('Erro ao adicionar cargo verified:', error as Error);
          
          const errorMessage = error instanceof Error && error.message.includes('Missing Permissions')
            ? 'Não tenho permissão para adicionar cargos. Verifique as permissões do bot!'
            : 'Ocorreu um erro ao adicionar o cargo. Tente novamente mais tarde.';

          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral });
          } else {
            await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
          }
        }
        return;
      }
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === CUSTOM_IDS.SELECT_MENUS.CONTROL) {
        await handleMainSettingsMenu(interaction);
        return;
      }
      
      if (interaction.customId === CUSTOM_IDS.SELECT_MENUS.SETTINGS_MAIN) {
        await handleMainSettingsMenu(interaction);
        return;
      }
      
      if (interaction.customId === CUSTOM_IDS.SELECT_MENUS.MANAGE_CHANNEL) {
        await handleManageChannelSubmenu(interaction);
        return;
      }
      
      if (interaction.customId === CUSTOM_IDS.SELECT_MENUS.MANAGE_USERS) {
        await handleManageUsersSubmenu(interaction);
        return;
      }
      
      if (interaction.customId === CUSTOM_IDS.SELECT_MENUS.ADVANCED) {
        await handleAdvancedSubmenu(interaction);
        return;
      }
      
      if (interaction.customId === CUSTOM_IDS.SELECT_MENUS.OTHER) {
        await handleOtherSubmenu(interaction);
        return;
      }
      
      if (interaction.customId === '1bb04c5961a745aca08fc7a6a7a0d4d0') {
        try {
          if (!interaction.guild || !interaction.member || !interaction.channel) {
            await interaction.reply({
              content: 'Este menu só funciona em servidores!',
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          const channelId = interaction.channel.id;
          
          const channel = await interaction.guild.channels.fetch(channelId);
          
          if (!channel || channel.type !== ChannelType.GuildVoice) {
            await interaction.reply({
              content: '❌ Este menu só funciona em canais de voz!',
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          const voiceChannel = channel as VoiceChannel;

          if (!isDynamicChannel(voiceChannel.id)) {
            await interaction.reply({
              content: '❌ Este menu só funciona em canais de voz dinâmicos!',
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          // Verificar se o usuário é o dono do canal
          const ownerId = getChannelOwner(voiceChannel.id);
          const member = await interaction.guild.members.fetch(interaction.user.id);
          
          if (ownerId !== member.id) {
            await interaction.reply({
              content: '❌ Apenas o criador do canal pode usar este menu!',
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          const selectedValue = interaction.values[0];

          if (selectedValue === 'e8ee043cd1714f67906c99901bb8568e') {
            const components = [
              new ContainerBuilder()
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent('Selecione o usuário que poderá gerenciar este canal:'),
                )
                .addActionRowComponents(
                  new ActionRowBuilder<MessageActionRowComponentBuilder>()
                    .addComponents(
                      new UserSelectMenuBuilder()
                        .setCustomId(`grant_permissions_${voiceChannel.id}`)
                        .setPlaceholder('Selecione um usuário')
                        .setMinValues(1)
                        .setMaxValues(1),
                    ),
                ),
            ];

            await interaction.reply({
              components: components.map(c => c.toJSON()),
              flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            });
          } else if (selectedValue === '7bb9191485124180fc80e98fcc14c95f') {
            const modal = new ModalBuilder()
              .setCustomId(`user_limit_${voiceChannel.id}`)
              .setTitle('Limite de usuários');

            const userLimitInput = new TextInputBuilder()
              .setCustomId('user_limit_value')
              .setLabel('Limite de usuários (0 = ilimitado)')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('Digite um número entre 0 e 99')
              .setRequired(true)
              .setMinLength(1)
              .setMaxLength(2);

            const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(userLimitInput);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
          }
        } catch (error) {
          logger.error('Erro ao processar select menu de configurações:', error as Error);
          
          const errorMessage = 'Ocorreu um erro ao processar esta ação. Tente novamente.';
          
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral });
          } else {
            await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
          }
        }
      }
      return;
    }

    if (interaction.isUserSelectMenu()) {
      const customId = interaction.customId;
      
      if (customId.startsWith(CUSTOM_IDS.PREFIXES.ALLOW_USER)) {
        const channelId = extractChannelId.fromAllowUser(customId);
        await handleAllowUser(interaction, channelId);
        return;
      }
      
      if (customId.startsWith(CUSTOM_IDS.PREFIXES.KICK_USER)) {
        const channelId = extractChannelId.fromKickUser(customId);
        await handleKickUser(interaction, channelId);
        return;
      }
      
      if (customId.startsWith(CUSTOM_IDS.PREFIXES.BLOCK_USER)) {
        const channelId = extractChannelId.fromBlockUser(customId);
        await handleBlockUser(interaction, channelId);
        return;
      }
      
      if (customId.startsWith(CUSTOM_IDS.PREFIXES.UNBLOCK_USER)) {
        const channelId = extractChannelId.fromUnblockUser(customId);
        await handleUnblockUser(interaction, channelId);
        return;
      }
      
      if (customId.startsWith(CUSTOM_IDS.PREFIXES.TRANSFER_USER)) {
        const channelId = extractChannelId.fromTransferUser(customId);
        await handleTransferOwnership(interaction, channelId);
        return;
      }
      
      if (customId.startsWith('grant_permissions_')) {
        try {
          const channelId = customId.replace('grant_permissions_', '');
          const selectedUser = interaction.values[0];
          
          if (!interaction.guild) {
            await interaction.reply({
              content: 'Este menu só funciona em servidores!',
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          const channel = await interaction.guild.channels.fetch(channelId);
          
          if (!channel || channel.type !== ChannelType.GuildVoice) {
            await interaction.reply({
              content: '❌ Canal não encontrado!',
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          const voiceChannel = channel as VoiceChannel;

          await voiceChannel.permissionOverwrites.edit(selectedUser, {
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
            content: `✅ Permissões concedidas para <@${selectedUser}>!`,
            flags: MessageFlags.Ephemeral,
          });

          logger.info(`Permissões concedidas para ${selectedUser} no canal ${voiceChannel.name}`);
        } catch (error) {
          logger.error('Erro ao conceder permissões:', error as Error);
          
          await interaction.reply({
            content: '❌ Erro ao conceder permissões. Verifique as permissões do bot.',
            flags: MessageFlags.Ephemeral,
          });
        }
        return;
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === LAST_MEADOW_MODAL_CUSTOM_ID) {
        await handleLastMeadowModalSubmit(interaction);
        return;
      }

      const customId = interaction.customId;
      
      if (customId.startsWith(CUSTOM_IDS.PREFIXES.MODAL_STATUS)) {
        const channelId = extractChannelId.fromModalStatus(customId);
        await handleStatusModal(interaction, channelId);
        return;
      }
      
      if (customId.startsWith(CUSTOM_IDS.PREFIXES.MODAL_RENAME)) {
        const channelId = extractChannelId.fromModalRename(customId);
        await handleRenameModal(interaction, channelId);
        return;
      }
      
      if (customId.startsWith(CUSTOM_IDS.PREFIXES.MODAL_BITRATE)) {
        const channelId = extractChannelId.fromModalBitrate(customId);
        await handleBitrateModal(interaction, channelId);
        return;
      }
      
      if (customId.startsWith(CUSTOM_IDS.PREFIXES.MODAL_LIMIT)) {
        const channelId = extractChannelId.fromModalLimit(customId);
        await handleUserLimitModal(interaction, channelId);
        return;
      }
      
      if (customId.startsWith('user_limit_')) {
        try {
          const channelId = customId.replace('user_limit_', '');
          const userLimitValue = interaction.fields.getTextInputValue('user_limit_value');
          
          if (!interaction.guild) {
            await interaction.reply({
              content: 'Este modal só funciona em servidores!',
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          const limit = parseInt(userLimitValue);
          
          if (isNaN(limit) || limit < 0 || limit > 99) {
            await interaction.reply({
              content: '❌ O limite deve ser um número entre 0 e 99!',
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          const channel = await interaction.guild.channels.fetch(channelId);
          
          if (!channel || channel.type !== ChannelType.GuildVoice) {
            await interaction.reply({
              content: '❌ Canal não encontrado!',
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          const voiceChannel = channel as VoiceChannel;

          await voiceChannel.setUserLimit(limit);

          const limitText = limit === 0 ? 'ilimitado' : limit.toString();
          await interaction.reply({
            content: `✅ Limite de usuários definido para: ${limitText}`,
            flags: MessageFlags.Ephemeral,
          });

          logger.info(`Limite de usuários definido para ${limit} no canal ${voiceChannel.name}`);
        } catch (error) {
          logger.error('Erro ao definir limite de usuários:', error as Error);
          
          await interaction.reply({
            content: '❌ Erro ao definir limite de usuários. Verifique as permissões do bot.',
            flags: MessageFlags.Ephemeral,
          });
        }
        return;
      }
    }

    if (!interaction.isChatInputCommand()) return;

    const command = (interaction.client as any).commands?.get(interaction.commandName);

    if (!command) {
      logger.warn(`Comando ${interaction.commandName} não encontrado`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Erro ao executar comando ${interaction.commandName}:`, error as Error);
      
      const reply: { content: string; flags: typeof MessageFlags.Ephemeral } = {
        content: 'Ocorreu um erro ao executar este comando!',
        flags: MessageFlags.Ephemeral,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};

export default event;
