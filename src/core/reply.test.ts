import { test, expect } from 'bun:test';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
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

test('container accepts action rows alongside text blocks', () => {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('a').setLabel('A').setStyle(ButtonStyle.Primary),
  );
  const r = reply.container({ blocks: [reply.text_('hi'), row] });
  const json: any = JSON.parse(JSON.stringify(r)).components[0];

  expect(json.components).toHaveLength(2);
  expect(json.components[1].type).toBe(1);
  expect(json.components[1].components[0].label).toBe('A');
});

test('container keeps block order', () => {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('a').setLabel('A').setStyle(ButtonStyle.Primary),
  );
  const r = reply.container({ blocks: [row, reply.text_('after')] });
  const json: any = JSON.parse(JSON.stringify(r)).components[0];

  expect(json.components[0].type).toBe(1);
  expect(json.components[1].content).toBe('after');
});
