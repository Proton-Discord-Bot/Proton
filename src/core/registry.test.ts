import { test, expect } from 'bun:test';
import { join } from 'node:path';
import { loadCommands } from './registry';

test('loads command modules keyed by name', async () => {
  const dir = join(import.meta.dir, '__fixtures__/commands');
  const cmds = await loadCommands(dir);
  expect(cmds.get('ping')?.data.name).toBe('ping');
});
