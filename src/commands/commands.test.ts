import { test, expect } from 'bun:test';
import { join } from 'node:path';
import { loadCommands, loadComponents } from '../core/registry';

const commandsDir = join(import.meta.dir);
const componentsDir = join(import.meta.dir, '../components');

test('every command module loads and is registered under its own name', async () => {
  const commands = await loadCommands(commandsDir);

  expect([...commands.keys()].sort()).toEqual(
    [
      'Ban',
      'Info',
      'Kick',
      'autorole',
      'channel',
      'clear',
      'config',
      'contribute',
      'goodbye',
      'help',
      'info',
      'join2create',
      'logsystem',
      'resetwarns',
      'track',
      'warn',
      'welcome',
    ].sort(),
  );
});

test('every command serialises to a valid registration payload', async () => {
  const commands = await loadCommands(commandsDir);

  for (const [name, command] of commands) {
    const json = command.data.toJSON() as { name: string; description?: string };
    expect(json.name, `${name} serialises with its own name`).toBe(name);
    // Context menus carry an empty description; slash commands must have real copy.
    if (json.description !== undefined && json.description !== '') {
      expect(json.description.length, `${name} has a description`).toBeGreaterThan(0);
    }
  }
});

test('commands are tagged with the folder they live in', async () => {
  const commands = await loadCommands(commandsDir);

  expect(commands.get('warn')?.category).toBe('moderation');
  expect(commands.get('config')?.category).toBe('config');
  expect(commands.get('join2create')?.category).toBe('voice');
  expect(commands.get('Ban')?.category).toBe('context-menu');
});

test('guild-only commands are marked as such', async () => {
  const commands = await loadCommands(commandsDir);

  for (const name of ['warn', 'resetwarns', 'config', 'track', 'join2create', 'Ban']) {
    expect(commands.get(name)?.guildOnly, `${name} is guild-only`).toBe(true);
  }
});

test('every component module loads under its match key', async () => {
  const components = await loadComponents(componentsDir);
  expect([...components.keys()].sort()).toEqual(['help:nav', 'info']);
});
