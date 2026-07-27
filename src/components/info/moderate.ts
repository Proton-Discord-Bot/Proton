import { PermissionFlagsBits, type GuildMember } from 'discord.js';
import { defineComponent } from '../../core/component';
import { banMember, kickMember } from '../../core/moderation';
import { reply } from '../../core/reply';

/**
 * Kick/ban buttons attached to `/info`.
 *
 * The message is ephemeral, so only the invoker can see the buttons — but the permission
 * check is repeated here rather than trusted from the command that rendered them, since a
 * moderator's roles can change between the reply and the click.
 */
export default defineComponent({
  match: 'info',
  async run({ interaction, t, action, args }) {
    const [targetId] = args;
    const { guild } = interaction;

    if (!guild || !targetId || (action !== 'kick' && action !== 'ban')) {
      return interaction.reply(reply.ephemeralText(t('errors.smthWentWrong')));
    }

    const actor = interaction.member as GuildMember | null;
    const allowed = actor?.permissions.has([
      PermissionFlagsBits.BanMembers,
      PermissionFlagsBits.KickMembers,
    ]);
    if (!allowed) {
      return interaction.reply(reply.ephemeralText(t('errors.noPerms')));
    }

    const target = await guild.members.fetch(targetId).catch(() => null);
    if (!target) {
      return interaction.reply(reply.ephemeralText(t('errors.smthWentWrong')));
    }

    if (action === 'kick') {
      const ok = await kickMember(target);
      return interaction.reply(
        reply.ephemeralText(ok ? t('success.kickSuccess') : t('errors.notAbleToKickUser')),
      );
    }

    const ok = await banMember(target);
    return interaction.reply(
      reply.ephemeralText(ok ? t('success.banSuccess') : t('errors.notAbleToBanUser')),
    );
  },
});
