import {
  ContainerBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  type Guild,
} from 'discord.js';
import { logger } from '../core/logger';
import type { DB } from '../db/client';
import { guildsRepo } from '../db/repos';

export const LOG_ACCENT_COLOR = 0x0099ff;

/**
 * Per-field cap. Legacy rendered these as embed fields, which Discord caps at 1024
 * characters — a longer message silently threw. Components V2 has no per-field limit,
 * so we keep the same cap deliberately to stay inside the 4000-character message budget.
 */
export const FIELD_LIMIT = 1024;

export interface LogField {
  name: string;
  value: string;
}

export function truncate(value: string, limit: number): string {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 1)}…`;
}

export function formatField({ name, value }: LogField): string {
  return `**${name}**\n${value.length > 0 ? value : '*(empty)*'}`;
}

export function relativeTimestamp(ms: number): string {
  return `<t:${Math.floor(ms / 1000)}:R>`;
}

export function buildLogContainer(opts: {
  title: string;
  avatarUrl: string;
  fields: LogField[];
}): ContainerBuilder {
  const body = opts.fields
    .map((f) => formatField({ name: f.name, value: truncate(f.value, FIELD_LIMIT) }))
    .join('\n\n');

  const header = new SectionBuilder()
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${opts.title}`))
    .setThumbnailAccessory(new ThumbnailBuilder().setURL(opts.avatarUrl));

  return new ContainerBuilder()
    .setAccentColor(LOG_ACCENT_COLOR)
    .addSectionComponents(header)
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(body));
}

/**
 * Posts a log container to the guild's configured log channel. No-ops when logging is
 * unconfigured, or when the configured channel is gone or not sendable by the bot.
 */
export async function sendGuildLog(db: DB, guild: Guild, container: ContainerBuilder) {
  const { logChannelId } = guildsRepo(db).ensure(guild.id);
  if (!logChannelId) return;

  const channel = await guild.channels.fetch(logChannelId).catch(() => null);
  if (!channel?.isSendable()) {
    logger.warn(`Log channel ${logChannelId} for guild ${guild.id} is missing or not sendable`);
    return;
  }

  await channel.send({ flags: [MessageFlags.IsComponentsV2], components: [container] });
}
