import { test, expect } from 'bun:test';
import { defineCommand } from './command';

test('defineCommand returns the same object', () => {
  const c = defineCommand({ data: { name: 'x', toJSON: () => ({}) as any }, run: async () => {} });
  expect(c.data.name).toBe('x');
});
