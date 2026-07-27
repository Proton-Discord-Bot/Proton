import { test, expect } from 'bun:test';
import { makeTranslator, resolveLocale } from './index';

test('resolveLocale falls back to en', () => {
  expect(resolveLocale('fr-FR')).toBe('en');
  expect(resolveLocale('de')).toBe('de');
});
test('interpolates vars', () => {
  const t = makeTranslator('en');
  expect(t('warn.reason', { reason: 'spam' })).toBe('Reason: spam');
});
