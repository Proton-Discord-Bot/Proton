import { test, expect } from 'bun:test';
import { createDb, migrateDb } from '../../db/client';
import { warnsRepo } from '../../db/repos';
import warn from './warn';

function ctxFor(
  db: any,
  replies: any[],
  opts: { targetId?: string; actorId?: string; targetIsAdmin?: boolean } = {},
) {
  const targetId = opts.targetId ?? 'target';
  const user = { id: targetId, username: 'T' };
  return {
    db,
    t: (k: string, v?: any) => (v ? `${k}:${JSON.stringify(v)}` : k),
    guildId: 'g1',
    guild: { guildId: 'g1' },
    interaction: {
      user: { id: opts.actorId ?? 'mod' },
      guild: {
        id: 'g1',
        members: {
          fetch: async () => ({
            id: targetId,
            username: 'T',
            permissions: { has: () => opts.targetIsAdmin ?? false },
          }),
        },
      },
      options: {
        getUser: () => user,
        getString: () => 'spam',
      },
      reply: (m: any) => {
        replies.push(m);
      },
      replied: false,
    },
  } as any;
}

/** Concatenates every rendered TextDisplay in a reply, for content assertions. */
function textsOf(reply: any): string {
  const payload = JSON.parse(JSON.stringify(reply));
  const container = payload.components[0];
  return (container.components ?? [container]).map((c: any) => c.content ?? '').join('\n');
}

function freshDb() {
  const db = createDb(':memory:');
  migrateDb(db);
  return db;
}

test('a first warn replies exactly once and records it', async () => {
  const db = freshDb();
  const replies: any[] = [];
  await warn.run(ctxFor(db, replies));
  expect(replies).toHaveLength(1);
  expect(warnsRepo(db).count('g1', 'target')).toBe(1);
});

test('warning yourself is refused without recording a warn', async () => {
  const db = freshDb();
  const replies: any[] = [];
  await warn.run(ctxFor(db, replies, { targetId: 'mod', actorId: 'mod' }));
  expect(replies).toHaveLength(1);
  expect(warnsRepo(db).count('g1', 'mod')).toBe(0);
});

test('warning a moderator is refused without recording a warn', async () => {
  const db = freshDb();
  const replies: any[] = [];
  await warn.run(ctxFor(db, replies, { targetIsAdmin: true }));
  expect(replies).toHaveLength(1);
  expect(warnsRepo(db).count('g1', 'target')).toBe(0);
});

test('the third warn still sends exactly one reply, carrying the escalation notice', async () => {
  const db = freshDb();
  const replies: any[] = [];
  await warn.run(ctxFor(db, replies));
  await warn.run(ctxFor(db, replies));
  await warn.run(ctxFor(db, replies));

  expect(replies).toHaveLength(3);
  expect(warnsRepo(db).count('g1', 'target')).toBe(3);

  expect(textsOf(replies[0])).not.toContain('warn.multiple');

  const escalated = textsOf(replies[2]);
  expect(escalated).toContain('warn.multiple');
  expect(escalated).toContain('"count":3');
  expect(escalated).toContain('warn.embed.footer');
});

test('the command is guild-only', () => {
  expect(warn.guildOnly).toBe(true);
  expect(warn.data.name).toBe('warn');
});
