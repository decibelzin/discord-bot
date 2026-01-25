export const MESSAGES = {
  PROTECTION: {
    ACTIVATED: {
      TITLE: '## ✅ Proteção Ativada',
      DESCRIPTION: '🔒 **Apenas usuários permitidos podem entrar.**',
    },
    DEACTIVATED: {
      TITLE: '## ✅ Proteção Desativada',
      DESCRIPTION: '🔓 **Todos podem entrar no canal agora.**',
    },
    NO_PERMISSION: (mention: string) => `${mention}, você não tem permissão para entrar nesse canal.`,
    STATUS_PROTECTED: '✅ **A call está protegida, apenas usuários permitidos podem entrar.**',
    STATUS_UNPROTECTED: '⚠️ **A call está sem proteção, todos podem entrar.**',
  },

  // Erros gerais
  ERRORS: {
    CHANNEL_NOT_FOUND: '❌ Canal não encontrado!',
    ONLY_OWNER: '❌ Apenas o criador do canal pode fazer isso!',
    ONLY_DYNAMIC_CHANNEL: '❌ Este comando só funciona em canais dinâmicos!',
    ONLY_VOICE_CHANNEL: '❌ Este menu só funciona em canais de voz!',
    ONLY_SERVERS: 'Este menu só funciona em servidores!',
    PERMISSION_DENIED: '❌ Erro ao processar. Verifique as permissões do bot.',
    GENERIC: 'Ocorreu um erro ao processar esta ação. Tente novamente.',
    USER_NOT_FOUND: '❌ Usuário não encontrado no servidor!',
    USER_NOT_IN_CHANNEL: '❌ Este usuário não está no canal!',
    CANNOT_MANAGE_BOTS: '❌ Não é possível gerenciar bots!',
    CANNOT_BLOCK_YOURSELF: '❌ Você não pode bloquear a si mesmo!',
    CANNOT_TRANSFER_TO_BOT: '❌ Não é possível transferir propriedade para bots!',
    ALREADY_OWNER: '❌ Você já é o dono do canal!',
    BOT_NO_PERMISSION: '❌ O bot não tem permissão para realizar esta ação!',
    RATE_LIMIT: '❌ Você está fazendo isso muito rápido! Aguarde alguns segundos.',
    ENDPOINT_UNAVAILABLE: '❌ Este endpoint não está disponível. O Discord pode ter desabilitado esta funcionalidade.',
    // Operation-specific errors
    RENAME_FAILED: '❌ Erro ao renomear o canal. Verifique se o nome é válido.',
    BITRATE_FAILED: '❌ Erro ao ajustar bitrate. Verifique se o valor está dentro do limite.',
    USER_LIMIT_FAILED: '❌ Erro ao definir limite de usuários.',
    STATUS_UPDATE_FAILED: '❌ Erro ao alterar o status do canal. Veja os logs para mais detalhes.',
    ALLOW_USER_FAILED: '❌ Erro ao conceder permissões.',
    KICK_USER_FAILED: '❌ Erro ao remover usuário.',
    BLOCK_USER_FAILED: '❌ Erro ao bloquear usuário.',
    UNBLOCK_USER_FAILED: '❌ Erro ao desbloquear usuário.',
    TRANSFER_FAILED: '❌ Erro ao transferir propriedade.',
    LOCK_FAILED: '❌ Erro ao trancar o canal.',
    UNLOCK_FAILED: '❌ Erro ao destrancar o canal.',
    HIDE_FAILED: '❌ Erro ao esconder o canal.',
    SHOW_FAILED: '❌ Erro ao mostrar o canal.',
    VIDEO_TOGGLE_FAILED: '❌ Erro ao alterar configuração de vídeo.',
    SCREENSHARE_TOGGLE_FAILED: '❌ Erro ao alterar configuração de screen share.',
    RESET_FAILED: '❌ Erro ao resetar permissões.',
    BITRATE_INVALID: (maxBitrate: number, tier: number) => 
      `❌ O limite de bitrate para este servidor é **${maxBitrate} kbps** (Nível de Boost: ${tier}).\n\n` +
      `💎 Limites por nível:\n` +
      `• Sem boost: 96 kbps\n` +
      `• Nível 1: 128 kbps\n` +
      `• Nível 2: 256 kbps\n` +
      `• Nível 3: 384 kbps`,
  },

  // Sucesso em ações
  SUCCESS: {
    CHANNEL_RENAMED: (name: string) => `✅ Canal renomeado para: **${name}**`,
    CHANNEL_LOCKED: '✅ Canal trancado! Apenas usuários permitidos podem entrar.',
    CHANNEL_UNLOCKED: '✅ Canal destrancado! Todos podem entrar agora.',
    CHANNEL_HIDDEN: '✅ Canal escondido! Apenas você e usuários permitidos podem ver.',
    CHANNEL_VISIBLE: '✅ Canal visível! Todos podem ver o canal agora.',
    USER_ALLOWED: (userId: string) => `✅ Permissões concedidas para <@${userId}>!`,
    USER_BLOCKED: (userId: string) => `🚫 <@${userId}> foi bloqueado do canal!`,
    USER_UNBLOCKED: (userId: string) => `✔️ <@${userId}> foi desbloqueado e pode entrar no canal novamente!`,
    USER_KICKED: (userId: string) => `✅ <@${userId}> foi removido do canal!`,
    OWNERSHIP_TRANSFERRED: (userId: string) => `👑 Propriedade transferida para <@${userId}>!\n⚠️ Você não poderá mais gerenciar este canal.`,
    PERMISSIONS_RESET: '✅ Permissões resetadas para o padrão!',
    BITRATE_UPDATED: (bitrate: number) => `✅ Bitrate ajustado para: **${bitrate} kbps**`,
    USER_LIMIT_UPDATED: (limit: number | string) => `✅ Limite de usuários definido para: **${limit}**`,
    STATUS_UPDATED: (status: string) => `✅ Status do canal atualizado para:\n> ${status}`,
    STATUS_REMOVED: '✅ Status do canal removido!',
    VIDEO_DISABLED: '✅ Câmera bloqueada! Ninguém pode usar webcam.',
    VIDEO_ENABLED: '✅ Câmera liberada! Todos podem usar webcam.',
    SCREENSHARE_DISABLED: '✅ Screen share bloqueado! Ninguém pode compartilhar tela.',
    SCREENSHARE_ENABLED: '✅ Screen share liberado! Todos podem compartilhar tela.',
  },

  // Avisos
  WARNINGS: {
    USER_NOT_IN_CHANNEL: (mention: string) => `⚠️ ${mention} não está no canal de voz!`,
  },

  // Menu headers
  MENUS: {
    MANAGE_CHANNEL: '**📝 Gerenciar Canal**\nEscolha uma opção:',
    MANAGE_USERS: '**👤 Usuários Permitidos na Call**',
    MANAGE_USERS_DETAILED: '**🔧 Gerenciar Usuários**\nEscolha uma opção:',
    MORE_OPTIONS: '**Mais Opções**\nEscolha uma opção:',
    ADVANCED_SETTINGS: '**📹 Controlar Câmera/Screen**\nEscolha uma opção:',
    OTHER_OPTIONS: '**📊 Outras Opções**\nEscolha uma opção:',
    VIDEO_CONTROLS: '**📹 Câmera e Screen Share**\nEscolha uma opção:',
    SELECT_USER_TO_ALLOW: 'Selecione o usuário que poderá gerenciar este canal:',
    SELECT_USER_TO_KICK: 'Selecione o usuário para remover do canal:',
    SELECT_USER_TO_BLOCK: 'Selecione o usuário para bloquear:',
    SELECT_USER_TO_UNBLOCK: 'Selecione o usuário para desbloquear:',
    SELECT_NEW_OWNER: 'Selecione o novo dono do canal:',
  },

  // Labels de botões e opções
  LABELS: {
    // Botões principais
    USER_LIMIT: 'Limite da Call',
    CALL_STATUS: 'Status da Call',
    MANAGE_USERS: 'Usuários Permitidos',
    TRANSFER_OWNERSHIP: 'Transferir Dono',
    MORE_OPTIONS: 'Mais Opções',
    
    // Ações de gerenciamento
    RENAME_CHANNEL: 'Renomear canal',
    LOCK_CHANNEL: 'Trancar canal',
    UNLOCK_CHANNEL: 'Destrancar canal',
    HIDE_CHANNEL: 'Esconder canal',
    SHOW_CHANNEL: 'Mostrar canal',
    
    // Gerenciamento de usuários
    ADD_USER: 'Adicionar usuário',
    BLOCK_USER: 'Bloquear usuário',
    UNBLOCK_USER: 'Desbloquear usuário',
    KICK_USER: 'Kickar usuário',
    
    // Configurações avançadas
    ADJUST_BITRATE: 'Ajustar bitrate',
    VIDEO_CONTROLS: 'Controlar câmera/screen',
    BLOCK_VIDEO: 'Bloquear câmera',
    ENABLE_VIDEO: 'Liberar câmera',
    BLOCK_SCREENSHARE: 'Bloquear screen share',
    ENABLE_SCREENSHARE: 'Liberar screen share',
    RESET_PERMISSIONS: 'Resetar permissões',
    
    // Navegação
    BACK: 'Voltar',
    BACK_TO_MAIN: 'Voltar ao menu principal',
    
    // Proteção
    ACTIVATE_PROTECTION: 'Ativar Proteção',
    DEACTIVATE_PROTECTION: 'Desativar Proteção',
    MANAGE_USERS_BUTTON: 'Gerenciar Usuários',
  },

  // Descrições
  DESCRIPTIONS: {
    RENAME_CHANNEL: 'Alterar o nome do canal',
    LOCK_CHANNEL: 'Impedir que novos usuários entrem',
    UNLOCK_CHANNEL: 'Permitir que novos usuários entrem',
    HIDE_CHANNEL: 'Tornar o canal invisível',
    SHOW_CHANNEL: 'Tornar o canal visível para todos',
    TRANSFER_OWNERSHIP: 'Passar o canal para outro usuário',
    ADD_USER: 'Dar permissões para alguém entrar',
    BLOCK_USER: 'Impedir que alguém entre no canal',
    UNBLOCK_USER: 'Remover bloqueio de um usuário',
    KICK_USER: 'Remover alguém do canal agora',
    ADJUST_BITRATE: 'Alterar a qualidade do áudio',
    VIDEO_CONTROLS: 'Configurar webcam e compartilhamento de tela',
    RESET_PERMISSIONS: 'Voltar ao padrão',
    USER_LIMIT: 'Alterar o limite de usuários na call',
    CALL_STATUS: 'Alterar o status que aparece no canal',
    BLOCK_VIDEO: 'Impedir uso de webcam',
    ENABLE_VIDEO: 'Permitir uso de webcam',
    BLOCK_SCREENSHARE: 'Impedir compartilhamento de tela',
    ENABLE_SCREENSHARE: 'Permitir compartilhamento de tela',
    BACK_TO_MAIN: 'Voltar ao menu principal',
    BACK: 'Voltar',
  },

  // Controle de canal dinâmico
  DYNAMIC_CHANNEL: {
    CONTROL_PANEL_TITLE: (channelName: string) => `**${channelName} - Call Control**`,
    CONTROL_PANEL_WELCOME: (mention: string) => 
      `Olá, ${mention}! Seja bem-vindo(a) ao painel de controle da call.\n\n` +
      `Para acessar as funcionalidades do **Call Control**, use os botões abaixo.`,
    PROTECTION_STATUS: (isProtected: boolean) => 
      `🔒 **Proteção:** ${isProtected ? '✅ Ativada' : '❌ Desativada'}`,
  },

  // Navegação
  NAVIGATION: {
    GOING_BACK: '⬅️ Voltando ao menu principal...',
  },
} as const;
