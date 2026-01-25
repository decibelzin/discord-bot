/**
 * Timeouts e delays do bot (em milissegundos)
 */

export const TIMEOUTS = {
  /**
   * Tempo para deletar mensagem automática (10 segundos)
   */
  MESSAGE_AUTO_DELETE: 10000,

  /**
   * Tempo para recarregar menu após ação (2 segundos)
   */
  MENU_RELOAD: 2000,

  /**
   * Delay para voltar ao menu principal (1.5 segundos)
   */
  BACK_TO_MAIN: 1500,

  /**
   * Delay para verificar canal vazio após membro sair (1 segundo)
   */
  CHANNEL_EMPTY_CHECK: 1000,
} as const;
