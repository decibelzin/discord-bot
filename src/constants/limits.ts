/**
 * Limites e valores de validação
 */

export const LIMITS = {
  /**
   * Limites de canal de voz
   */
  VOICE_CHANNEL: {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    USER_LIMIT_MIN: 0,      // 0 = ilimitado
    USER_LIMIT_MAX: 99,
    BITRATE_MIN: 8,         // kbps
    BITRATE_MAX: 384,       // kbps
    STATUS_MAX_LENGTH: 500, // Limite do Discord para voice channel status
  },

  /**
   * Limites de entrada de texto
   */
  TEXT_INPUT: {
    CHANNEL_NAME_MIN: 1,
    CHANNEL_NAME_MAX: 2,    // caracteres do input
    USER_LIMIT_MIN: 1,
    USER_LIMIT_MAX: 2,      // caracteres do input (0-99)
  },
} as const;

/**
 * Valores padrão
 */
export const DEFAULTS = {
  USER_LIMIT_UNLIMITED: 0,
  BITRATE_DEFAULT: 64,
} as const;

/**
 * Regex patterns para validação
 */
export const PATTERNS = {
  NUMERIC_ONLY: /^\d+$/,
} as const;
