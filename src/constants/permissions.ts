import { PermissionFlagsBits } from 'discord.js';

/**
 * Conjuntos de permissões reutilizáveis
 */

/**
 * Permissões completas do dono do canal
 */
export const OWNER_PERMISSIONS = [
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.ManageRoles,
  PermissionFlagsBits.Connect,
  PermissionFlagsBits.Speak,
  PermissionFlagsBits.Stream,
  PermissionFlagsBits.UseVAD,
  PermissionFlagsBits.PrioritySpeaker,
  PermissionFlagsBits.MuteMembers,
  PermissionFlagsBits.DeafenMembers,
  PermissionFlagsBits.MoveMembers,
] as const;

/**
 * Permissões básicas de entrada e uso de voz
 */
export const BASIC_VOICE_PERMISSIONS = [
  PermissionFlagsBits.Connect,
  PermissionFlagsBits.Speak,
  PermissionFlagsBits.Stream,
] as const;

/**
 * Permissões de usuário permitido (pode entrar e gerenciar)
 */
export const ALLOWED_USER_PERMISSIONS = [
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.ManageRoles,
  PermissionFlagsBits.Connect,
  PermissionFlagsBits.Speak,
  PermissionFlagsBits.Stream,
  PermissionFlagsBits.UseVAD,
  PermissionFlagsBits.PrioritySpeaker,
  PermissionFlagsBits.MuteMembers,
  PermissionFlagsBits.DeafenMembers,
  PermissionFlagsBits.MoveMembers,
] as const;

/**
 * Permissões bloqueadas quando o canal está protegido
 */
export const PROTECTION_DENY_PERMISSIONS = [
  PermissionFlagsBits.Connect,
] as const;

/**
 * Permissões bloqueadas quando vídeo está desabilitado
 */
export const VIDEO_DENY_PERMISSIONS = [
  PermissionFlagsBits.Stream,
] as const;
