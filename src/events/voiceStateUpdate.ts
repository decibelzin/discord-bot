import { Event } from '../types';
import { VoiceState, ChannelType, VoiceChannel, PermissionFlagsBits, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, type MessageActionRowComponentBuilder, ContainerBuilder, MessageFlags, ButtonBuilder, ButtonStyle } from 'discord.js';
import { logger } from '../utils/logger';
import { getVCCreator } from '../commands/vccreator';
import { MESSAGES, CUSTOM_IDS, TIMEOUTS, OWNER_PERMISSIONS } from '../constants';
import { UserChannelSettingsService } from '../services';
import * as fs from 'fs';
import * as path from 'path';

const DYNAMIC_CHANNELS_FILE = path.join(process.cwd(), 'data', 'dynamicChannels.json');

interface DynamicChannelData {
  ownerId: string;
  creatorChannelId: string;
  guildId: string;
}

const dynamicChannels = new Map<string, DynamicChannelData>();

function saveData(): void {
  try {
    const dataDir = path.dirname(DYNAMIC_CHANNELS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const data = Object.fromEntries(dynamicChannels.entries());
    fs.writeFileSync(DYNAMIC_CHANNELS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    logger.error('Erro ao salvar dados de canais dinâmicos:', error as Error);
  }
}

export function loadDynamicChannelsData(): void {
  try {
    if (fs.existsSync(DYNAMIC_CHANNELS_FILE)) {
      const data = fs.readFileSync(DYNAMIC_CHANNELS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      
      Object.entries(parsed).forEach(([channelId, channelData]) => {
        dynamicChannels.set(channelId, channelData as DynamicChannelData);
      });
      
      logger.info(`Canais dinâmicos carregados: ${dynamicChannels.size} canal(is)`);
    } else {
      logger.info('Nenhum canal dinâmico salvo encontrado');
    }
  } catch (error) {
    logger.error('Erro ao carregar dados de canais dinâmicos:', error as Error);
  }
}

export async function cleanupEmptyDynamicChannels(client: any): Promise<void> {
  logger.info('Verificando canais dinâmicos...');
  
  const channelsToRemove: string[] = [];
  
  for (const [channelId, channelData] of dynamicChannels.entries()) {
    try {
      const guild = await client.guilds.fetch(channelData.guildId);
      if (!guild) {
        logger.warn(`Servidor ${channelData.guildId} não encontrado, removendo canal ${channelId}`);
        channelsToRemove.push(channelId);
        continue;
      }

      const channel = await guild.channels.fetch(channelId).catch(() => null);
      
      if (!channel) {
        logger.info(`Canal ${channelId} não existe mais, removendo do registro`);
        channelsToRemove.push(channelId);
        continue;
      }

      if (channel.type !== ChannelType.GuildVoice) {
        logger.warn(`Canal ${channelId} não é mais um canal de voz, removendo`);
        channelsToRemove.push(channelId);
        continue;
      }

      const voiceChannel = channel as VoiceChannel;
      const membersInChannel = voiceChannel.members.size;

      if (membersInChannel === 0) {
        logger.info(`Deletando canal vazio: ${voiceChannel.name} (${channelId})`);
        await voiceChannel.delete('Canal dinâmico vazio após reinicialização do bot');
        channelsToRemove.push(channelId);
      } else {
        logger.info(`Canal ${voiceChannel.name} mantido (${membersInChannel} pessoa(s) conectada(s))`);
      }
    } catch (error) {
      logger.error(`Erro ao verificar canal ${channelId}:`, error as Error);
      channelsToRemove.push(channelId);
    }
  }

  channelsToRemove.forEach(channelId => {
    dynamicChannels.delete(channelId);
  });

  if (channelsToRemove.length > 0) {
    saveData();
    logger.info(`${channelsToRemove.length} canal(is) dinâmico(s) removido(s)`);
  }

  logger.info(`Limpeza concluída. ${dynamicChannels.size} canal(is) dinâmico(s) ativo(s)`);
}

export function isDynamicChannel(channelId: string): boolean {
  return dynamicChannels.has(channelId);
}

export function registerDynamicChannel(channelId: string, ownerId: string, creatorChannelId: string, guildId: string): void {
  dynamicChannels.set(channelId, {
    ownerId,
    creatorChannelId,
    guildId,
  });
  saveData();
}

export function unregisterDynamicChannel(channelId: string): void {
  dynamicChannels.delete(channelId);
  saveData();
}

export function getChannelOwner(channelId: string): string | undefined {
  return dynamicChannels.get(channelId)?.ownerId;
}

export function setChannelOwner(channelId: string, ownerId: string): void {
  const channelData = dynamicChannels.get(channelId);
  if (channelData) {
    channelData.ownerId = ownerId;
    dynamicChannels.set(channelId, channelData);
    saveData();
  }
}

const event: Event = {
  name: 'voiceStateUpdate',
  execute: async (oldState: VoiceState, newState: VoiceState) => {
    try {
      const guild = newState.guild || oldState.guild;
      if (!guild) return;

      const oldChannel = oldState.channel;
      const newChannel = newState.channel;
      const member = newState.member || oldState.member;
      
      if (!member) return;

      if (newChannel && newChannel.type === ChannelType.GuildVoice) {
        const creatorChannelId = getVCCreator(guild.id);
        
        if (creatorChannelId === newChannel.id) {
          try {
            const userSettings = UserChannelSettingsService.get(member.id, guild.id);
            
            const userName = member.displayName || member.user.username;
            const channelName = userSettings?.channelName || `${userName}'s Call`;
            
            const permissionOverwrites = [
              {
                id: guild.roles.everyone.id,
                allow: [PermissionFlagsBits.Connect],
              },
              {
                id: member.id,
                allow: OWNER_PERMISSIONS,
              },
            ];

            const channelOptions: any = {
              name: channelName,
              type: ChannelType.GuildVoice,
              parent: newChannel.parent?.id || undefined,
              permissionOverwrites: permissionOverwrites,
              reason: `Canal criado automaticamente para ${member.user.tag}`,
            };

            if (userSettings?.bitrate) {
              channelOptions.bitrate = userSettings.bitrate * 1000;
            }

            if (userSettings?.userLimit !== undefined) {
              channelOptions.userLimit = userSettings.userLimit;
            }

            const newDynamicChannel = await guild.channels.create(channelOptions);

            if (userSettings?.status) {
              try {
                const endpoint = `/channels/${newDynamicChannel.id}/voice-status` as `/channels/${string}/voice-status`;
                await (guild.client as any).rest.put(endpoint, {
                  body: { status: userSettings.status },
                });
              } catch (statusError) {
                logger.debug('Status não aplicado (pode não estar disponível):', statusError as Error);
              }
            }

            if (userSettings?.protectionEnabled) {
              try {
                const { protectionService } = await import('../services');
                await protectionService.enableProtection(newDynamicChannel as VoiceChannel, member.id);
              } catch (protectionError) {
                logger.warn('Não foi possível aplicar proteção ao canal:', protectionError as Error);
              }
            }

            await member.voice.setChannel(newDynamicChannel.id);

            registerDynamicChannel(newDynamicChannel.id, member.id, creatorChannelId, guild.id);

            const components = [
              new ContainerBuilder()
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    MESSAGES.DYNAMIC_CHANNEL.CONTROL_PANEL_TITLE(newDynamicChannel.name) + '\n\n' +
                    MESSAGES.DYNAMIC_CHANNEL.CONTROL_PANEL_WELCOME(member.toString())
                  ),
                )
                .addSeparatorComponents(
                  new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                )
                .addActionRowComponents(
                  // Primeira linha de botões
                  new ActionRowBuilder<MessageActionRowComponentBuilder>()
                    .addComponents(
                      new ButtonBuilder()
                        .setCustomId(CUSTOM_IDS.MAIN_PANEL.USER_LIMIT)
                        .setLabel(MESSAGES.LABELS.USER_LIMIT)
                        .setStyle(ButtonStyle.Secondary),
                      new ButtonBuilder()
                        .setCustomId(CUSTOM_IDS.MAIN_PANEL.CALL_STATUS)
                        .setLabel(MESSAGES.LABELS.CALL_STATUS)
                        .setStyle(ButtonStyle.Secondary),
                      new ButtonBuilder()
                        .setCustomId(CUSTOM_IDS.MAIN_PANEL.MANAGE_USERS)
                        .setLabel(MESSAGES.LABELS.MANAGE_USERS)
                        .setStyle(ButtonStyle.Secondary),
                    ),
                  // Segunda linha de botões
                  new ActionRowBuilder<MessageActionRowComponentBuilder>()
                    .addComponents(
                      new ButtonBuilder()
                        .setCustomId(CUSTOM_IDS.MAIN_PANEL.TRANSFER_OWNERSHIP)
                        .setLabel(MESSAGES.LABELS.TRANSFER_OWNERSHIP)
                        .setStyle(ButtonStyle.Secondary),
                      new ButtonBuilder()
                        .setCustomId(CUSTOM_IDS.MAIN_PANEL.MORE_OPTIONS)
                        .setLabel(MESSAGES.LABELS.MORE_OPTIONS)
                        .setStyle(ButtonStyle.Secondary),
                    ),
                ),
            ];

            // Enviar mensagem no canal de voz (chat integrado)
            try {
              await (newDynamicChannel as any).send({
                components: components.map(c => c.toJSON()),
                flags: MessageFlags.IsComponentsV2,
              });
            } catch (sendError) {
              logger.error('Não foi possível enviar mensagem de controle no canal de voz:', sendError as Error);
            }

            logger.info(`Canal dinâmico criado: ${newDynamicChannel.name} (${newDynamicChannel.id}) para ${member.user.tag}`);
          } catch (error) {
            logger.error('Erro ao criar canal dinâmico:', error as Error);
          }
        }
      }

      // Verificar proteção de canal dinâmico (auto-kick de usuários sem permissão)
      if (newChannel && newChannel.type === ChannelType.GuildVoice && isDynamicChannel(newChannel.id) && oldChannel?.id !== newChannel.id) {
        // Usuário entrou em um canal dinâmico
        try {
          const everyoneRole = guild.roles.everyone;
          const everyonePerms = newChannel.permissionOverwrites.cache.get(everyoneRole.id);
          const isProtected = everyonePerms?.deny.has(PermissionFlagsBits.Connect) || false;
          
          if (isProtected) {
            // Canal está protegido, verificar se o usuário tem permissão
            const ownerId = getChannelOwner(newChannel.id);
            const isOwner = ownerId === member.id;
            const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
            
            // Verificar permissões explícitas do usuário
            const userPerms = newChannel.permissionOverwrites.cache.get(member.id);
            const hasExplicitAllow = userPerms?.allow.has(PermissionFlagsBits.Connect) || false;
            
            // Se não é dono, não é admin e não tem permissão explícita, desconectar
            if (!isOwner && !isAdmin && !hasExplicitAllow) {
              // Enviar mensagem no chat do canal ANTES de desconectar
              try {
                const components = [
                  new ContainerBuilder()
                    .addTextDisplayComponents(
                      new TextDisplayBuilder().setContent(
                        MESSAGES.PROTECTION.NO_PERMISSION(member.toString())
                      ),
                    ),
                ];
                
                const message = await (newChannel as any).send({
                  components: components.map(c => c.toJSON()),
                  flags: MessageFlags.IsComponentsV2,
                });
                
                // Deletar mensagem após timeout configurado
                setTimeout(async () => {
                  try {
                    await message.delete();
                  } catch {
                  }
                }, TIMEOUTS.MESSAGE_AUTO_DELETE);
              } catch (sendError) {
                logger.error('Erro ao enviar mensagem de bloqueio no canal:', sendError as Error);
              }
              
              await member.voice.disconnect('Canal protegido - sem permissão para entrar');
              
              logger.info(`Usuário ${member.user.tag} foi desconectado de ${newChannel.name} (canal protegido)`);
            }
          }
        } catch (error) {
          logger.error('Erro ao verificar proteção de canal:', error as Error);
        }
      }

      if (oldChannel && oldChannel.type === ChannelType.GuildVoice && isDynamicChannel(oldChannel.id)) {
        setTimeout(async () => {
          try {
            const channel = await guild.channels.fetch(oldChannel.id) as VoiceChannel | null;
            
            if (!channel || channel.type !== ChannelType.GuildVoice) {
              unregisterDynamicChannel(oldChannel.id);
              return;
            }

            const membersInChannel = channel.members.size;

            if (membersInChannel === 0) {
              await channel.delete(`Canal dinâmico vazio - todos os membros saíram`);
              unregisterDynamicChannel(oldChannel.id);
              logger.info(`Canal dinâmico deletado: ${channel.name} (${channel.id}) - estava vazio`);
            }
          } catch (error) {
            if (error instanceof Error && error.message.includes('Unknown Channel')) {
              unregisterDynamicChannel(oldChannel.id);
            } else {
              logger.error('Erro ao verificar/deletar canal dinâmico vazio:', error as Error);
            }
          }
        }, TIMEOUTS.CHANNEL_EMPTY_CHECK);
      }
    } catch (error) {
      logger.error('Erro no evento voiceStateUpdate:', error as Error);
    }
  },
};

export default event;
