export interface ViewportConfig {
  width: number;
  height: number;
}

/** Timeouts usados na automação (ms). Centralizados para ajuste e testes. */
export interface TimeoutConfig {
  /** Botão "Last Meadow Online" no Discord */
  lastMeadowButton: number;
  /** Resolver iframe/página da atividade (Start / Continue Game) */
  activitySurfaceResolve: number;
  /** Primeiro "Next" do tutorial (conta nova) */
  firstTutorialNext: number;
  paladinCard: number;
  scholarCard: number;
  hiddenNextClick: number;
  startAfterScholar: number;
  adventureButtonVisible: number;
  adventureClick: number;
  pollInterval: number;
}

export interface AppConfig {
  discordToken: string;
  discordLoginUrl: string;
  lastMeadowActivityLabel: string;
  /** Para ao ler este nível na HUD (1–100). Env: LAST_MEADOW_STOP_LEVEL (padrão 100). */
  stopAtLevel: number;
  headless: boolean;
  viewport: ViewportConfig;
  timeouts: TimeoutConfig;
}

const DEFAULT_VIEWPORT: ViewportConfig = { width: 1280, height: 800 };

/** Remove aspas envolventes comuns quando o token é copiado de JSON ou do DevTools. */
export function normalizeDiscordToken(raw: string): string {
  let t = raw.trim();
  while (
    (t.startsWith('"') && t.endsWith('"') && t.length >= 2) ||
    (t.startsWith("'") && t.endsWith("'") && t.length >= 2)
  ) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

export const LAST_MEADOW_MAX_LEVEL = 100;

/** Nível em que o loop de Aventura para (inclusivo). Vazio → 100. */
export function parseStopAtLevel(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === "") {
    return LAST_MEADOW_MAX_LEVEL;
  }
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(n) || n < 1 || n > LAST_MEADOW_MAX_LEVEL) {
    throw new Error(
      `LAST_MEADOW_STOP_LEVEL deve ser inteiro entre 1 e ${LAST_MEADOW_MAX_LEVEL} (recebido: ${JSON.stringify(raw)}).`,
    );
  }
  return n;
}

export function assertStopAtLevel(n: number): number {
  if (!Number.isInteger(n) || n < 1 || n > LAST_MEADOW_MAX_LEVEL) {
    throw new Error(`Nível alvo deve ser inteiro entre 1 e ${LAST_MEADOW_MAX_LEVEL}.`);
  }
  return n;
}

/** Configuração para uma sessão iniciada pelo bot (token + nível por pedido do utilizador). */
export function buildAppConfig(opts: {
  discordToken: string;
  stopAtLevel: number;
  headless?: boolean;
}): AppConfig {
  return {
    discordToken: normalizeDiscordToken(opts.discordToken),
    discordLoginUrl: "https://discord.com/login",
    lastMeadowActivityLabel: "Last Meadow Online",
    stopAtLevel: assertStopAtLevel(opts.stopAtLevel),
    headless: opts.headless ?? false,
    viewport: DEFAULT_VIEWPORT,
    timeouts: DEFAULT_TIMEOUTS,
  };
}

const DEFAULT_TIMEOUTS: TimeoutConfig = {
  lastMeadowButton: 120_000,
  activitySurfaceResolve: 120_000,
  firstTutorialNext: 25_000,
  paladinCard: 60_000,
  scholarCard: 60_000,
  hiddenNextClick: 30_000,
  startAfterScholar: 60_000,
  adventureButtonVisible: 120_000,
  adventureClick: 15_000,
  pollInterval: 250,
};

export function loadConfig(): AppConfig {
  const token = process.env.DISCORD_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "Defina DISCORD_TOKEN no ambiente (variável de sistema ou .env carregada manualmente).",
    );
  }

  return {
    discordToken: normalizeDiscordToken(token),
    discordLoginUrl: "https://discord.com/login",
    lastMeadowActivityLabel: "Last Meadow Online",
    stopAtLevel: parseStopAtLevel(process.env.LAST_MEADOW_STOP_LEVEL),
    headless: process.env.HEADLESS === "1" || process.env.HEADLESS === "true",
    viewport: DEFAULT_VIEWPORT,
    timeouts: DEFAULT_TIMEOUTS,
  };
}
