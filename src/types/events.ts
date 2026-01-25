/**
 * Types for Discord.js Events
 */

import { ClientEvents, Awaitable } from 'discord.js';

/**
 * Event handler type
 */
export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
  /** The event name */
  name: K;
  
  /** Whether the event should only run once */
  once?: boolean;
  
  /** The function to execute when the event is triggered */
  execute: (...args: ClientEvents[K]) => Awaitable<void>;
}
