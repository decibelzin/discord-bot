import { Client, Collection } from 'discord.js';
import { ExtendedClient } from './types';
import { config } from './config/config';
import { loadCommands } from './handlers/commandHandler';
import { loadEvents } from './handlers/eventHandler';
import { loadFeatures } from './handlers/featureHandler';
import { logger } from './utils/logger';
import { loadData as loadVCCreatorData } from './commands/vccreator';
import { loadDynamicChannelsData, cleanupEmptyDynamicChannels } from './events/voiceStateUpdate';

export class Bot {
  public client: ExtendedClient;

  constructor() {
    this.client = new Client({ intents: config.intents }) as ExtendedClient;
    this.client.commands = new Collection();
    this.client.features = new Map();
  }

  public async initialize(): Promise<void> {
    try {
      // Carregar dados persistentes antes de tudo
      logger.info('Carregando dados persistentes...');
      loadVCCreatorData();
      loadDynamicChannelsData();
      
      // Carregar handlers na ordem correta
      await loadEvents(this.client);
      await loadCommands(this.client);
      await loadFeatures(this.client);
      
      // Conectar ao Discord
      await this.client.login(config.token);
      
      // Aguardar o bot estar pronto
      await new Promise<void>((resolve) => {
        this.client.once('clientReady', () => resolve());
      });
      
      // Limpar canais dinâmicos vazios após conectar
      logger.info('Executando limpeza de canais dinâmicos...');
      await cleanupEmptyDynamicChannels(this.client);
      logger.info('Bot totalmente inicializado e pronto!');
    } catch (error) {
      logger.error('Erro ao inicializar o bot:', error as Error);
      process.exit(1);
    }
  }

  public async destroy(): Promise<void> {
    this.client.destroy();
    logger.info('Bot desconectado');
  }
}
