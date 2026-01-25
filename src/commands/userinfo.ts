import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types';

const command: Command = {
  name: 'userinfo',
  description: 'Mostra informações sobre um usuário',
  options: [
    {
      name: 'user',
      description: 'O usuário sobre o qual você quer informações',
      type: 'user',
      required: false,
    },
  ],
  execute: async (interaction: ChatInputCommandInteraction) => {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild?.members.cache.get(user.id);

    const embed = {
      color: 0x0099ff,
      title: `Informações de ${user.username}`,
      thumbnail: {
        url: user.displayAvatarURL({ dynamic: true }),
      },
      fields: [
        {
          name: 'ID',
          value: user.id,
          inline: true,
        },
        {
          name: 'Tag',
          value: user.tag,
          inline: true,
        },
        {
          name: 'Conta criada em',
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: `Solicitado por ${interaction.user.tag}`,
      },
    };

    if (member) {
      embed.fields.push(
        {
          name: 'Entrou no servidor em',
          value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>` : 'Desconhecido',
          inline: false,
        },
        {
          name: 'Roles',
          value: member.roles.cache.map(role => role.toString()).join(', ') || 'Nenhum',
          inline: false,
        }
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
