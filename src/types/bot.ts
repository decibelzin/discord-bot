import { Client, Collection, ChatInputCommandInteraction, GatewayIntentBits } from "discord.js";

export interface Command {
  name: string;
  description: string;
  options?: Array<{
    name: string;
    description: string;
    type: "string" | "number" | "boolean" | "user" | "channel" | "role";
    required?: boolean;
  }>;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface BotFeatureModule {
  name: string;
  initialize: (client: ExtendedClient) => Promise<void> | void;
}

export interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
  /** Módulos carregados de cada pasta em `src/features`. */
  features: Map<string, BotFeatureModule>;
}

export interface BotConfig {
  token: string;
  clientId: string;
  guildId?: string;
  intents: GatewayIntentBits[];
  /**
   * Playwright Last Meadow: sem janela quando true (típico em VPS).
   * `.env`: `LAST_MEADOW_HEADLESS=1` ou `true`; omitido ou `0`/`false` = mostra o browser.
   */
  lastMeadowHeadless: boolean;
}
