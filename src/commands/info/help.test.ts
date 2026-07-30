import { test, expect } from 'bun:test';
import { decodeId } from '../../core/customId';
import { renderedText } from '../../test-utils/render';
import { buildHelpPage, clampPage, COMMANDS_PER_PAGE, helpEntries, pageCount } from './help';

const t = ((k: string) => k) as any;

function fakeCommands(count: number, category = 'moderation') {
  return Array.from({ length: count }, (_, i) => ({
    data: { name: `cmd${i}`, toJSON: () => ({ description: `does ${i}` }) },
    category,
    run: async () => {},
  })) as any[];
}

test('helpEntries carries name, description and a display category', () => {
  const [entry] = helpEntries(fakeCommands(1));
  expect(entry).toEqual({ name: 'cmd0', description: 'does 0', category: '🛡️ Moderation' });
});

test('helpEntries falls back to the raw folder for unknown categories', () => {
  const [entry] = helpEntries(fakeCommands(1, 'weird'));
  expect(entry?.category).toBe('weird');
});

test('helpEntries groups categories together', () => {
  const mixed = [...fakeCommands(2, 'info'), ...fakeCommands(2, 'moderation')];
  const categories = helpEntries(mixed).map((e) => e.category);
  expect(categories).toEqual([
    '🛡️ Moderation',
    '🛡️ Moderation',
    'ℹ️ Information',
    'ℹ️ Information',
  ]);
});

test('pageCount is at least one even with no commands', () => {
  expect(pageCount(0)).toBe(1);
  expect(pageCount(COMMANDS_PER_PAGE)).toBe(1);
  expect(pageCount(COMMANDS_PER_PAGE + 1)).toBe(2);
});

test('clampPage keeps a stale page number in range', () => {
  expect(clampPage(-1, 20)).toBe(0);
  expect(clampPage(99, 20)).toBe(pageCount(20) - 1);
});

test('a single page renders no navigation buttons', () => {
  const blocks = buildHelpPage(helpEntries(fakeCommands(3)), 0, t);
  const json = JSON.parse(JSON.stringify({ components: blocks }));
  expect(json.components.some((c: any) => c.type === 1)).toBe(false);
});

test('nav buttons encode the neighbouring pages and disable at the edges', () => {
  const blocks = buildHelpPage(helpEntries(fakeCommands(20)), 0, t);
  const json = JSON.parse(JSON.stringify({ components: blocks }));
  const row = json.components.find((c: any) => c.type === 1);
  const [prev, next] = row.components;

  expect(decodeId(prev.custom_id)).toEqual({ feature: 'help', action: 'nav', args: ['-1'] });
  expect(prev.disabled).toBe(true);
  expect(decodeId(next.custom_id)).toEqual({ feature: 'help', action: 'nav', args: ['1'] });
  expect(next.disabled).toBe(false);
});

test('the last page disables Next and enables Previous', () => {
  const entries = helpEntries(fakeCommands(20));
  const blocks = buildHelpPage(entries, pageCount(entries.length) - 1, t);
  const json = JSON.parse(JSON.stringify({ components: blocks }));
  const row = json.components.find((c: any) => c.type === 1);
  const [prev, next] = row.components;

  expect(prev.disabled).toBe(false);
  expect(next.disabled).toBe(true);
});

test('a page shows only its slice of commands', () => {
  const blocks = buildHelpPage(helpEntries(fakeCommands(20)), 1, t);
  const text = renderedText({ components: blocks });

  expect(text).toContain('/cmd14');
  expect(text).not.toContain('`/cmd0` ');
  expect(text).toContain('Page 2/4');
});
