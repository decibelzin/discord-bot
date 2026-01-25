import { 
  StringSelectMenuInteraction, 
  ButtonInteraction, 
  MessageFlags, 
  ContainerBuilder, 
  TextDisplayBuilder, 
  StringSelectMenuBuilder, 
  StringSelectMenuOptionBuilder, 
  ActionRowBuilder, 
  type MessageActionRowComponentBuilder, 
  ChannelType, 
  VoiceChannel, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  PermissionFlagsBits, 
  ButtonBuilder, 
  ButtonStyle, 
  SeparatorBuilder, 
  SeparatorSpacingSize 
} from 'discord.js';
import { logger } from '../utils/logger';
import { isDynamicChannel, getChannelOwner } from '../events/voiceStateUpdate';
import { handleManageChannelSubmenu, handleOtherSubmenu } from './vcActionsHandler';
import { 
  MESSAGES, 
  CUSTOM_IDS, 
  LIMITS, 
  createDynamicId 
} from '../constants';

type VCInteraction = StringSelectMenuInteraction | ButtonInteraction;

export async function handleMainSettingsMenu(interaction: VCInteraction): Promise<void> {
  try {
    const selectedValue = interaction.isButton() 
      ? interaction.customId 
      : interaction.values[0];
    
    if (!interaction.guild || !interaction.member || !interaction.channel) {
      await interaction.reply({
        content: MESSAGES.ERRORS.ONLY_SERVERS,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const channelId = interaction.channel.id;
    const channel = interaction.guild.channels.cache.get(channelId) || 
                   await interaction.guild.channels.fetch(channelId);
    
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      await interaction.reply({
        content: MESSAGES.ERRORS.ONLY_VOICE_CHANNEL,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const voiceChannel = channel as VoiceChannel;

    if (!isDynamicChannel(voiceChannel.id)) {
      await interaction.reply({
        content: MESSAGES.ERRORS.ONLY_DYNAMIC_CHANNEL,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const ownerId = getChannelOwner(voiceChannel.id);
    
    if (!ownerId || ownerId !== interaction.user.id) {
      await interaction.reply({
        content: MESSAGES.ERRORS.ONLY_OWNER,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    
    if (selectedValue === CUSTOM_IDS.MAIN_PANEL.USER_LIMIT) {
      await handleOtherSubmenu(interaction);
    } else if (selectedValue === CUSTOM_IDS.MAIN_PANEL.CALL_STATUS) {
      await showCallStatusModal(interaction, voiceChannel);
    } else if (selectedValue === CUSTOM_IDS.MAIN_PANEL.MANAGE_USERS) {
      await showManageUsersMenu(interaction, voiceChannel);
    } else if (selectedValue === CUSTOM_IDS.MAIN_PANEL.TRANSFER_OWNERSHIP) {
      await handleManageChannelSubmenu(interaction);
    } else if (selectedValue === CUSTOM_IDS.NAVIGATION.ADVANCED_MENU) {
      await showAdvancedSettingsMenu(interaction, voiceChannel);
    } else if (selectedValue === CUSTOM_IDS.MAIN_PANEL.MORE_OPTIONS) {
      await showMoreOptionsMenu(interaction, voiceChannel);
    } else if (selectedValue === CUSTOM_IDS.CHANNEL_ACTIONS.RESET_PERMISSIONS) {
      await handleOtherSubmenu(interaction);
    }
    else if (selectedValue === CUSTOM_IDS.NAVIGATION.MANAGE_CHANNEL) {
      await showManageChannelMenu(interaction, voiceChannel);
    } else if (selectedValue === CUSTOM_IDS.NAVIGATION.MANAGE_USERS) {
      await showManageUsersMenu(interaction, voiceChannel);
    } else if (selectedValue === CUSTOM_IDS.NAVIGATION.ADVANCED_SETTINGS) {
      await showAdvancedSettingsMenu(interaction, voiceChannel);
    } else if (selectedValue === CUSTOM_IDS.NAVIGATION.OTHER_OPTIONS) {
      await showOtherOptionsMenu(interaction, voiceChannel);
    }
  } catch (error) {
    logger.error('Erro ao processar menu principal de configurações:', error as Error);
    
    const errorMessage = MESSAGES.ERRORS.GENERIC;
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
    }
  }
}

async function showCallStatusModal(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId(createDynamicId.modalStatus(voiceChannel.id))
    .setTitle('Status da Call');
  
  const statusInput = new TextInputBuilder()
    .setCustomId('channel_status')
    .setLabel('Status do canal de voz')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Digite o status do canal (ex: "Jogando Valorant")...')
    .setRequired(false)
    .setMaxLength(LIMITS.VOICE_CHANNEL.STATUS_MAX_LENGTH);

  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(statusInput));
  await interaction.showModal(modal);
}

async function showManageChannelMenu(interaction: VCInteraction, _voiceChannel: VoiceChannel): Promise<void> {
  const components = [
    new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(MESSAGES.MENUS.MANAGE_CHANNEL),
      )
      .addActionRowComponents(
        new ActionRowBuilder<MessageActionRowComponentBuilder>()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(CUSTOM_IDS.SELECT_MENUS.MANAGE_CHANNEL)
              .setPlaceholder('Selecione uma opção')
              .addOptions(
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.RENAME_CHANNEL)
                  .setValue(CUSTOM_IDS.CHANNEL_ACTIONS.RENAME)
                  .setDescription(MESSAGES.DESCRIPTIONS.RENAME_CHANNEL),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.LOCK_CHANNEL)
                  .setValue(CUSTOM_IDS.CHANNEL_ACTIONS.LOCK)
                  .setDescription(MESSAGES.DESCRIPTIONS.LOCK_CHANNEL),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.UNLOCK_CHANNEL)
                  .setValue(CUSTOM_IDS.CHANNEL_ACTIONS.UNLOCK)
                  .setDescription(MESSAGES.DESCRIPTIONS.UNLOCK_CHANNEL),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.HIDE_CHANNEL)
                  .setValue(CUSTOM_IDS.CHANNEL_ACTIONS.HIDE)
                  .setDescription(MESSAGES.DESCRIPTIONS.HIDE_CHANNEL),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.SHOW_CHANNEL)
                  .setValue(CUSTOM_IDS.CHANNEL_ACTIONS.SHOW)
                  .setDescription(MESSAGES.DESCRIPTIONS.SHOW_CHANNEL),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.TRANSFER_OWNERSHIP)
                  .setValue(CUSTOM_IDS.MAIN_PANEL.TRANSFER_OWNERSHIP)
                  .setDescription(MESSAGES.DESCRIPTIONS.TRANSFER_OWNERSHIP),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.BACK)
                  .setValue(CUSTOM_IDS.NAVIGATION.BACK_MAIN)
                  .setDescription(MESSAGES.DESCRIPTIONS.BACK_TO_MAIN),
              ),
          ),
      ),
  ];

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({
      components: components.map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
  } else {
    await interaction.reply({
      components: components.map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
  }
}

async function showManageUsersMenu(interaction: VCInteraction, voiceChannel: VoiceChannel): Promise<void> {
  const everyoneRole = voiceChannel.guild.roles.everyone;
  const everyonePerms = voiceChannel.permissionOverwrites.cache.get(everyoneRole.id);
  const isProtected = everyonePerms?.deny.has(PermissionFlagsBits.Connect) || false;
  
  const components = [
    new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(MESSAGES.MENUS.MANAGE_USERS),
        new TextDisplayBuilder().setContent(
          MESSAGES.DYNAMIC_CHANNEL.PROTECTION_STATUS(isProtected)
        ),
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          isProtected 
            ? MESSAGES.PROTECTION.STATUS_PROTECTED
            : MESSAGES.PROTECTION.STATUS_UNPROTECTED
        ),
      )
      .addActionRowComponents(
        new ActionRowBuilder<MessageActionRowComponentBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(CUSTOM_IDS.MANAGE_USERS.TOGGLE_PROTECTION)
              .setLabel(isProtected 
                ? MESSAGES.LABELS.DEACTIVATE_PROTECTION 
                : MESSAGES.LABELS.ACTIVATE_PROTECTION
              )
              .setStyle(isProtected ? ButtonStyle.Danger : ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(CUSTOM_IDS.MANAGE_USERS.DETAILED_MENU)
              .setLabel(MESSAGES.LABELS.MANAGE_USERS_BUTTON)
              .setStyle(ButtonStyle.Secondary),
          ),
      ),
  ];

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({
      components: components.map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
  } else {
    await interaction.reply({
      components: components.map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
  }
}

async function showMoreOptionsMenu(interaction: VCInteraction, _voiceChannel: VoiceChannel): Promise<void> {
  const components = [
    new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(MESSAGES.MENUS.MORE_OPTIONS),
      )
      .addActionRowComponents(
        new ActionRowBuilder<MessageActionRowComponentBuilder>()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(CUSTOM_IDS.SELECT_MENUS.MANAGE_CHANNEL)
              .setPlaceholder('Selecione uma opção')
              .addOptions(
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.RENAME_CHANNEL)
                  .setValue(CUSTOM_IDS.CHANNEL_ACTIONS.RENAME)
                  .setDescription(MESSAGES.DESCRIPTIONS.RENAME_CHANNEL),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.LOCK_CHANNEL)
                  .setValue(CUSTOM_IDS.CHANNEL_ACTIONS.LOCK)
                  .setDescription(MESSAGES.DESCRIPTIONS.LOCK_CHANNEL),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.UNLOCK_CHANNEL)
                  .setValue(CUSTOM_IDS.CHANNEL_ACTIONS.UNLOCK)
                  .setDescription(MESSAGES.DESCRIPTIONS.UNLOCK_CHANNEL),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.HIDE_CHANNEL)
                  .setValue(CUSTOM_IDS.CHANNEL_ACTIONS.HIDE)
                  .setDescription(MESSAGES.DESCRIPTIONS.HIDE_CHANNEL),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.SHOW_CHANNEL)
                  .setValue(CUSTOM_IDS.CHANNEL_ACTIONS.SHOW)
                  .setDescription(MESSAGES.DESCRIPTIONS.SHOW_CHANNEL),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.ADJUST_BITRATE)
                  .setValue(CUSTOM_IDS.CHANNEL_ACTIONS.BITRATE)
                  .setDescription(MESSAGES.DESCRIPTIONS.ADJUST_BITRATE),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.VIDEO_CONTROLS)
                  .setValue(CUSTOM_IDS.CHANNEL_ACTIONS.VIDEO_MENU)
                  .setDescription(MESSAGES.DESCRIPTIONS.VIDEO_CONTROLS),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.RESET_PERMISSIONS)
                  .setValue(CUSTOM_IDS.CHANNEL_ACTIONS.RESET_PERMISSIONS)
                  .setDescription(MESSAGES.DESCRIPTIONS.RESET_PERMISSIONS),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.BACK)
                  .setValue(CUSTOM_IDS.NAVIGATION.BACK_MAIN)
                  .setDescription(MESSAGES.DESCRIPTIONS.BACK_TO_MAIN),
              ),
          ),
      ),
  ];

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({
      components: components.map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
  } else {
    await interaction.reply({
      components: components.map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
  }
}

async function showAdvancedSettingsMenu(interaction: VCInteraction, _voiceChannel: VoiceChannel): Promise<void> {
  const components = [
    new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(MESSAGES.MENUS.ADVANCED_SETTINGS),
      )
      .addActionRowComponents(
        new ActionRowBuilder<MessageActionRowComponentBuilder>()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(CUSTOM_IDS.SELECT_MENUS.ADVANCED)
              .setPlaceholder('Selecione uma opção')
              .addOptions(
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.BLOCK_VIDEO)
                  .setValue(CUSTOM_IDS.VIDEO_ACTIONS.DISABLE_VIDEO)
                  .setDescription(MESSAGES.DESCRIPTIONS.BLOCK_VIDEO),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.ENABLE_VIDEO)
                  .setValue(CUSTOM_IDS.VIDEO_ACTIONS.ENABLE_VIDEO)
                  .setDescription(MESSAGES.DESCRIPTIONS.ENABLE_VIDEO),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.BLOCK_SCREENSHARE)
                  .setValue(CUSTOM_IDS.VIDEO_ACTIONS.DISABLE_SCREENSHARE)
                  .setDescription(MESSAGES.DESCRIPTIONS.BLOCK_SCREENSHARE),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.ENABLE_SCREENSHARE)
                  .setValue(CUSTOM_IDS.VIDEO_ACTIONS.ENABLE_SCREENSHARE)
                  .setDescription(MESSAGES.DESCRIPTIONS.ENABLE_SCREENSHARE),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.BACK)
                  .setValue(CUSTOM_IDS.NAVIGATION.BACK_MAIN)
                  .setDescription(MESSAGES.DESCRIPTIONS.BACK_TO_MAIN),
              ),
          ),
      ),
  ];

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({
      components: components.map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
  } else {
    await interaction.reply({
      components: components.map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
  }
}

async function showOtherOptionsMenu(interaction: VCInteraction, _voiceChannel: VoiceChannel): Promise<void> {
  const components = [
    new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(MESSAGES.MENUS.OTHER_OPTIONS),
      )
      .addActionRowComponents(
        new ActionRowBuilder<MessageActionRowComponentBuilder>()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(CUSTOM_IDS.SELECT_MENUS.OTHER)
              .setPlaceholder('Selecione uma opção')
              .addOptions(
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.USER_LIMIT)
                  .setValue(CUSTOM_IDS.MAIN_PANEL.USER_LIMIT)
                  .setDescription(MESSAGES.DESCRIPTIONS.USER_LIMIT),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.RESET_PERMISSIONS)
                  .setValue(CUSTOM_IDS.CHANNEL_ACTIONS.RESET_PERMISSIONS)
                  .setDescription(MESSAGES.DESCRIPTIONS.RESET_PERMISSIONS),
                new StringSelectMenuOptionBuilder()
                  .setLabel(MESSAGES.LABELS.BACK)
                  .setValue(CUSTOM_IDS.NAVIGATION.BACK_MAIN)
                  .setDescription(MESSAGES.DESCRIPTIONS.BACK_TO_MAIN),
              ),
          ),
      ),
  ];

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({
      components: components.map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
  } else {
    await interaction.reply({
      components: components.map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
  }
}

export { showManageChannelMenu, showManageUsersMenu, showAdvancedSettingsMenu, showOtherOptionsMenu, showCallStatusModal, showMoreOptionsMenu };
