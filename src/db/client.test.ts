import { test, expect } from 'bun:test';
import { createDb, migrateDb } from './client';
import { guilds } from './schema';

test('migrate creates tables and allows insert/select', () => {
  const db = createDb(':memory:');
  migrateDb(db);
  db.insert(guilds).values({ guildId: 'g1' }).run();
  expect(db.select().from(guilds).all()).toHaveLength(1);
});
