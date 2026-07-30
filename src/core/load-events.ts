import { pathToFileURL } from 'node:url';
import type { ClientEvents } from 'discord.js';
import { walk } from './registry';
import { logger } from './logger';
import type { ProtonClient } from '../client';
import type { EventModule } from './event';

function isEventModule(m: unknown): m is EventModule {
  const mod = m as EventModule | undefined;
  return typeof mod?.name === 'string' && typeof mod?.execute === 'function';
}

function wire<K extends keyof ClientEvents>(client: ProtonClient, mod: EventModule<K>): void {
  const listener = (...args: ClientEvents[K]) => mod.execute(client, ...args);
  if (mod.once) client.once(mod.name, listener);
  else client.on(mod.name, listener);
}

export async function loadEvents(client: ProtonClient, dir: string): Promise<void> {
  for await (const file of walk(dir)) {
    try {
      const mod = (await import(pathToFileURL(file).href)).default;
      if (!isEventModule(mod)) throw new Error('invalid module shape');
      wire(client, mod);
    } catch (err) {
      logger.error(`Failed to load ${file}:`, err);
    }
  }
}
