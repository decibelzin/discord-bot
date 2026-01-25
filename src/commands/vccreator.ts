import { ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags, ChannelType, VoiceChannel, GuildChannel } from 'discord.js';
import { Command } from '../types';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'vcCreators.json');

const vcCreators = new Map<string, string>();

let dataLoaded = false;

export function loadData(): void {
  if (dataLoaded) return;
  
  try {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      
      Object.entries(parsed).forEach(([guildId, channelId]) => {
        vcCreators.set(guildId, channelId as string);
      });
      
      logger.info(`Canais criadores carregados: ${vcCreators.size} servidor(es)`);
    } else {
      logger.info('Nenhum canal criador salvo encontrado');
    }
    
    dataLoaded = true;
  } catch (error) {
    logger.error('Erro ao carregar dados de canais criadores:', error as Error);
  }
}

function saveData(): void {
  try {
    const data = Object.fromEntries(vcCreators.entries());
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    logger.error('Erro ao salvar dados de canais criadores:', error as Error);
  }
}

export function getVCCreator(guildId: string): string | undefined {
  return vcCreators.get(guildId);
}

export function setVCCreator(guildId: string, channelId: string): void {
  vcCreators.set(guildId, channelId);
  saveData();
}

export function removeVCCreator(guildId: string): void {
  vcCreators.delete(guildId);
  saveData();
}

const command: Command = {
  name: 'vccreator',
  description: 'Define qual canal de voz será o criador de outros canais de voz',
  options: [
    {
      name: 'channel',
      description: 'O canal de voz que será o criador (opcional - se não especificado, tenta detectar automaticamente)',
      type: 'channel',
      required: false,
    },
  ],
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        content: '❌ Você não tem permissão para usar este comando! Apenas administradores podem usar.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!interaction.guild || !interaction.channel) {
      await interaction.reply({
        content: 'Este comando só funciona em servidores!',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const specifiedChannel = interaction.options.getChannel('channel');
    let targetVoiceChannel: VoiceChannel | null = null;

    if (specifiedChannel) {
      if (specifiedChannel.type !== ChannelType.GuildVoice) {
        await interaction.reply({
          content: '❌ O canal especificado deve ser um canal de voz!',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      targetVoiceChannel = specifiedChannel as VoiceChannel;
    } else {
      const currentChannel = interaction.channel as GuildChannel;
      const parentCategory = currentChannel?.parent;

      if (parentCategory) {
        const voiceChannels = parentCategory.children.cache.filter(
          (channel: any) => channel.type === ChannelType.GuildVoice
        );
        
        if (voiceChannels.size === 1) {
          targetVoiceChannel = voiceChannels.first() as VoiceChannel;
        } else if (voiceChannels.size > 1) {
          const currentChannelName = currentChannel.name.toLowerCase();
          const matchingChannel = voiceChannels.find((ch: any) => {
            const voiceCh = ch as VoiceChannel;
            return voiceCh.name.toLowerCase() === currentChannelName || 
              voiceCh.name.toLowerCase().includes(currentChannelName) ||
              currentChannelName.includes(voiceCh.name.toLowerCase());
          }) as VoiceChannel | undefined;

          if (matchingChannel) {
            targetVoiceChannel = matchingChannel;
          } else {
            await interaction.reply({
              content: '❌ Encontrei múltiplos canais de voz nesta categoria. Por favor, use o parâmetro `channel` para especificar qual canal de voz deseja definir como criador, ou execute este comando no chat de texto do canal de voz desejado.',
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
        }
      }

      if (!targetVoiceChannel) {
        await interaction.reply({
          content: '❌ Não foi possível encontrar um canal de voz associado. Por favor, use o parâmetro `channel` para especificar qual canal de voz deseja definir como criador.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    const existingCreator = getVCCreator(interaction.guild.id);
    
    if (existingCreator === targetVoiceChannel.id) {
      removeVCCreator(interaction.guild.id);
      await interaction.reply({
        content: `✅ Canal criador removido: ${targetVoiceChannel.name}`,
        flags: MessageFlags.Ephemeral,
      });
      logger.info(`Canal criador removido no servidor ${interaction.guild.name}: ${targetVoiceChannel.name}`);
    } else {
      setVCCreator(interaction.guild.id, targetVoiceChannel.id);
      await interaction.reply({
        content: `✅ Canal criador definido: ${targetVoiceChannel.name}\n\nAgora, quando usuários entrarem neste canal, será criado automaticamente um novo canal de voz com o nome deles.`,
        flags: MessageFlags.Ephemeral,
      });
      logger.info(`Canal criador definido no servidor ${interaction.guild.name}: ${targetVoiceChannel.name} (${targetVoiceChannel.id})`);
    }
  },
};

export default command;
