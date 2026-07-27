import { test, expect } from 'bun:test';
import { join } from 'node:path';
import { loadCommands } from './registry';

test('loads command modules keyed by name', async () => {
  const dir = join(import.meta.dir, '__fixtures__/commands');
  const cmds = await loadCommands(dir);
  expect(cmds.get('ping')?.data.name).toBe('ping');
});

test('tags commands with the folder they were loaded from', async () => {
  const dir = join(import.meta.dir, '__fixtures__/commands');
  const cmds = await loadCommands(dir);
  expect(cmds.get('pong')?.category).toBe('nested');
});

test('commands at the root of the commands dir have no category', async () => {
  const dir = join(import.meta.dir, '__fixtures__/commands');
  const cmds = await loadCommands(dir);
  expect(cmds.get('ping')?.category).toBeUndefined();
});
