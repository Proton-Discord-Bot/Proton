import type { GuildMember, UserContextMenuCommandInteraction } from 'discord.js';
import type { CommandContext } from './command';
import type { I18nKey } from '../i18n';
import { reply } from './reply';
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

export interface ModerationAction {
  /** Permission the invoker must hold. */
  permission: bigint;
  act(member: GuildMember): Promise<boolean>;
  successKey: I18nKey;
  failureKey: I18nKey;
}

/**
 * Shared body of the Ban and Kick user context menus: check the invoker's permission,
 * refuse bots, then act and report. Legacy duplicated this across both command files.
 */
export async function moderateTarget(ctx: CommandContext, action: ModerationAction) {
  const interaction = ctx.interaction as UserContextMenuCommandInteraction;
  const { t } = ctx;
  const { guild } = interaction;
  if (!guild) return;

  const actor = interaction.member as GuildMember | null;
  if (!actor?.permissions.has(action.permission)) {
    return interaction.reply(reply.ephemeralText(t('errors.noPerms')));
  }

  if (interaction.targetUser.bot) {
    return interaction.reply(reply.ephemeralText(t(action.failureKey)));
  }

  const target = await guild.members.fetch(interaction.targetUser.id).catch(() => null);
  if (!target) {
    return interaction.reply(reply.ephemeralText(t('errors.smthWentWrong')));
  }

  const ok = await action.act(target);
  return interaction.reply(reply.ephemeralText(t(ok ? action.successKey : action.failureKey)));
}
