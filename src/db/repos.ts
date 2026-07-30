import { and, eq, inArray, sql } from 'drizzle-orm';
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
    delete: (guildId: string) =>
      (
        db.delete(guilds).where(eq(guilds.guildId, guildId)).run() as unknown as {
          changes: number;
        }
      ).changes,
  };
}
export function warnsRepo(db: DB) {
  return {
    count: (g: string, u: string) =>
      db
        .select({ n: sql<number>`count(*)` })
        .from(warns)
        .where(and(eq(warns.guildId, g), eq(warns.userId, u)))
        .get()!.n,
    add: (g: string, u: string, reason: string) =>
      db.insert(warns).values({ guildId: g, userId: u, reason }).run(),
    /**
     * Clears a user's warns, oldest first. Without `limit` every warn is removed.
     * SQLite only supports `DELETE ... LIMIT` when compiled with an optional flag, so a
     * bounded clear selects the ids first and deletes those.
     */
    clear: (g: string, u: string, limit?: number) => {
      const scope = and(eq(warns.guildId, g), eq(warns.userId, u));

      if (limit !== undefined) {
        if (limit <= 0) return 0;
        const ids = db
          .select({ id: warns.id })
          .from(warns)
          .where(scope)
          .orderBy(warns.id)
          .limit(limit)
          .all()
          .map((row) => row.id);
        if (ids.length === 0) return 0;
        return (
          db.delete(warns).where(inArray(warns.id, ids)).run() as unknown as { changes: number }
        ).changes;
      }

      // drizzle-orm's bun-sqlite types declare `.run()` as returning `void`, but at
      // runtime bun:sqlite's underlying `stmt.run()` returns `{ changes, lastInsertRowid }`.
      // Cast to line up the types without changing behavior.
      return (db.delete(warns).where(scope).run() as unknown as { changes: number }).changes;
    },
    clearGuild: (g: string) =>
      (
        db.delete(warns).where(eq(warns.guildId, g)).run() as unknown as {
          changes: number;
        }
      ).changes,
  };
}
export function cMessagesRepo(db: DB) {
  return {
    get: (g: string): CMessageRow | undefined =>
      db.select().from(cMessages).where(eq(cMessages.guildId, g)).get(),
    set: (g: string, patch: Partial<CMessageRow>) =>
      db
        .insert(cMessages)
        .values({ guildId: g, ...patch })
        .onConflictDoUpdate({ target: cMessages.guildId, set: patch })
        .run(),
    delete: (g: string) =>
      (
        db.delete(cMessages).where(eq(cMessages.guildId, g)).run() as unknown as {
          changes: number;
        }
      ).changes,
  };
}
