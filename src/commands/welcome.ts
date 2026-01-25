import { ChatInputCommandInteraction, MediaGalleryBuilder, MediaGalleryItemBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, type MessageActionRowComponentBuilder, ContainerBuilder, MessageFlags, PermissionFlagsBits, TextChannel } from 'discord.js';
import { Command } from '../types';

const command: Command = {
  name: 'welcome',
  description: 'Envia uma mensagem de boas-vindas',
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        content: '❌ Você não tem permissão para usar este comando! Apenas administradores podem usar.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!interaction.channel) {
      await interaction.reply({
        content: 'Este comando só funciona em canais!',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const components = [
      new ContainerBuilder()
        .addMediaGalleryComponents(
          new MediaGalleryBuilder()
            .addItems(
              new MediaGalleryItemBuilder()
                .setURL("https://media.discordapp.net/attachments/1464847688158675019/1464847724338745558/IMG_7021-ezgif.com-video-to-gif-converter.gif?ex=6976f541&is=6975a3c1&hm=34b460f73745b9976f3321fc7974e43edb7fcc13dc02ed9274086eb16c197f25&="),
            ),
        )
        .addActionRowComponents(
          new ActionRowBuilder<MessageActionRowComponentBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("follow terms of use")
                .setURL("https://discord.com/terms"),
            ),
        ),
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("join")
            .setCustomId("c37cd7568d704a009385ff8b51518801"),
        ),
    ];

    await (interaction.channel as TextChannel).send({
      components: components.map(c => c.toJSON()),
      flags: MessageFlags.IsComponentsV2,
    });

    await interaction.reply({
      content: '✅ Mensagem de boas-vindas enviada!',
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
