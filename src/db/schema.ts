import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const guilds = sqliteTable('guilds', {
  guildId: text('guildId').primaryKey(),
  onlineChannelId: text('onlineChannelId'),
  allChannelId: text('allChannelId'),
  botChannelId: text('botChannelId'),
  welcomeChannelId: text('welcomeChannelId'),
  goodbyeChannelId: text('goodbyeChannelId'),
  join2CreateChannelId: text('join2CreateChannelId'),
  logChannelId: text('logChannelId'),
  joinRoleId: text('joinRoleId'),
  createdAt: integer('createdAt', { mode: 'timestamp' }),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }),
});
export const warns = sqliteTable('warns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  guildId: text('guildId').notNull(),
  userId: text('userId').notNull(),
  reason: text('reason').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }),
});
export const cMessages = sqliteTable('cMessages', {
  guildId: text('guildId').primaryKey(),
  welcomeMessage: text('welcomeMessage'),
  goodbyeMessage: text('goodbyeMessage'),
  createdAt: integer('createdAt', { mode: 'timestamp' }),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }),
});
