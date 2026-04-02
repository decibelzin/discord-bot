import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types';

const command: Command = {
  name: 'ping',
  description: 'Responde com Pong!',
  execute: async (interaction: ChatInputCommandInteraction) => {
    const reply = await interaction.reply({
      content: "Pong!",
      fetchReply: true,
    });

    const timeDiff = reply.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(
      `Pong! Latência: ${timeDiff}ms | Latência da API: ${Math.round(interaction.client.ws.ping)}ms`,
    );
  },
};

export default command;
