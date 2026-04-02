import { GatewayIntentBits } from 'discord.js';
import { BotConfig } from '../types';
import dotenv from 'dotenv';

dotenv.config();

/** `LAST_MEADOW_HEADLESS` no `.env`: 1 / true / yes → headless; resto ou vazio → janela visível. */
function parseLastMeadowHeadless(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const v = raw.trim().toLowerCase();
  if (v === '' || v === '0' || v === 'false' || v === 'no') return false;
  return v === '1' || v === 'true' || v === 'yes';
}

export const config: BotConfig = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  guildId: process.env.GUILD_ID,
  lastMeadowHeadless: parseLastMeadowHeadless(process.env.LAST_MEADOW_HEADLESS),
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
  ],
};
