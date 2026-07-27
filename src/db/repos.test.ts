import { test, expect } from 'bun:test';
import { createDb, migrateDb } from './client';
import { guildsRepo, warnsRepo } from './repos';

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
