import { test, expect } from 'bun:test';
import { createDb, migrateDb } from '../db/client';
import { guildGuard } from './middleware';

test('guildGuard ensures guild row and populates ctx', async () => {
  const db = createDb(':memory:');
  migrateDb(db);
  const ctx: any = { db, interaction: { inGuild: () => true, guildId: 'g1' } };
  let ran = false;
  await guildGuard({ guildOnly: true } as any)(ctx, async () => {
    ran = true;
  });
  expect(ran).toBe(true);
  expect(ctx.guild.guildId).toBe('g1');
});
