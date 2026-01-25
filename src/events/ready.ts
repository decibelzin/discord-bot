import { Event } from '../types';
import { logger } from '../utils/logger';

const event: Event = {
  name: 'clientReady',
  once: true,
  execute: (client) => {
    logger.info(`Bot conectado como ${client.user?.tag}!`);
    logger.info(`Bot está em ${client.guilds.cache.size} servidores`);
    
    // Definir status do bot
    client.user?.setActivity('Desenvolvendo features incríveis!', { type: 'WATCHING' });
  },
};

export default event;
