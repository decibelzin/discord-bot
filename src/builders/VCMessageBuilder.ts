import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  UserSelectMenuBuilder,
  type MessageActionRowComponentBuilder,
  MessageFlags,
} from 'discord.js';
import { MESSAGES, CUSTOM_IDS } from '../constants';

export class VCMessageBuilder {
  static buildControlPanel(channelName: string, memberMention: string) {
    return {
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              MESSAGES.DYNAMIC_CHANNEL.CONTROL_PANEL_TITLE(channelName) + '\n\n' +
              MESSAGES.DYNAMIC_CHANNEL.CONTROL_PANEL_WELCOME(memberMention)
            ),
          )
          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
          )
          .addActionRowComponents(
            new ActionRowBuilder<MessageActionRowComponentBuilder>()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId(CUSTOM_IDS.MAIN_PANEL.USER_LIMIT)
                  .setLabel(MESSAGES.LABELS.USER_LIMIT)
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId(CUSTOM_IDS.MAIN_PANEL.CALL_STATUS)
                  .setLabel(MESSAGES.LABELS.CALL_STATUS)
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId(CUSTOM_IDS.MAIN_PANEL.MANAGE_USERS)
                  .setLabel(MESSAGES.LABELS.MANAGE_USERS)
                  .setStyle(ButtonStyle.Secondary),
              ),
            new ActionRowBuilder<MessageActionRowComponentBuilder>()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId(CUSTOM_IDS.MAIN_PANEL.TRANSFER_OWNERSHIP)
                  .setLabel(MESSAGES.LABELS.TRANSFER_OWNERSHIP)
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId(CUSTOM_IDS.MAIN_PANEL.MORE_OPTIONS)
                  .setLabel(MESSAGES.LABELS.MORE_OPTIONS)
                  .setStyle(ButtonStyle.Secondary),
              ),
          ),
      ].map(c => c.toJSON()),
      flags: MessageFlags.IsComponentsV2,
    };
  }
  
  static buildProtectionMessage(memberMention: string) {
    return {
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              MESSAGES.PROTECTION.NO_PERMISSION(memberMention)
            ),
          ),
      ].map(c => c.toJSON()),
      flags: MessageFlags.IsComponentsV2,
    };
  }
  
  static buildManageUsersMenu(isProtected: boolean) {
    return {
      components: [
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
      ].map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    };
  }
  
  static buildSuccessMessage(message: string) {
    return {
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(message),
          ),
      ].map(c => c.toJSON()),
      flags: MessageFlags.IsComponentsV2,
    };
  }
  
  static buildErrorMessage(message: string) {
    return {
      content: message,
      flags: MessageFlags.Ephemeral,
    };
  }
  
  static buildTextMessage(content: string, ephemeral: boolean = false) {
    return {
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(content),
          ),
      ].map(c => c.toJSON()),
      flags: ephemeral 
        ? MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
        : MessageFlags.IsComponentsV2,
    };
  }
  
  static buildVideoMenu() {
    return {
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('**Câmera e Screen Share**\nEscolha uma opção:'),
          )
          .addActionRowComponents(
            new ActionRowBuilder<MessageActionRowComponentBuilder>()
              .addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId('vc_submenu_advanced')
                  .setPlaceholder('Selecione uma opção')
                  .addOptions(
                    new StringSelectMenuOptionBuilder()
                      .setLabel('Bloquear câmera')
                      .setValue('vc_disable_video')
                      .setDescription('Impedir uso de webcam'),
                    new StringSelectMenuOptionBuilder()
                      .setLabel('Liberar câmera')
                      .setValue('vc_enable_video')
                      .setDescription('Permitir uso de webcam'),
                    new StringSelectMenuOptionBuilder()
                      .setLabel('Bloquear screen share')
                      .setValue('vc_disable_screenshare')
                      .setDescription('Impedir compartilhamento de tela'),
                    new StringSelectMenuOptionBuilder()
                      .setLabel('Liberar screen share')
                      .setValue('vc_enable_screenshare')
                      .setDescription('Permitir compartilhamento de tela'),
                    new StringSelectMenuOptionBuilder()
                      .setLabel('Voltar')
                      .setValue('vc_back_main')
                      .setDescription('Voltar'),
                  ),
              ),
          ),
      ].map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    };
  }
  
  static buildTransferOwnershipMenu(channelId: string) {
    return {
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('**Transferir Propriedade**\nSelecione o novo dono do canal:'),
          )
          .addActionRowComponents(
            new ActionRowBuilder<MessageActionRowComponentBuilder>()
              .addComponents(
                new UserSelectMenuBuilder()
                  .setCustomId(`vc_transfer_${channelId}`)
                  .setPlaceholder('Selecione o novo dono')
                  .setMinValues(1)
                  .setMaxValues(1),
              ),
          ),
      ].map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    };
  }
  
  static buildAllowUserMenu(channelId: string) {
    return {
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(MESSAGES.MENUS.SELECT_USER_TO_ALLOW),
          )
          .addActionRowComponents(
            new ActionRowBuilder<MessageActionRowComponentBuilder>()
              .addComponents(
                new UserSelectMenuBuilder()
                  .setCustomId(`vc_allow_${channelId}`)
                  .setPlaceholder('Selecione um usuário')
                  .setMinValues(1)
                  .setMaxValues(1),
              ),
          ),
      ].map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    };
  }
  
  static buildKickUserMenu(channelId: string) {
    return {
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(MESSAGES.MENUS.SELECT_USER_TO_KICK),
          )
          .addActionRowComponents(
            new ActionRowBuilder<MessageActionRowComponentBuilder>()
              .addComponents(
                new UserSelectMenuBuilder()
                  .setCustomId(`vc_kick_${channelId}`)
                  .setPlaceholder('Selecione um usuário')
                  .setMinValues(1)
                  .setMaxValues(1),
              ),
          ),
      ].map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    };
  }
  
  static buildBlockUserMenu(channelId: string) {
    return {
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(MESSAGES.MENUS.SELECT_USER_TO_BLOCK),
          )
          .addActionRowComponents(
            new ActionRowBuilder<MessageActionRowComponentBuilder>()
              .addComponents(
                new UserSelectMenuBuilder()
                  .setCustomId(`vc_block_${channelId}`)
                  .setPlaceholder('Selecione um usuário')
                  .setMinValues(1)
                  .setMaxValues(1),
              ),
          ),
      ].map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    };
  }
  
  static buildUnblockUserMenu(channelId: string) {
    return {
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(MESSAGES.MENUS.SELECT_USER_TO_UNBLOCK),
          )
          .addActionRowComponents(
            new ActionRowBuilder<MessageActionRowComponentBuilder>()
              .addComponents(
                new UserSelectMenuBuilder()
                  .setCustomId(`vc_unblock_${channelId}`)
                  .setPlaceholder('Selecione um usuário')
                  .setMinValues(1)
                  .setMaxValues(1),
              ),
          ),
      ].map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    };
  }
  
  static buildManageUsersDetailedMenu() {
    return {
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(MESSAGES.MENUS.MANAGE_USERS_DETAILED),
          )
          .addActionRowComponents(
            new ActionRowBuilder<MessageActionRowComponentBuilder>()
              .addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId('vc_submenu_manage_users')
                  .setPlaceholder('Selecione uma opção')
                  .addOptions(
                    new StringSelectMenuOptionBuilder()
                      .setLabel(MESSAGES.LABELS.ADD_USER)
                      .setValue('vc_allow_user')
                      .setDescription(MESSAGES.DESCRIPTIONS.ADD_USER),
                    new StringSelectMenuOptionBuilder()
                      .setLabel(MESSAGES.LABELS.BLOCK_USER)
                      .setValue('vc_block_user')
                      .setDescription(MESSAGES.DESCRIPTIONS.BLOCK_USER),
                    new StringSelectMenuOptionBuilder()
                      .setLabel(MESSAGES.LABELS.UNBLOCK_USER)
                      .setValue('vc_unblock_user')
                      .setDescription(MESSAGES.DESCRIPTIONS.UNBLOCK_USER),
                    new StringSelectMenuOptionBuilder()
                      .setLabel(MESSAGES.LABELS.KICK_USER)
                      .setValue('vc_kick_user')
                      .setDescription(MESSAGES.DESCRIPTIONS.KICK_USER),
                    new StringSelectMenuOptionBuilder()
                      .setLabel(MESSAGES.LABELS.BACK)
                      .setValue('vc_back_main')
                      .setDescription(MESSAGES.DESCRIPTIONS.BACK),
                  ),
              ),
          ),
      ].map(c => c.toJSON()),
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    };
  }
}
