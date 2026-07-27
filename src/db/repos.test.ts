import { test, expect } from 'bun:test';
import { createDb, migrateDb } from './client';
import { guildsRepo, warnsRepo, cMessagesRepo } from './repos';

test('guildsRepo.ensure is idempotent', () => {
  const db = createDb(':memory:'); migrateDb(db);
  const r = guildsRepo(db);
  const a = r.ensure('g1'); const b = r.ensure('g1');
  expect(a.guildId).toBe('g1'); expect(b.guildId).toBe('g1');
});
test('warnsRepo counts and clears', () => {
  const db = createDb(':memory:'); migrateDb(db);
  const w = warnsRepo(db);
  w.add('g1', 'u1', 'x'); w.add('g1', 'u1', 'y');
  expect(w.count('g1', 'u1')).toBe(2);
  expect(w.clear('g1', 'u1')).toBe(2);
  expect(w.count('g1', 'u1')).toBe(0);
});

test('guildsRepo.delete removes the guild row and reports the changed count', () => {
  const db = createDb(':memory:'); migrateDb(db);
  const r = guildsRepo(db);
  r.ensure('g1');
  expect(r.get('g1')).toBeDefined();
  expect(r.delete('g1')).toBe(1);
  expect(r.get('g1')).toBeUndefined();
});

test('guildsRepo.delete returns 0 when the guild does not exist', () => {
  const db = createDb(':memory:'); migrateDb(db);
  const r = guildsRepo(db);
  expect(r.delete('missing')).toBe(0);
});

test('cMessagesRepo.delete removes the cMessages row and reports the changed count', () => {
  const db = createDb(':memory:'); migrateDb(db);
  const c = cMessagesRepo(db);
  c.set('g1', { welcomeMessage: 'hi' });
  expect(c.get('g1')).toBeDefined();
  expect(c.delete('g1')).toBe(1);
  expect(c.get('g1')).toBeUndefined();
});

test('cMessagesRepo.delete returns 0 when no row exists for the guild', () => {
  const db = createDb(':memory:'); migrateDb(db);
  const c = cMessagesRepo(db);
  expect(c.delete('missing')).toBe(0);
});

test('warnsRepo.clearGuild removes all warns for the guild across multiple users', () => {
  const db = createDb(':memory:'); migrateDb(db);
  const w = warnsRepo(db);
  w.add('g1', 'u1', 'x');
  w.add('g1', 'u2', 'y');
  w.add('g1', 'u2', 'z');
  w.add('g2', 'u1', 'other-guild');
  expect(w.clearGuild('g1')).toBe(3);
  expect(w.count('g1', 'u1')).toBe(0);
  expect(w.count('g1', 'u2')).toBe(0);
  expect(w.count('g2', 'u1')).toBe(1);
});
