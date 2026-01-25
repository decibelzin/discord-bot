import { Snowflake, VoiceChannel, Guild, GuildMember } from 'discord.js';

export interface DynamicChannelData {
  channelId: Snowflake;
  
  ownerId: Snowflake;
  
  creatorChannelId: Snowflake;
  
  guildId: Snowflake;
  
  createdAt: number;
}

export interface VCCreatorData {
  channelId: Snowflake;
  
  guildId: Snowflake;
  
  categoryId: Snowflake;
  
  registeredAt: number;
}

export interface ChannelProtectionStatus {
  isProtected: boolean;
  
  allowedUsers: Snowflake[];
  
  blockedUsers: Snowflake[];
}

export interface DynamicChannelContext {
  channel: VoiceChannel;
  
  guild: Guild;
  
  owner: GuildMember;
  
  data: DynamicChannelData;
}

export interface DynamicChannelOperationResult {
  success: boolean;
  
  error?: string;
  
  data?: any;
}

export interface CreateDynamicChannelOptions {
  guild: Guild;
  
  member: GuildMember;
  
  creatorChannelId: Snowflake;
  
  categoryId: Snowflake;
  
  customName?: string;
}

export interface DynamicChannelStorage {
  getAll(): Map<Snowflake, DynamicChannelData>;
  
  get(channelId: Snowflake): DynamicChannelData | undefined;
  
  set(channelId: Snowflake, data: DynamicChannelData): void;
  
  delete(channelId: Snowflake): boolean;
  
  has(channelId: Snowflake): boolean;
  
  save(): Promise<void>;
  
  load(): Promise<void>;
}

export interface VCCreatorStorage {
  getAll(): Map<Snowflake, VCCreatorData>;
  
  get(channelId: Snowflake): VCCreatorData | undefined;
  
  set(channelId: Snowflake, data: VCCreatorData): void;
  
  delete(channelId: Snowflake): boolean;
  
  has(channelId: Snowflake): boolean;
  
  save(): Promise<void>;
  
  load(): Promise<void>;
}

export interface UserChannelSettings {
  userId: Snowflake;
  
  guildId: Snowflake;
  
  channelName?: string;
  
  bitrate?: number;
  
  userLimit?: number;
  
  status?: string;
  
  protectionEnabled?: boolean;
  
  lastUpdated: number;
}
