/**
 * Types and interfaces for Permission Management
 */

import { Snowflake, GuildMember, VoiceChannel, PermissionsBitField } from 'discord.js';

/**
 * Result of a permission check
 */
export interface PermissionCheckResult {
  /** Whether the user has the required permission */
  allowed: boolean;
  
  /** Reason if permission was denied */
  reason?: string;
  
  /** Missing permissions */
  missingPermissions?: string[];
}

/**
 * Context for permission checks
 */
export interface PermissionContext {
  /** The member whose permissions are being checked */
  member: GuildMember;
  
  /** The voice channel */
  channel: VoiceChannel;
  
  /** Whether to check for admin bypass */
  checkAdmin?: boolean;
}

/**
 * Options for updating channel permissions
 */
export interface UpdatePermissionsOptions {
  /** The voice channel */
  channel: VoiceChannel;
  
  /** ID of the user or role */
  targetId: Snowflake;
  
  /** Permissions to allow */
  allow?: PermissionsBitField;
  
  /** Permissions to deny */
  deny?: PermissionsBitField;
  
  /** Reason for the permission change */
  reason?: string;
}

/**
 * Result of a permission update operation
 */
export interface PermissionUpdateResult {
  /** Whether the update was successful */
  success: boolean;
  
  /** Error message if update failed */
  error?: string;
  
  /** Previous permission state (for rollback) */
  previousState?: any;
}

/**
 * Bulk permission operation
 */
export interface BulkPermissionOperation {
  /** Target user or role ID */
  targetId: Snowflake;
  
  /** Permissions to allow */
  allow?: string[];
  
  /** Permissions to deny */
  deny?: string[];
}

/**
 * Options for resetting permissions
 */
export interface ResetPermissionsOptions {
  /** The voice channel */
  channel: VoiceChannel;
  
  /** Whether to keep owner permissions */
  keepOwner?: boolean;
  
  /** Whether to keep admin permissions */
  keepAdmins?: boolean;
  
  /** Reason for the reset */
  reason?: string;
}
