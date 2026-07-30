import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { defineChatCommand } from '../../core/command';
import { logger } from '../../core/logger';
import { reply } from '../../core/reply';
import { localizations, tEn } from '../../i18n';

export const MAX_BULK_DELETE = 100;
export const MIN_BULK_DELETE = 1;

/** Resolves the guard branch for an amount, or `null` when the amount is deletable. */
export function clearGuard(amount: number): 'clear.reply.over100' | 'clear.reply.under1' | null {
  if (amount > MAX_BULK_DELETE) return 'clear.reply.over100';
  if (amount < MIN_BULK_DELETE) return 'clear.reply.under1';
  return null;
}

const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription(tEn('clear.command.description'))
  .setDescriptionLocalizations(localizations('clear.command.description'))
  .addIntegerOption((option) =>
    option
      .setName('amount')
      .setDescription(tEn('clear.command.integerOptionDescription'))
      .setDescriptionLocalizations(localizations('clear.command.integerOptionDescription'))
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export default defineChatCommand({
  data,
  guildOnly: true,
  async run({ interaction, t }) {
    const amount = interaction.options.getInteger('amount', true);

    const blocked = clearGuard(amount);
    if (blocked) return interaction.reply(reply.ephemeralText(t(blocked)));

    const channel = interaction.channel;
    if (!channel || !('bulkDelete' in channel)) {
      return interaction.reply(reply.ephemeralText(t('clear.reply.error')));
    }

    try {
      const deleted = await channel.bulkDelete(amount, true);
      // bulkDelete silently skips messages older than 14 days, so report the real count.
      return interaction.reply(
        reply.ephemeralText(t('clear.reply.success', { count: deleted.size })),
      );
    } catch (err) {
      logger.error('Failed to bulk delete messages:', err);
      return interaction.reply(reply.ephemeralText(t('clear.reply.error')));
    }
  },
});
