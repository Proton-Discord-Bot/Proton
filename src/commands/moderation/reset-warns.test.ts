import { test, expect } from 'bun:test';
import { createDb, migrateDb } from '../../db/client';
import { warnsRepo } from '../../db/repos';
import { renderedText } from '../../test-utils/render';
import resetWarns from './reset-warns';

function ctxFor(db: any, replies: any[], amount: number | null = null) {
  return {
    db,
    t: (k: string, v?: any) => (v ? `${k}:${JSON.stringify(v)}` : k),
    interaction: {
      guild: { id: 'g1' },
      options: {
        getUser: () => ({ id: 'u1', username: 'U' }),
        getInteger: () => amount,
      },
      reply: (m: any) => replies.push(m),
    },
  } as any;
}

function seeded(count: number) {
  const db = createDb(':memory:');
  migrateDb(db);
  for (let i = 0; i < count; i += 1) warnsRepo(db).add('g1', 'u1', `r${i}`);
  return db;
}

test('resets every warn when no amount is given', async () => {
  const db = seeded(3);
  const replies: any[] = [];
  await resetWarns.run(ctxFor(db, replies));

  expect(warnsRepo(db).count('g1', 'u1')).toBe(0);
  expect(renderedText(replies[0])).toContain('"count":3');
});

test('resets only the requested amount', async () => {
  const db = seeded(5);
  const replies: any[] = [];
  await resetWarns.run(ctxFor(db, replies, 2));

  expect(warnsRepo(db).count('g1', 'u1')).toBe(3);
  expect(renderedText(replies[0])).toContain('"count":2');
});

test('reports the real count when the user has fewer warns than requested', async () => {
  const db = seeded(1);
  const replies: any[] = [];
  await resetWarns.run(ctxFor(db, replies, 10));

  expect(renderedText(replies[0])).toContain('"count":1');
});

test('replies with the no-warns notice when there is nothing to reset', async () => {
  const db = seeded(0);
  const replies: any[] = [];
  await resetWarns.run(ctxFor(db, replies));

  expect(replies).toHaveLength(1);
  expect(renderedText(replies[0])).toContain('noWarns');
});
