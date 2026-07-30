import { test, expect } from 'bun:test';
import { createDb, migrateDb } from '../../db/client';
import { cMessagesRepo, guildsRepo } from '../../db/repos';
import { renderedText } from '../../test-utils/render';
import autorole from './autorole';
import channelSetup from './channel-setup';
import goodbyeMessage from './goodbye-message';
import logSystem from './log-system';
import track from './track';
import welcomeMessage from './welcome-message';

function freshDb() {
  const db = createDb(':memory:');
  migrateDb(db);
  guildsRepo(db).ensure('g1');
  return db;
}

function ctxFor(db: any, replies: any[], options: Record<string, unknown>) {
  return {
    db,
    guildId: 'g1',
    t: (k: string, v?: any) => (v ? `${k}:${JSON.stringify(v)}` : k),
    interaction: {
      guild: { id: 'g1' },
      options: {
        getRole: () => options.role ?? null,
        getChannel: () => options.channel ?? null,
        getString: () => options.string ?? null,
        getSubcommandGroup: () => options.group ?? null,
        getSubcommand: () => options.sub ?? null,
      },
      reply: (m: any) => replies.push(m),
    },
  } as any;
}

test('autorole persists the role and reports it set', async () => {
  const db = freshDb();
  const replies: any[] = [];
  await autorole.run(ctxFor(db, replies, { role: { id: 'r1' } }));

  expect(guildsRepo(db).get('g1')?.joinRoleId).toBe('r1');
  expect(renderedText(replies[0])).toBe('joinRole.reply.roleSet');
});

test('autorole with no role clears it and reports a reset', async () => {
  const db = freshDb();
  guildsRepo(db).update('g1', { joinRoleId: 'r1' });
  const replies: any[] = [];
  await autorole.run(ctxFor(db, replies, {}));

  expect(guildsRepo(db).get('g1')?.joinRoleId).toBeNull();
  expect(renderedText(replies[0])).toBe('joinRole.reply.roleReset');
});

test('logsystem persists the channel and clears it when omitted', async () => {
  const db = freshDb();
  const replies: any[] = [];

  await logSystem.run(ctxFor(db, replies, { channel: { id: 'c1' } }));
  expect(guildsRepo(db).get('g1')?.logChannelId).toBe('c1');
  expect(renderedText(replies[0])).toBe('logSystem.reply.activated');

  await logSystem.run(ctxFor(db, replies, {}));
  expect(guildsRepo(db).get('g1')?.logChannelId).toBeNull();
  expect(renderedText(replies[1])).toBe('logSystem.reply.deactivated');
});

test('channel set join/leave persist to the matching columns', async () => {
  const db = freshDb();
  const replies: any[] = [];

  await channelSetup.run(ctxFor(db, replies, { group: 'set', sub: 'join', channel: { id: 'c1' } }));
  await channelSetup.run(
    ctxFor(db, replies, { group: 'set', sub: 'leave', channel: { id: 'c2' } }),
  );

  const row = guildsRepo(db).get('g1');
  expect(row?.welcomeChannelId).toBe('c1');
  expect(row?.goodbyeChannelId).toBe('c2');
});

test('channel unset clears only the named column', async () => {
  const db = freshDb();
  guildsRepo(db).update('g1', { welcomeChannelId: 'c1', goodbyeChannelId: 'c2' });
  const replies: any[] = [];

  await channelSetup.run(ctxFor(db, replies, { group: 'unset', sub: 'join' }));

  const row = guildsRepo(db).get('g1');
  expect(row?.welcomeChannelId).toBeNull();
  expect(row?.goodbyeChannelId).toBe('c2');
});

test('track add/remove persist each counter column', async () => {
  const db = freshDb();
  const replies: any[] = [];

  await track.run(ctxFor(db, replies, { group: 'add', sub: 'online', channel: { id: 'c1' } }));
  await track.run(ctxFor(db, replies, { group: 'add', sub: 'all', channel: { id: 'c2' } }));
  await track.run(ctxFor(db, replies, { group: 'add', sub: 'bots', channel: { id: 'c3' } }));

  let row = guildsRepo(db).get('g1');
  expect([row?.onlineChannelId, row?.allChannelId, row?.botChannelId]).toEqual(['c1', 'c2', 'c3']);

  await track.run(ctxFor(db, replies, { group: 'remove', sub: 'all' }));
  row = guildsRepo(db).get('g1');
  expect([row?.onlineChannelId, row?.allChannelId, row?.botChannelId]).toEqual(['c1', null, 'c3']);
});

test('welcome and goodbye messages persist and reset', async () => {
  const db = freshDb();
  const replies: any[] = [];

  await welcomeMessage.run(ctxFor(db, replies, { string: 'hi there' }));
  await goodbyeMessage.run(ctxFor(db, replies, { string: 'bye now' }));

  let row = cMessagesRepo(db).get('g1');
  expect(row?.welcomeMessage).toBe('hi there');
  expect(row?.goodbyeMessage).toBe('bye now');

  await welcomeMessage.run(ctxFor(db, replies, {}));
  row = cMessagesRepo(db).get('g1');
  expect(row?.welcomeMessage).toBeNull();
  // Resetting the welcome message must not disturb the goodbye message.
  expect(row?.goodbyeMessage).toBe('bye now');
  expect(renderedText(replies[2])).toBe('welcome.reply.messageReset');
});
