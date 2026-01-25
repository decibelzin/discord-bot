import { Bot } from './bot';
import { logger } from './utils/logger';

const bot = new Bot();

// Inicializar o bot
bot.initialize().catch((error) => {
  logger.error('Erro fatal ao inicializar o bot:', error);
  process.exit(1);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error as Error);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Recebido SIGINT, desconectando...');
  await bot.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Recebido SIGTERM, desconectando...');
  await bot.destroy();
  process.exit(0);
});
