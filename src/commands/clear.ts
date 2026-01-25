import { ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, MessageFlags } from 'discord.js';
import { Command } from '../types';
import { logger } from '../utils/logger';

const command: Command = {
  name: 'clear',
  description: 'Limpa mensagens do canal',
  options: [
    {
      name: 'quantidade',
      description: 'Quantidade de mensagens para deletar (1-100)',
      type: 'number',
      required: true,
    },
  ],
  execute: async (interaction: ChatInputCommandInteraction) => {
    // Verificar permissão de gerenciar mensagens
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      await interaction.reply({
        content: '❌ Você não tem permissão para usar este comando! Você precisa da permissão "Gerenciar Mensagens".',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!interaction.channel || !(interaction.channel instanceof TextChannel)) {
      await interaction.reply({
        content: 'Este comando só funciona em canais de texto!',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const quantidade = interaction.options.getNumber('quantidade', true);

    // Validar quantidade
    if (quantidade < 1 || quantidade > 100) {
      await interaction.reply({
        content: '❌ A quantidade deve ser entre 1 e 100 mensagens!',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      // Responder primeiro (ephemeral) para que o comando não seja deletado
      await interaction.reply({
        content: `🔄 Deletando ${quantidade} mensagem(ns)...`,
        flags: MessageFlags.Ephemeral,
      });

      // Deletar mensagens (sem incluir o comando, pois já respondemos)
      const deleted = await interaction.channel.bulkDelete(quantidade, true);

      // Atualizar a resposta
      await interaction.editReply({
        content: `✅ ${deleted.size} mensagem(ns) deletada(s) com sucesso!`,
      });

      logger.info(`${interaction.user.tag} deletou ${deleted.size} mensagens no canal ${interaction.channel.name}`);
    } catch (error) {
      logger.error('Erro ao deletar mensagens:', error as Error);
      
      const errorMessage = error instanceof Error && error.message.includes('You can only bulk delete messages that are under 14 days old')
        ? '❌ Só é possível deletar mensagens com menos de 14 dias!'
        : '❌ Ocorreu um erro ao deletar as mensagens. Tente novamente mais tarde.';

      await interaction.reply({
        content: errorMessage,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default command;
