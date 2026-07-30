import type { ClientEvents } from 'discord.js';
import type { ProtonClient } from '../client';

export interface EventModule<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute(client: ProtonClient, ...args: ClientEvents[K]): unknown;
}

export function defineEvent<K extends keyof ClientEvents>(e: EventModule<K>): EventModule<K> {
  return e;
}
