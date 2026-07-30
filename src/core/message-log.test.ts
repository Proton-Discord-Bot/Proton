import { test, expect } from 'bun:test';
import { formatField, relativeTimestamp, truncate } from './message-log';

test('formatField renders a bold name above its value', () => {
  expect(formatField({ name: 'Author', value: '<@123>' })).toBe('**Author**\n<@123>');
});

test('formatField substitutes a placeholder for empty values', () => {
  expect(formatField({ name: 'Message Content', value: '' })).toBe(
    '**Message Content**\n*(empty)*',
  );
});

test('relativeTimestamp renders whole seconds in Discord relative format', () => {
  expect(relativeTimestamp(1_700_000_000_500)).toBe('<t:1700000000:R>');
});

test('truncate leaves short content untouched', () => {
  expect(truncate('hello', 10)).toBe('hello');
});

test('truncate caps overlong content at the limit including the ellipsis', () => {
  const out = truncate('x'.repeat(50), 10);
  expect(out).toBe('xxxxxxxxx…');
  expect(out).toHaveLength(10);
});
