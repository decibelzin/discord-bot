import { ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, MessageFlags, ChannelType, MediaGalleryBuilder, MediaGalleryItemBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, type MessageActionRowComponentBuilder, ContainerBuilder } from 'discord.js';
import { Command } from '../types';
import { logger } from '../utils/logger';

const command: Command = {
  name: 'nuke',
  description: 'Clona o canal atual e deleta o antigo',
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        content: '❌ Você não tem permissão para usar este comando! Apenas administradores podem usar.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!interaction.guild || !interaction.channel || !(interaction.channel instanceof TextChannel)) {
      await interaction.reply({
        content: 'Este comando só funciona em canais de texto de servidores!',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const oldChannel = interaction.channel;
    const channelName = oldChannel.name;
    const channelPosition = oldChannel.position;
    const channelParent = oldChannel.parent;
    const channelTopic = oldChannel.topic;
    const channelNSFW = oldChannel.nsfw;
    const channelRateLimitPerUser = oldChannel.rateLimitPerUser;
    const channelPermissions = oldChannel.permissionOverwrites.cache;

    try {
      await interaction.reply({
        content: '🔄 Clonando canal...',
        flags: MessageFlags.Ephemeral,
      });

      const newChannel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        position: channelPosition,
        parent: channelParent?.id || undefined,
        topic: channelTopic || undefined,
        nsfw: channelNSFW,
        rateLimitPerUser: channelRateLimitPerUser || undefined,
        permissionOverwrites: channelPermissions.map(overwrite => ({
          id: overwrite.id,
          type: overwrite.type,
          allow: overwrite.allow,
          deny: overwrite.deny,
        })),
        reason: `Canal clonado por ${interaction.user.tag} usando /nuke`,
      });

      const components = [
        new ContainerBuilder()
          .addMediaGalleryComponents(
            new MediaGalleryBuilder()
              .addItems(
                new MediaGalleryItemBuilder()
                  .setURL("https://media4.giphy.com/media/v1.Y2lkPTZjMDliOTUyeWdzd2h1OWdiMWNiang3d25samxqdmYwNHdzZGNqdmc2cWJmZzNuOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/qwGcDfEAGdJWmuSnwh/giphy.gif"),
              ),
          ),
        new ActionRowBuilder<MessageActionRowComponentBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setLabel(`Nuked por ${interaction.user.username}`)
              .setCustomId('nuke_disabled_button')
              .setDisabled(true),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setLabel('Esta mensagem será deletada em 10 segundos')
              .setCustomId('nuke_auto_delete_info')
              .setDisabled(true),
          ),
      ];

      const nukeMessage = await newChannel.send({
        components: components.map(c => c.toJSON()),
        flags: MessageFlags.IsComponentsV2,
      });

      setTimeout(async () => {
        try {
          await nukeMessage.delete();
        } catch {
        }
      }, 10000);

      await interaction.editReply({
        content: `✅ Canal clonado com sucesso! Novo canal: ${newChannel}`,
      });

      await oldChannel.delete(`Canal nuked por ${interaction.user.tag}`);

      logger.info(`${interaction.user.tag} fez nuke no canal ${channelName} (${oldChannel.id}) -> ${newChannel.id}`);
    } catch (error) {
      logger.error('Erro ao fazer nuke no canal:', error as Error);
      
      const errorMessage = error instanceof Error && error.message.includes('Missing Permissions')
        ? '❌ Não tenho permissão para criar/deletar canais. Verifique as permissões do bot!'
        : '❌ Ocorreu um erro ao fazer nuke no canal. Tente novamente mais tarde.';

      try {
        await interaction.editReply({
          content: errorMessage,
        });
      } catch {
        logger.warn('Não foi possível editar a resposta da interação');
      }
    }
  },
};

export default command;
