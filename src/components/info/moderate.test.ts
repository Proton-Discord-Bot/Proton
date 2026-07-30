import { test, expect } from 'bun:test';
import { renderedText } from '../../test-utils/render';
import moderate from './moderate';

function ctxFor(
  action: string,
  args: string[],
  opts: { allowed?: boolean; kickable?: boolean } = {},
) {
  const replies: any[] = [];
  const ctx: any = {
    t: (k: string) => k,
    action,
    args,
    interaction: {
      guild: {
        members: {
          fetch: async () => ({
            id: 'target',
            kickable: opts.kickable ?? true,
            bannable: opts.kickable ?? true,
            kick: async () => {},
            ban: async () => {},
          }),
        },
      },
      member: { permissions: { has: () => opts.allowed ?? true } },
      reply: (m: any) => replies.push(m),
    },
  };
  return { ctx, replies };
}

test('kicks the target and reports success', async () => {
  const { ctx, replies } = ctxFor('kick', ['target']);
  await moderate.run(ctx);
  expect(renderedText(replies[0])).toBe('success.kickSuccess');
});

test('bans the target and reports success', async () => {
  const { ctx, replies } = ctxFor('ban', ['target']);
  await moderate.run(ctx);
  expect(renderedText(replies[0])).toBe('success.banSuccess');
});

test('reports failure when the member is not kickable', async () => {
  const { ctx, replies } = ctxFor('kick', ['target'], { kickable: false });
  await moderate.run(ctx);
  expect(renderedText(replies[0])).toBe('errors.notAbleToKickUser');
});

test('refuses a clicker who no longer has the permissions', async () => {
  const { ctx, replies } = ctxFor('kick', ['target'], { allowed: false });
  await moderate.run(ctx);
  expect(renderedText(replies[0])).toBe('errors.noPerms');
});

test('rejects an unknown action', async () => {
  const { ctx, replies } = ctxFor('explode', ['target']);
  await moderate.run(ctx);
  expect(renderedText(replies[0])).toBe('errors.smthWentWrong');
});
