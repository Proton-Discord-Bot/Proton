import { test, expect } from 'bun:test';
import { renderedText } from '../../test-utils/render';
import clear, { clearGuard } from './clear';

test('clearGuard rejects more than 100 messages', () => {
  expect(clearGuard(101)).toBe('clear.reply.over100');
});

test('clearGuard rejects fewer than 1 message', () => {
  expect(clearGuard(0)).toBe('clear.reply.under1');
  expect(clearGuard(-5)).toBe('clear.reply.under1');
});

test('clearGuard allows the inclusive bounds', () => {
  expect(clearGuard(1)).toBeNull();
  expect(clearGuard(100)).toBeNull();
});

test('a blocked amount replies without touching the channel', async () => {
  const replies: any[] = [];
  let bulkDeleteCalls = 0;
  await clear.run({
    t: (k: string) => k,
    interaction: {
      options: { getInteger: () => 500 },
      channel: {
        bulkDelete: async () => {
          bulkDeleteCalls += 1;
          return { size: 0 };
        },
      },
      reply: (m: any) => replies.push(m),
    },
  } as any);

  expect(bulkDeleteCalls).toBe(0);
  expect(replies).toHaveLength(1);
});

test('a valid amount reports the count actually deleted', async () => {
  const replies: any[] = [];
  await clear.run({
    t: (k: string, v?: any) => (v ? `${k}:${JSON.stringify(v)}` : k),
    interaction: {
      options: { getInteger: () => 50 },
      channel: { bulkDelete: async () => ({ size: 42 }) },
      reply: (m: any) => replies.push(m),
    },
  } as any);

  expect(renderedText(replies[0])).toContain('count');
  expect(renderedText(replies[0])).toContain('42');
});
