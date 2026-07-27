import type { GuildMember } from 'discord.js';
import { logger } from './logger';

/**
 * Kicks a member, reporting whether it succeeded.
 *
 * FIX: the legacy helper called `user.kick(reason)` without awaiting it, so a rejected
 * kick escaped the surrounding try/catch — the helper returned `true` regardless and the
 * rejection surfaced as an unhandled promise rejection.
 */
export async function kickMember(member: GuildMember, reason?: string): Promise<boolean> {
  if (!member.kickable) return false;
  try {
    await member.kick(reason);
    return true;
  } catch (err) {
    logger.error(`Failed to kick member ${member.id}:`, err);
    return false;
  }
}

/** Bans a member, reporting whether it succeeded. Same missing-await fix as `kickMember`. */
export async function banMember(member: GuildMember, reason?: string): Promise<boolean> {
  if (!member.bannable) return false;
  try {
    await member.ban({ reason });
    return true;
  } catch (err) {
    logger.error(`Failed to ban member ${member.id}:`, err);
    return false;
  }
}
