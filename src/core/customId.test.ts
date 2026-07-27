import { test, expect } from 'bun:test';
import { encodeId, decodeId } from './customId';

test('round-trips feature/action/args', () => {
  const id = encodeId('help', 'nav', 'next', '2');
  expect(id).toBe('help:nav:next:2');
  expect(decodeId(id)).toEqual({ feature: 'help', action: 'nav', args: ['next', '2'] });
});
test('throws when over 100 chars', () => {
  expect(() => encodeId('f', 'a', 'x'.repeat(100))).toThrow();
});
