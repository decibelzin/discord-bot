import { Event } from '../types';
import { logger } from '../utils/logger';
import { GuildMember, PartialGuildMember, TextChannel, EmbedBuilder } from 'discord.js';

const event: Event<'guildMemberRemove'> = {
  name: 'guildMemberRemove',
  execute: async (member: GuildMember | PartialGuildMember) => {
    try {
      const guild = member.guild;
      const user = member.user;
      
      if (!user) {
        logger.warn('Membro saiu do servidor mas não foi possível obter informações do usuário');
        return;
      }
      
      // Log no console
      logger.info(`Membro saiu do servidor: ${user.tag} (${user.id}) do servidor ${guild.name} (${guild.id})`);
      
      // Tentar encontrar canal de log
      // Primeiro tenta variável de ambiente
      const logChannelId = process.env.LOG_CHANNEL_ID;
      
      if (logChannelId) {
        try {
          const logChannel = await guild.channels.fetch(logChannelId) as TextChannel | null;
          
          if (logChannel && logChannel.isTextBased()) {
            const embed = new EmbedBuilder()
              .setColor(0xff0000) // Vermelho
              .setTitle('👋 Membro Saiu')
              .setDescription(`${user} saiu do servidor`)
              .addFields(
                { name: 'Usuário', value: `${user.tag} (${user.id})`, inline: true },
                { name: 'Conta criada em', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
                { name: 'Total de membros', value: `${guild.memberCount}`, inline: true }
              )
              .setThumbnail(user.displayAvatarURL({ size: 256 }))
              .setTimestamp();
            
            await logChannel.send({ embeds: [embed] });
            logger.info(`Mensagem de log enviada para o canal ${logChannel.name}`);
          } else {
            logger.warn(`Canal de log ${logChannelId} não encontrado ou não é um canal de texto`);
          }
        } catch (error) {
          logger.error('Erro ao enviar mensagem para canal de log:', error as Error);
        }
      } else {
        logger.info('LOG_CHANNEL_ID não configurado, procurando canal automaticamente...');
        // Se não tem canal configurado, tenta encontrar um canal chamado "left"
        try {
          // Buscar todos os canais do servidor (fetch para garantir que está atualizado)
          await guild.channels.fetch();
          
          // Buscar todos os canais de texto do servidor
          const textChannels = guild.channels.cache.filter(
            (channel) => channel.isTextBased()
          );
          
          logger.info(`Total de canais de texto encontrados: ${textChannels.size}`);
          
          // Procurar primeiro pelo canal exato "left"
          const leftChannel = textChannels.find(
            (channel) => channel.name.toLowerCase() === 'left'
          );
          
          let logChannel: TextChannel | null = null;
          
          if (leftChannel) {
            logChannel = leftChannel as TextChannel;
            logger.info(`✅ Canal de log de saída encontrado: ${logChannel.name} (${logChannel.id})`);
          } else {
            // Fallback: procurar por outros nomes comuns
            const logChannels = textChannels.filter(
              (channel) => {
                const name = channel.name.toLowerCase();
                return name.includes('log') || name.includes('saida') || name.includes('saída');
              }
            );
            
            logger.info(`Canais com 'log', 'saida' ou 'saída' no nome: ${logChannels.size}`);
            
            if (logChannels.size > 0) {
              logChannel = logChannels.first() as TextChannel;
              logger.info(`Canal de log automático encontrado: ${logChannel.name} (${logChannel.id})`);
            } else {
              logger.warn('Nenhum canal de log encontrado automaticamente. Listando todos os canais de texto:');
              textChannels.forEach((channel) => {
                logger.info(`  - ${channel.name} (${channel.id})`);
              });
            }
          }
          
          // Se encontrou um canal, enviar mensagem
          if (logChannel) {
            try {
              const embed = new EmbedBuilder()
                .setColor(0xff0000) // Vermelho
                .setTitle('👋 Membro Saiu')
                .setDescription(`${user} saiu do servidor`)
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
            logger.warn('⚠️ Nenhum canal de log disponível. Configure LOG_CHANNEL_ID no .env ou crie um canal chamado "left" para logs de saída.');
          }
        } catch (error) {
          logger.error('Erro ao procurar/enviar para canal de log automático:', error as Error);
        }
      }
    } catch (error) {
      logger.error('Erro no evento guildMemberRemove:', error as Error);
    }
  },
};

export default event;
