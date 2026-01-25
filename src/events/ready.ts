import { Event } from '../types';
import { logger } from '../utils/logger';

const event: Event = {
  name: 'clientReady',
  once: true,
  execute: (client) => {
    logger.info(`Bot conectado como ${client.user?.tag}!`);
    logger.info(`Bot está em ${client.guilds.cache.size} servidores`);
    
    // Verificar se eventos importantes estão registrados
    const eventNames = client.eventNames();
    if (eventNames.includes('guildMemberAdd')) {
      logger.info('✅ Evento guildMemberAdd está registrado');
    } else {
      logger.warn('⚠️ Evento guildMemberAdd NÃO está registrado! Verifique se o arquivo existe e foi carregado.');
    }
    
    if (eventNames.includes('guildMemberRemove')) {
      logger.info('✅ Evento guildMemberRemove está registrado');
    } else {
      logger.warn('⚠️ Evento guildMemberRemove NÃO está registrado! Verifique se o arquivo existe e foi carregado.');
    }
    
    // Verificar intents
    const intents = client.options.intents;
    if (intents?.has('GuildMembers')) {
      logger.info('✅ Intent GuildMembers está habilitada');
    } else {
      logger.warn('⚠️ Intent GuildMembers NÃO está habilitada! Os eventos guildMemberAdd e guildMemberRemove não funcionarão.');
    }
    
    // Definir status do bot
    client.user?.setActivity('Desenvolvendo features incríveis!', { type: 'WATCHING' });
  },
};

export default event;
