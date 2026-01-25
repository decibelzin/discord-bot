import { Event } from '../types';
import { logger } from '../utils/logger';
import { GuildMember, TextChannel, EmbedBuilder } from 'discord.js';

const event: Event<'guildMemberAdd'> = {
  name: 'guildMemberAdd',
  execute: async (member: GuildMember) => {
    try {
      const guild = member.guild;
      const user = member.user;
      
      // Log no console
      logger.info(`Membro entrou no servidor: ${user.tag} (${user.id}) no servidor ${guild.name} (${guild.id})`);
      
      // Tentar encontrar canal de log
      // Primeiro tenta variável de ambiente
      const logChannelId = process.env.LOG_CHANNEL_ID;
      
      let logChannel: TextChannel | null = null;
      
      if (logChannelId) {
        logger.info(`Tentando usar canal de log configurado: ${logChannelId}`);
        try {
          const fetchedChannel = await guild.channels.fetch(logChannelId);
          
          if (fetchedChannel && fetchedChannel.isTextBased()) {
            logChannel = fetchedChannel as TextChannel;
            logger.info(`Canal de log encontrado: ${logChannel.name} (${logChannel.id})`);
          } else {
            logger.warn(`Canal de log ${logChannelId} não encontrado ou não é um canal de texto`);
          }
        } catch (error) {
          logger.error('Erro ao buscar canal de log configurado:', error as Error);
        }
      } else {
        logger.info('LOG_CHANNEL_ID não configurado, procurando canal automaticamente...');
        // Se não tem canal configurado, tenta encontrar um canal chamado "log" ou "logs"
        try {
          // Buscar todos os canais do servidor (fetch para garantir que está atualizado)
          await guild.channels.fetch();
          
          // Buscar todos os canais de texto do servidor
          const textChannels = guild.channels.cache.filter(
            (channel) => channel.isTextBased()
          );
          
          logger.info(`Total de canais de texto encontrados: ${textChannels.size}`);
          
          const logChannels = textChannels.filter(
            (channel) => {
              const name = channel.name.toLowerCase();
              return name.includes('log') || name.includes('entrada') || name.includes('welcome');
            }
          );
          
          logger.info(`Canais com 'log', 'entrada' ou 'welcome' no nome: ${logChannels.size}`);
          
          if (logChannels.size > 0) {
            logChannel = logChannels.first() as TextChannel;
            logger.info(`Canal de log automático encontrado: ${logChannel.name} (${logChannel.id})`);
          } else {
            logger.warn('Nenhum canal de log encontrado automaticamente. Listando todos os canais de texto:');
            textChannels.forEach((channel) => {
              logger.info(`  - ${channel.name} (${channel.id})`);
            });
          }
        } catch (error) {
          logger.error('Erro ao procurar canal de log automático:', error as Error);
        }
      }
      
      // Se encontrou um canal, enviar mensagem
      if (logChannel) {
        try {
          const embed = new EmbedBuilder()
            .setColor(0x00ff00) // Verde
            .setTitle('👤 Novo Membro')
            .setDescription(`${user} entrou no servidor`)
            .addFields(
              { name: 'Usuário', value: `${user.tag} (${user.id})`, inline: true },
              { name: 'Conta criada em', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
              { name: 'Total de membros', value: `${guild.memberCount}`, inline: true }
            )
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .setTimestamp();
          
          await logChannel.send({ embeds: [embed] });
          logger.info(`✅ Mensagem de log enviada com sucesso para o canal ${logChannel.name} (${logChannel.id})`);
        } catch (error) {
          logger.error(`Erro ao enviar mensagem para o canal ${logChannel.name}:`, error as Error);
          if (error instanceof Error) {
            logger.error(`Detalhes do erro: ${error.message}`);
          }
        }
      } else {
        logger.warn('⚠️ Nenhum canal de log disponível. Configure LOG_CHANNEL_ID no .env ou crie um canal com "log", "entrada" ou "welcome" no nome.');
      }
    } catch (error) {
      logger.error('Erro no evento guildMemberAdd:', error as Error);
    }
  },
};

export default event;
