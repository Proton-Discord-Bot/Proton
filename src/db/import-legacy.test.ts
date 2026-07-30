import { test, expect, afterAll } from 'bun:test';
import { unlinkSync } from 'node:fs';
import { Database } from 'bun:sqlite';
import { createDb, migrateDb } from './client';
import { guilds } from './schema';
import { importLegacy } from './import-legacy';

const legacyPaths: string[] = [];

function makeLegacyPath(): string {
  const path = `/tmp/legacy-${Date.now()}-${Math.random().toString(36).slice(2)}.sqlite`;
  legacyPaths.push(path);
  return path;
}

afterAll(() => {
  for (const path of legacyPaths) {
    try {
      unlinkSync(path);
    } catch {
      // already gone / never created — fine
    }
  }
});

test('imports rows from a legacy sqlite file', () => {
  const legacyPath = makeLegacyPath();
  const legacy = new Database(legacyPath);
  legacy.run(
    `CREATE TABLE guilds (guildId TEXT PRIMARY KEY, welcomeChannelId TEXT, createdAt TEXT, updatedAt TEXT)`,
  );
  legacy.run(
    `INSERT INTO guilds (guildId, welcomeChannelId, createdAt) VALUES ('g1','c1','2023-01-01T00:00:00.000Z')`,
  );
  legacy.close();

  const db = createDb(':memory:');
  migrateDb(db);
  const counts = importLegacy({ legacyPath, targetDb: db });
  expect(counts.guilds).toBe(1);
  const row = db.select().from(guilds).all()[0]!;
  expect(row.welcomeChannelId).toBe('c1');
  expect(row.createdAt).toBeInstanceOf(Date);
  expect(row.createdAt?.toISOString()).toBe('2023-01-01T00:00:00.000Z');
});

test('is idempotent — a second import yields 0 counts', () => {
  const legacyPath = makeLegacyPath();
  const legacy = new Database(legacyPath);
  legacy.run(
    `CREATE TABLE guilds (guildId TEXT PRIMARY KEY, welcomeChannelId TEXT, createdAt TEXT, updatedAt TEXT)`,
  );
  legacy.run(`INSERT INTO guilds (guildId, welcomeChannelId) VALUES ('g2','c2')`);
  legacy.close();

  const db = createDb(':memory:');
  migrateDb(db);

  const first = importLegacy({ legacyPath, targetDb: db });
  expect(first.guilds).toBe(1);

  const second = importLegacy({ legacyPath, targetDb: db });
  expect(second.guilds).toBe(0);
  expect(db.select().from(guilds).all()).toHaveLength(1);
});

test('skips missing legacy tables and ignores unknown columns', () => {
  const legacyPath = makeLegacyPath();
  const legacy = new Database(legacyPath);
  legacy.run(
    `CREATE TABLE guilds (guildId TEXT PRIMARY KEY, welcomeChannelId TEXT, legacyOnlyColumn TEXT, createdAt TEXT, updatedAt TEXT)`,
  );
  legacy.run(
    `INSERT INTO guilds (guildId, welcomeChannelId, legacyOnlyColumn) VALUES ('g3','c3','ignored')`,
  );
  legacy.close();

  const db = createDb(':memory:');
  migrateDb(db);
  const counts = importLegacy({ legacyPath, targetDb: db });
  expect(counts.guilds).toBe(1);
  expect(counts.warns).toBe(0);
  expect(counts.cMessages).toBe(0);
});
