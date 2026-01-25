import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types';

const command: Command = {
  name: 'ping',
  description: 'Responde com Pong!',
  execute: async (interaction: ChatInputCommandInteraction) => {
    const sent = await interaction.reply({ 
      content: 'Pong!', 
      withResponse: true 
    });
    
    const timeDiff = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(
      `Pong! Latência: ${timeDiff}ms | Latência da API: ${Math.round(interaction.client.ws.ping)}ms`
    );
  },
};

export default command;
