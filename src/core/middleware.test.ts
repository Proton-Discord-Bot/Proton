import { test, expect } from 'bun:test';
import { compose, cooldown } from './middleware';

test('compose runs middleware in order then final', async () => {
  const order: string[] = [];
  const mw = async (_c: any, next: any) => {
    order.push('a');
    await next();
  };
  await compose([mw], async () => {
    order.push('final');
  })({} as any);
  expect(order).toEqual(['a', 'final']);
});

test('cooldown blocks the second call within the window', async () => {
  const replies: unknown[] = [];
  const ctx: any = {
    t: (key: string) => key,
    interaction: { user: { id: 'u1' }, commandName: 'c', reply: (m: unknown) => replies.push(m) },
  };
  const run = async () => {
    replies.push('ran');
  };
  await compose([cooldown(60)], run)(ctx);
  await compose([cooldown(60)], run)(ctx);
  expect(replies.filter((r) => r === 'ran')).toHaveLength(1); // second blocked
});
