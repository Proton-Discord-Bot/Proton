import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { defineChatCommand } from '../../core/command';
import { reply, type Block } from '../../core/reply';
import { warnsRepo } from '../../db/repos';
import { localizations, tEn } from '../../i18n';

const WARN_ACCENT_COLOR = 0xff0000;

/** Warn count at which the moderator gets the "consider taking action" escalation notice. */
export const ESCALATION_THRESHOLD = 3;

// FIX: legacy passed two arguments to `setDefaultMemberPermissions`, which takes a single
// bitfield — the second was silently dropped, so the command gated on KickMembers alone.
const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription(tEn('warn.command.description'))
  .setDescriptionLocalizations(localizations('warn.command.description'))
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription(tEn('warn.command.userOptionDescription'))
      .setDescriptionLocalizations(localizations('warn.command.userOptionDescription'))
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('reason')
      .setDescription(tEn('warn.command.stringOptionDescription'))
      .setDescriptionLocalizations(localizations('warn.command.stringOptionDescription'))
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers)
  .setContexts(InteractionContextType.Guild);

export default defineChatCommand({
  data,
  guildOnly: true,
  async run({ interaction, t, db }) {
    const { guild } = interaction;
    if (!guild) return;

    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);

    if (user.id === interaction.user.id) {
      return interaction.reply(reply.ephemeralText(t('warn.reply.notYourself')));
    }

    const member = await guild.members.fetch(user.id);

    // FIX: legacy called `.has(KickMembers, BanMembers)`, where the second argument is
    // discord.js's `checkAdmin` flag, not a second permission — so it never tested
    // BanMembers and, worse, `has(x, false)` made admins warnable.
    const isModerator =
      member.permissions.has(PermissionFlagsBits.KickMembers) ||
      member.permissions.has(PermissionFlagsBits.BanMembers);

    if (isModerator) {
      return interaction.reply(reply.ephemeralText(t('warn.reply.notAdmin')));
    }

    const warns = warnsRepo(db);
    warns.add(guild.id, user.id, reason);
    const total = warns.count(guild.id, user.id);

    const blocks: Block[] = [
      reply.text_(`## ${t('warn.embed.title')}`),
      reply.text_(t('warn.reason', { reason })),
    ];

    // FIX: legacy sent this as a second, separate reply — and the `components-v2` branch
    // left the common (<3 warns) path with no reply at all. Every path now ends in exactly
    // one reply, with the escalation notice folded into the same container.
    if (total >= ESCALATION_THRESHOLD) {
      blocks.push(
        reply.separator(),
        reply.text_(t('warn.multiple', { user: user.username, count: total })),
        reply.text_(`-# ${t('warn.embed.footer')}`),
      );
    }

    return interaction.reply(
      reply.container({ accent: WARN_ACCENT_COLOR, ephemeral: true, blocks }),
    );
  },
});
