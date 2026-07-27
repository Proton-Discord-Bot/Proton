import { test, expect } from 'bun:test';
import { localizations, makeTranslator, resolveLocale, tEn } from './index';

test('resolveLocale falls back to en', () => {
  expect(resolveLocale('fr-FR')).toBe('en');
  expect(resolveLocale('de')).toBe('de');
});
test('interpolates vars', () => {
  const t = makeTranslator('en');
  expect(t('warn.reason', { reason: 'spam' })).toBe('Reason: spam');
});

test('localizations returns a German entry for a key', () => {
  expect(localizations('warn.command.description')).toEqual({ de: 'Warnt einen Benutzer' });
});

test('tEn resolves the English catalog', () => {
  expect(tEn('warn.command.description')).toBe('Warn a user');
});
