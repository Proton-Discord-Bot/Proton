import { Database } from 'bun:sqlite';
import { drizzle, type BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { join } from 'node:path';
import * as schema from './schema';

export type DB = BunSQLiteDatabase<typeof schema>;
export type GuildRow = typeof schema.guilds.$inferSelect;
export type NewGuildRow = typeof schema.guilds.$inferInsert;
export type WarnRow = typeof schema.warns.$inferSelect;
export type CMessageRow = typeof schema.cMessages.$inferSelect;

export function createDb(path: string): DB {
  return drizzle(new Database(path), { schema });
}
export function migrateDb(db: DB) {
  migrate(db, { migrationsFolder: join(import.meta.dir, 'migrations') });
}
