import { test, expect } from 'bun:test';
import { envSchema } from './env';

test('rejects missing TOKEN', () => {
  expect(() => envSchema.parse({ DISCORD_APPLICATION_ID: 'a' })).toThrow();
});
test('defaults DATABASE_PATH', () => {
  const e = envSchema.parse({ TOKEN: 't', DISCORD_APPLICATION_ID: 'a' });
  expect(e.DATABASE_PATH).toBe('./database.sqlite');
});
