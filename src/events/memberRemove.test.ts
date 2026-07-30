import { test, expect } from 'bun:test';
import { resolveGoodbyeText } from './memberRemove';

test('resolveGoodbyeText returns custom message verbatim when non-empty', () => {
  expect(resolveGoodbyeText('See ya, <u>!', 'Alice')).toBe('See ya, <u>!');
});

test('resolveGoodbyeText falls back to default when custom is null', () => {
  expect(resolveGoodbyeText(null, 'Alice')).toBe('**Alice** left the server!');
});

test('resolveGoodbyeText falls back to default when custom is undefined', () => {
  expect(resolveGoodbyeText(undefined, 'Alice')).toBe('**Alice** left the server!');
});

test('resolveGoodbyeText falls back to default when custom is empty string', () => {
  expect(resolveGoodbyeText('', 'Alice')).toBe('**Alice** left the server!');
});
