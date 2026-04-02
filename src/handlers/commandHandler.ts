import { Collection, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Command, ExtendedClient } from '../types';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export async function loadCommands(client: ExtendedClient): Promise<void> {
  client.commands = new Collection();
  const commands: SlashCommandBuilder[] = [];
  const commandsPath = join(__dirname, '../commands');
  
  try {
    const commandFiles = readdirSync(commandsPath).filter(
      (file) =>
        !file.endsWith(".d.ts") && (file.endsWith(".js") || file.endsWith(".ts")),
    );

    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const command: Command = await import(filePath).then(m => m.default || m);
      
      if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
        
        // Criar SlashCommandBuilder para registro
        const slashCommand = new SlashCommandBuilder()
          .setName(command.name)
          .setDescription(command.description);
        
        if (command.options) {
          command.options.forEach((option: any) => {
            if (option.type === 'string') {
              slashCommand.addStringOption((opt: any) => {
                opt.setName(option.name)
                   .setDescription(option.description)
                   .setRequired(option.required || false);
                return opt;
              });
            } else if (option.type === 'number') {
              slashCommand.addNumberOption((opt: any) => {
                opt.setName(option.name)
                   .setDescription(option.description)
                   .setRequired(option.required || false);
                return opt;
              });
            } else if (option.type === 'boolean') {
              slashCommand.addBooleanOption((opt: any) => {
                opt.setName(option.name)
                   .setDescription(option.description)
                   .setRequired(option.required || false);
                return opt;
              });
            } else if (option.type === 'user') {
              slashCommand.addUserOption((opt: any) => {
                opt.setName(option.name)
                   .setDescription(option.description)
                   .setRequired(option.required || false);
                return opt;
              });
            } else if (option.type === 'channel') {
              slashCommand.addChannelOption((opt: any) => {
                opt.setName(option.name)
                   .setDescription(option.description)
                   .setRequired(option.required || false);
                return opt;
              });
            } else if (option.type === 'role') {
              slashCommand.addRoleOption((opt: any) => {
                opt.setName(option.name)
                   .setDescription(option.description)
                   .setRequired(option.required || false);
                return opt;
              });
            }
          });
        }
        
        commands.push(slashCommand);
        logger.info(`Comando carregado: ${command.name}`);
      } else {
        logger.warn(`O comando em ${file} está faltando propriedades obrigatórias.`);
      }
    }

    // Registrar comandos no Discord
    await registerCommands(commands);
  } catch (error) {
    logger.error('Erro ao carregar comandos:', error as Error);
  }
}

async function registerCommands(commands: SlashCommandBuilder[]): Promise<void> {
  try {
    const rest = new REST().setToken(config.token);
    const commandsData = commands.map(cmd => cmd.toJSON());

    logger.info(`Registrando ${commandsData.length} comandos...`);

    if (config.guildId) {
      // Registrar comandos em uma guild específica (mais rápido para desenvolvimento)
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: commandsData }
      );
      logger.info(`Comandos registrados na guild ${config.guildId}`);
    } else {
      // Registrar comandos globalmente
      await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: commandsData }
      );
      logger.info('Comandos registrados globalmente');
    }
  } catch (error) {
    logger.error('Erro ao registrar comandos:', error as Error);
  }
}
