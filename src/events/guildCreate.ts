import { Event } from '../types';
import { logger } from '../utils/logger';
import { Guild } from 'discord.js';

const event: Event<'guildCreate'> = {
  name: 'guildCreate',
  execute: async (guild: Guild) => {
    logger.info(`Bot adicionado ao servidor: ${guild.name} (${guild.id})`);
    logger.info(`Total de servidores: ${guild.client.guilds.cache.size}`);
  },
};

export default event;
