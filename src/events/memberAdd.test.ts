import { test, expect } from 'bun:test';
import { resolveWelcomeText } from './memberAdd';

test('resolveWelcomeText returns custom message verbatim when non-empty', () => {
  expect(resolveWelcomeText('Yo <u>, glad you made it!', 'Alice', 'Wonderland')).toBe(
    'Yo <u>, glad you made it!',
  );
});

test('resolveWelcomeText falls back to default when custom is null', () => {
  expect(resolveWelcomeText(null, 'Alice', 'Wonderland')).toBe('Welcome Alice to Wonderland!');
});

test('resolveWelcomeText falls back to default when custom is undefined', () => {
  expect(resolveWelcomeText(undefined, 'Alice', 'Wonderland')).toBe(
    'Welcome Alice to Wonderland!',
  );
});

test('resolveWelcomeText falls back to default when custom is empty string', () => {
  expect(resolveWelcomeText('', 'Alice', 'Wonderland')).toBe('Welcome Alice to Wonderland!');
});
