import { test, expect } from 'bun:test';
import { MessageFlags } from 'discord.js';
import { reply } from './reply';

test('text sets IsComponentsV2 flag and one component', () => {
  const r = reply.text('Pong!');
  expect(r.flags).toContain(MessageFlags.IsComponentsV2);
  expect(r.components).toHaveLength(1);
});
test('ephemeralText also sets Ephemeral', () => {
  const r = reply.ephemeralText('nope');
  expect(r.flags).toContain(MessageFlags.Ephemeral);
  expect(r.flags).toContain(MessageFlags.IsComponentsV2);
});
