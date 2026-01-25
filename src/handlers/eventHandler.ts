import { readdirSync } from 'fs';
import { join } from 'path';
import { ExtendedClient, Event } from '../types';
import { logger } from '../utils/logger';

export async function loadEvents(client: ExtendedClient): Promise<void> {
  const eventsPath = join(__dirname, '../events');
  
  try {
    const eventFiles = readdirSync(eventsPath).filter(file => 
      file.endsWith('.ts') || file.endsWith('.js')
    );

    for (const file of eventFiles) {
      const filePath = join(eventsPath, file);
      const event: Event = await import(filePath).then(m => m.default || m);
      
      if ('name' in event && 'execute' in event) {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args));
        } else {
          client.on(event.name, (...args) => event.execute(...args));
        }
        logger.info(`Evento carregado: ${event.name}`);
      } else {
        logger.warn(`O evento em ${file} está faltando propriedades obrigatórias.`);
      }
    }
  } catch (error) {
    logger.error('Erro ao carregar eventos:', error as Error);
  }
}
