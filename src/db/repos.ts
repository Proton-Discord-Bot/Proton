import { and, eq, sql } from 'drizzle-orm';
import type { DB, GuildRow, CMessageRow } from './client';
import { guilds, warns, cMessages } from './schema';

export function guildsRepo(db: DB) {
  return {
    ensure(guildId: string): GuildRow {
      db.insert(guilds).values({ guildId }).onConflictDoNothing().run();
      return db.select().from(guilds).where(eq(guilds.guildId, guildId)).get()!;
    },
    get: (guildId: string) => db.select().from(guilds).where(eq(guilds.guildId, guildId)).get(),
    update: (guildId: string, patch: Partial<GuildRow>) =>
      db.update(guilds).set(patch).where(eq(guilds.guildId, guildId)).run(),
  };
}
export function warnsRepo(db: DB) {
  return {
    count: (g: string, u: string) =>
      db.select({ n: sql<number>`count(*)` }).from(warns)
        .where(and(eq(warns.guildId, g), eq(warns.userId, u))).get()!.n,
    add: (g: string, u: string, reason: string) =>
      db.insert(warns).values({ guildId: g, userId: u, reason }).run(),
    clear: (g: string, u: string) =>
      // drizzle-orm's bun-sqlite types declare `.run()` as returning `void`, but at
      // runtime bun:sqlite's underlying `stmt.run()` returns `{ changes, lastInsertRowid }`.
      // Cast to line up the types without changing behavior.
      (db.delete(warns).where(and(eq(warns.guildId, g), eq(warns.userId, u))).run() as unknown as {
        changes: number;
      }).changes,
  };
}
export function cMessagesRepo(db: DB) {
  return {
    get: (g: string): CMessageRow | undefined =>
      db.select().from(cMessages).where(eq(cMessages.guildId, g)).get(),
    set: (g: string, patch: Partial<CMessageRow>) =>
      db.insert(cMessages).values({ guildId: g, ...patch })
        .onConflictDoUpdate({ target: cMessages.guildId, set: patch }).run(),
  };
}
