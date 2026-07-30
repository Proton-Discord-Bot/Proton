import { test, expect } from 'bun:test';
import { banMember, kickMember } from './moderation';

test('kickMember refuses a member the bot cannot kick', async () => {
  let called = false;
  const member: any = {
    kickable: false,
    kick: async () => {
      called = true;
    },
  };
  expect(await kickMember(member, 'spam')).toBe(false);
  expect(called).toBe(false);
});

test('kickMember kicks with the reason and reports success', async () => {
  let reason: string | undefined;
  const member: any = {
    kickable: true,
    kick: async (r: string) => {
      reason = r;
    },
  };
  expect(await kickMember(member, 'spam')).toBe(true);
  expect(reason).toBe('spam');
});

test('kickMember reports failure when the kick rejects', async () => {
  const member: any = {
    kickable: true,
    kick: async () => {
      throw new Error('missing permissions');
    },
  };
  // Legacy did not await the kick, so a rejection escaped the try/catch and the
  // helper reported success anyway.
  expect(await kickMember(member, 'spam')).toBe(false);
});

test('banMember refuses a member the bot cannot ban', async () => {
  const member: any = { bannable: false, ban: async () => {} };
  expect(await banMember(member, 'spam')).toBe(false);
});

test('banMember passes the reason as ban options', async () => {
  let opts: unknown;
  const member: any = {
    bannable: true,
    ban: async (o: unknown) => {
      opts = o;
    },
  };
  expect(await banMember(member, 'spam')).toBe(true);
  expect(opts).toEqual({ reason: 'spam' });
});

test('banMember reports failure when the ban rejects', async () => {
  const member: any = {
    bannable: true,
    ban: async () => {
      throw new Error('missing permissions');
    },
  };
  expect(await banMember(member, 'spam')).toBe(false);
});
