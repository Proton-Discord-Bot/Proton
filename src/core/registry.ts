import { readdir } from 'node:fs/promises';
import type { Dirent } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Collection } from 'discord.js';
import { logger } from './logger';
import type { Command } from './command';
import type { Component } from './component';

export async function* walk(dir: string): AsyncGenerator<string> {
  let entries: Dirent[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') return;
    throw err;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) yield full;
  }
}

async function load<T>(dir: string, key: (m: T) => string, valid: (m: unknown) => m is T) {
  const out = new Collection<string, T>();
  for await (const file of walk(dir)) {
    try {
      const mod = (await import(pathToFileURL(file).href)).default;
      if (!valid(mod)) throw new Error('invalid module shape');
      out.set(key(mod), mod);
    } catch (err) {
      logger.error(`Failed to load ${file}:`, err);
    }
  }
  return out;
}

export const loadCommands = (dir: string) =>
  load<Command>(
    dir,
    (c) => c.data.name,
    (m): m is Command => !!(m as Command)?.data?.name,
  );
export const loadComponents = (dir: string) =>
  load<Component>(
    dir,
    (c) => c.match,
    (m): m is Component => typeof (m as Component)?.match === 'string',
  );
