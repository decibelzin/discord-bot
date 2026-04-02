import * as fs from 'fs';
import * as path from 'path';
import type { Snowflake } from 'discord.js';
import { logger } from '../utils/logger';
import { UserChannelSettings } from '../types';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'userChannelSettings.json');

const userSettings = new Map<string, UserChannelSettings>();

function getKey(userId: Snowflake, guildId: Snowflake): string {
  return `${userId}-${guildId}`;
}

function saveData(): void {
  try {
    const dataDir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const data = Object.fromEntries(userSettings.entries());
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    logger.error('Erro ao salvar configurações de usuário:', error as Error);
  }
}

function loadData(): void {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      
      Object.entries(parsed).forEach(([key, settings]) => {
        userSettings.set(key, settings as UserChannelSettings);
      });
      
      logger.info(`Configurações de usuário carregadas: ${userSettings.size} configuração(ões)`);
    } else {
      logger.info('Nenhuma configuração de usuário salva encontrada');
    }
  } catch (error) {
    logger.error('Erro ao carregar configurações de usuário:', error as Error);
  }
}

export class UserChannelSettingsService {
  static initialize(): void {
    loadData();
  }

  static get(userId: Snowflake, guildId: Snowflake): UserChannelSettings | undefined {
    const key = getKey(userId, guildId);
    return userSettings.get(key);
  }

  static save(userId: Snowflake, guildId: Snowflake, settings: Partial<UserChannelSettings>): void {
    const key = getKey(userId, guildId);
    const existing = userSettings.get(key);
    
    const updated: UserChannelSettings = {
      userId,
      guildId,
      ...existing,
      ...settings,
      lastUpdated: Date.now(),
    };
    
    userSettings.set(key, updated);
    saveData();
  }

  static updateSetting(
    userId: Snowflake,
    guildId: Snowflake,
    setting: keyof Omit<UserChannelSettings, 'userId' | 'guildId' | 'lastUpdated'>,
    value: any
  ): void {
    const key = getKey(userId, guildId);
    const existing = userSettings.get(key);
    
    const updated: UserChannelSettings = {
      userId,
      guildId,
      ...existing,
      [setting]: value,
      lastUpdated: Date.now(),
    };
    
    userSettings.set(key, updated);
    saveData();
  }

  static removeSetting(
    userId: Snowflake,
    guildId: Snowflake,
    setting: keyof Omit<UserChannelSettings, 'userId' | 'guildId' | 'lastUpdated'>
  ): void {
    const key = getKey(userId, guildId);
    const existing = userSettings.get(key);
    
    if (!existing) return;
    
    const updated = { ...existing };
    delete updated[setting];
    updated.lastUpdated = Date.now();
    
    userSettings.set(key, updated);
    saveData();
  }

  static delete(userId: Snowflake, guildId: Snowflake): boolean {
    const key = getKey(userId, guildId);
    const deleted = userSettings.delete(key);
    if (deleted) {
      saveData();
    }
    return deleted;
  }

  static has(userId: Snowflake, guildId: Snowflake): boolean {
    const key = getKey(userId, guildId);
    return userSettings.has(key);
  }

  static getAll(): Map<string, UserChannelSettings> {
    return new Map(userSettings);
  }
}

UserChannelSettingsService.initialize();
