import { test, expect } from 'bun:test';
import { guilds, warns, cMessages } from './schema';

test('schema exposes expected columns', () => {
  expect(Object.keys(guilds)).toContain('join2CreateChannelId');
  expect(Object.keys(warns)).toContain('reason');
  expect(Object.keys(cMessages)).toContain('welcomeMessage');
});
