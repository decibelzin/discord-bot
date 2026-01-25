export const CUSTOM_IDS = {
  MAIN_PANEL: {
    USER_LIMIT: 'vc_user_limit',
    CALL_STATUS: 'vc_call_status',
    MANAGE_USERS: 'vc_manage_users_menu',
    TRANSFER_OWNERSHIP: 'vc_transfer_ownership',
    MORE_OPTIONS: 'vc_more_options',
  },

  MANAGE_USERS: {
    TOGGLE_PROTECTION: 'vc_toggle_protection',
    DETAILED_MENU: 'vc_manage_users_detailed',
  },

  SELECT_MENUS: {
    CONTROL: 'vc_control_menu',
    SETTINGS_MAIN: 'vc_settings_main',
    MANAGE_CHANNEL: 'vc_submenu_manage_channel',
    MANAGE_USERS: 'vc_submenu_manage_users',
    ADVANCED: 'vc_submenu_advanced',
    OTHER: 'vc_submenu_other',
  },

  // Ações de gerenciamento de canal
  CHANNEL_ACTIONS: {
    RENAME: 'vc_rename_channel',
    LOCK: 'vc_lock_channel',
    UNLOCK: 'vc_unlock_channel',
    HIDE: 'vc_hide_channel',
    SHOW: 'vc_show_channel',
    BITRATE: 'vc_bitrate',
    VIDEO_MENU: 'vc_video_menu',
    RESET_PERMISSIONS: 'vc_reset_permissions',
  },

  // Ações de gerenciamento de usuários
  USER_ACTIONS: {
    ALLOW: 'vc_allow_user',
    BLOCK: 'vc_block_user',
    UNBLOCK: 'vc_unblock_user',
    KICK: 'vc_kick_user',
  },

  // Ações de vídeo/screen
  VIDEO_ACTIONS: {
    DISABLE_VIDEO: 'vc_disable_video',
    ENABLE_VIDEO: 'vc_enable_video',
    DISABLE_SCREENSHARE: 'vc_disable_screenshare',
    ENABLE_SCREENSHARE: 'vc_enable_screenshare',
  },

  // Navegação
  NAVIGATION: {
    BACK_MAIN: 'vc_back_main',
    MANAGE_CHANNEL: 'vc_manage_channel',
    MANAGE_USERS: 'vc_manage_users',
    ADVANCED_SETTINGS: 'vc_advanced_settings',
    ADVANCED_MENU: 'vc_advanced_menu',
    OTHER_OPTIONS: 'vc_other_options',
  },

  // Prefixos para IDs dinâmicos (com channelId)
  PREFIXES: {
    MODAL_STATUS: 'vc_modal_status_',
    MODAL_RENAME: 'vc_modal_rename_',
    MODAL_BITRATE: 'vc_modal_bitrate_',
    MODAL_LIMIT: 'vc_modal_limit_',
    MODAL_REGION: 'vc_modal_region_',
    ALLOW_USER: 'vc_allow_',
    KICK_USER: 'vc_kick_',
    BLOCK_USER: 'vc_block_',
    UNBLOCK_USER: 'vc_unblock_',
    TRANSFER_USER: 'vc_transfer_',
    GRANT_PERMISSIONS: 'grant_permissions_',
    USER_LIMIT: 'user_limit_',
  },

  // Outros botões (não relacionados a voice channels)
  OTHER: {
    JOIN_BUTTON: 'c37cd7568d704a009385ff8b51518801',
    NUKE_DISABLED: 'nuke_disabled_button',
  },

  // IDs legados (manter por compatibilidade)
  LEGACY: {
    OLD_SETTINGS_MENU: '1bb04c5961a745aca08fc7a6a7a0d4d0',
    ALLOW_USERS_OLD: 'e8ee043cd1714f67906c99901bb8568e',
    USER_LIMIT_OLD: '7bb9191485124180fc80e98fcc14c95f',
  },
} as const;

/**
 * Helper para criar IDs dinâmicos com channelId
 */
export const createDynamicId = {
  modalStatus: (channelId: string) => `${CUSTOM_IDS.PREFIXES.MODAL_STATUS}${channelId}`,
  modalRename: (channelId: string) => `${CUSTOM_IDS.PREFIXES.MODAL_RENAME}${channelId}`,
  modalBitrate: (channelId: string) => `${CUSTOM_IDS.PREFIXES.MODAL_BITRATE}${channelId}`,
  modalLimit: (channelId: string) => `${CUSTOM_IDS.PREFIXES.MODAL_LIMIT}${channelId}`,
  modalRegion: (channelId: string) => `${CUSTOM_IDS.PREFIXES.MODAL_REGION}${channelId}`,
  allowUser: (channelId: string) => `${CUSTOM_IDS.PREFIXES.ALLOW_USER}${channelId}`,
  kickUser: (channelId: string) => `${CUSTOM_IDS.PREFIXES.KICK_USER}${channelId}`,
  blockUser: (channelId: string) => `${CUSTOM_IDS.PREFIXES.BLOCK_USER}${channelId}`,
  unblockUser: (channelId: string) => `${CUSTOM_IDS.PREFIXES.UNBLOCK_USER}${channelId}`,
  transferUser: (channelId: string) => `${CUSTOM_IDS.PREFIXES.TRANSFER_USER}${channelId}`,
};

/**
 * Helper para extrair channelId de um customId dinâmico
 */
export const extractChannelId = {
  fromModalStatus: (customId: string) => customId.replace(CUSTOM_IDS.PREFIXES.MODAL_STATUS, ''),
  fromModalRename: (customId: string) => customId.replace(CUSTOM_IDS.PREFIXES.MODAL_RENAME, ''),
  fromModalBitrate: (customId: string) => customId.replace(CUSTOM_IDS.PREFIXES.MODAL_BITRATE, ''),
  fromModalLimit: (customId: string) => customId.replace(CUSTOM_IDS.PREFIXES.MODAL_LIMIT, ''),
  fromModalRegion: (customId: string) => customId.replace(CUSTOM_IDS.PREFIXES.MODAL_REGION, ''),
  fromAllowUser: (customId: string) => customId.replace(CUSTOM_IDS.PREFIXES.ALLOW_USER, ''),
  fromKickUser: (customId: string) => customId.replace(CUSTOM_IDS.PREFIXES.KICK_USER, ''),
  fromBlockUser: (customId: string) => customId.replace(CUSTOM_IDS.PREFIXES.BLOCK_USER, ''),
  fromUnblockUser: (customId: string) => customId.replace(CUSTOM_IDS.PREFIXES.UNBLOCK_USER, ''),
  fromTransferUser: (customId: string) => customId.replace(CUSTOM_IDS.PREFIXES.TRANSFER_USER, ''),
};
