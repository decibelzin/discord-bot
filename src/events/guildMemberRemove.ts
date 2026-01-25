import { Event } from '../types';
import { logger } from '../utils/logger';
import { GuildMember, TextChannel, EmbedBuilder } from 'discord.js';

const event: Event<'guildMemberRemove'> = {
  name: 'guildMemberRemove',
  execute: async (member: GuildMember) => {
    try {
      const guild = member.guild;
      const user = member.user;
      
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
        // Se não tem canal configurado, tenta encontrar um canal chamado "log" ou "saida"
        try {
          const logChannels = guild.channels.cache.filter(
            (channel) => 
              channel.isTextBased() && 
              (channel.name.toLowerCase().includes('log') || channel.name.toLowerCase().includes('saida') || channel.name.toLowerCase().includes('saída'))
          );
          
          if (logChannels.size > 0) {
            const logChannel = logChannels.first() as TextChannel;
            const embed = new EmbedBuilder()
              .setColor(0xff0000)
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
