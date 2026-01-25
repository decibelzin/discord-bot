import { Event } from '../types';
import { logger } from '../utils/logger';
import { Guild } from 'discord.js';

const event: Event = {
  name: 'guildDelete',
  execute: async (guild: Guild) => {
    logger.info(`Bot removido do servidor: ${guild.name} (${guild.id})`);
    logger.info(`Total de servidores: ${guild.client.guilds.cache.size}`);
  },
};

export default event;
