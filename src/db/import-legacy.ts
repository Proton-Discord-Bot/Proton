import { Database } from 'bun:sqlite';
import { getTableColumns } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import type { DB } from './client';
import { guilds, warns, cMessages } from './schema';

export interface ImportLegacyOptions {
  legacyPath: string;
  targetDb: DB;
}

export interface ImportLegacyCounts {
  guilds: number;
  warns: number;
  cMessages: number;
}

const TIMESTAMP_COLUMNS = new Set(['createdAt', 'updatedAt']);

type LegacyRow = Record<string, unknown>;

function legacyTableExists(legacy: Database, tableName: string): boolean {
  const row = legacy
    .query(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
    .get(tableName);
  return row != null;
}

function targetHasRows(targetDb: DB, table: SQLiteTable): boolean {
  return targetDb.select().from(table).all().length > 0;
}

function mapRow(row: LegacyRow, columnNames: string[]): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  for (const column of columnNames) {
    if (!(column in row)) continue;
    const value = row[column];
    if (TIMESTAMP_COLUMNS.has(column)) {
      if (typeof value === 'string' && value.length > 0) {
        mapped[column] = new Date(value);
      }
      // null/undefined/empty -> omit, let it default to null
      continue;
    }
    mapped[column] = value;
  }
  return mapped;
}

function importTable(
  legacy: Database,
  targetDb: DB,
  tableName: string,
  table: SQLiteTable,
): number {
  if (!legacyTableExists(legacy, tableName)) return 0;
  if (targetHasRows(targetDb, table)) return 0;

  const legacyRows = legacy.query(`SELECT * FROM ${tableName}`).all() as LegacyRow[];
  if (legacyRows.length === 0) return 0;

  const columnNames = Object.keys(getTableColumns(table));

  let inserted = 0;
  for (const legacyRow of legacyRows) {
    const values = mapRow(legacyRow, columnNames);
    const result = targetDb.insert(table).values(values).onConflictDoNothing().run();
    if ((result as unknown as { changes: number }).changes > 0) inserted += 1;
  }
  return inserted;
}

export function importLegacy({ legacyPath, targetDb }: ImportLegacyOptions): ImportLegacyCounts {
  const legacy = new Database(legacyPath, { readonly: true });
  try {
    return {
      guilds: importTable(legacy, targetDb, 'guilds', guilds),
      warns: importTable(legacy, targetDb, 'warns', warns),
      cMessages: importTable(legacy, targetDb, 'cMessages', cMessages),
    };
  } finally {
    legacy.close();
  }
}
