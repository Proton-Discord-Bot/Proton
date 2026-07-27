import { test, expect } from 'bun:test';
import { defineChatCommand, defineCommand } from './command';

test('defineCommand returns the same object', () => {
  const c = defineCommand({ data: { name: 'x', toJSON: () => ({}) as any }, run: async () => {} });
  expect(c.data.name).toBe('x');
});

test('defineChatCommand narrows the context to a chat-input interaction', async () => {
  let seen: unknown;
  const c = defineChatCommand({
    data: { name: 'y', toJSON: () => ({}) as any },
    run: async (ctx) => {
      seen = ctx.interaction;
    },
  });
  await c.run({ interaction: { commandName: 'y' } } as any);
  expect(seen).toEqual({ commandName: 'y' });
});

test('defineChatCommand preserves guildOnly and cooldown', () => {
  const c = defineChatCommand({
    data: { name: 'z', toJSON: () => ({}) as any },
    guildOnly: true,
    cooldown: 5,
    run: async () => {},
  });
  expect(c.guildOnly).toBe(true);
  expect(c.cooldown).toBe(5);
});
