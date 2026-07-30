import { test, expect } from 'bun:test';
import { defineComponent } from './component';

test('defineComponent preserves match key', () => {
  const c = defineComponent({ match: 'help:nav', run: async () => {} });
  expect(c.match).toBe('help:nav');
});
