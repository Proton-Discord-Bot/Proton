import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { defineChatCommand } from '../../core/command';
import { reply } from '../../core/reply';
import { warnsRepo } from '../../db/repos';
import { localizations, tEn } from '../../i18n';

const RESET_ACCENT_COLOR = 0x57f287;

// FIX: as in `warn`, `setDefaultMemberPermissions` accepts one bitfield, not two arguments.
const data = new SlashCommandBuilder()
  .setName('resetwarns')
  .setDescription(tEn('resetwarns.command.description'))
  .setDescriptionLocalizations(localizations('resetwarns.command.description'))
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription(tEn('resetwarns.command.userOptionDescription'))
      .setDescriptionLocalizations(localizations('resetwarns.command.userOptionDescription'))
      .setRequired(true),
  )
  .addIntegerOption((option) =>
    option
      .setName('amount')
      .setDescription(tEn('resetwarns.command.integerOptionDescription'))
      .setDescriptionLocalizations(localizations('resetwarns.command.integerOptionDescription'))
      .setMinValue(1),
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
    const amount = interaction.options.getInteger('amount') ?? undefined;

    const warns = warnsRepo(db);

    if (warns.count(guild.id, user.id) === 0) {
      return interaction.reply(
        reply.container({
          accent: RESET_ACCENT_COLOR,
          ephemeral: true,
          blocks: [
            reply.text_(`## ${t('resetwarns.embed.title')}`),
            reply.text_(t('resetwarns.embed.fields.noWarns.name')),
            reply.text_(t('resetwarns.embed.fields.noWarns.value')),
          ],
        }),
      );
    }

    // Report what was actually removed rather than what was asked for: legacy echoed the
    // requested amount even when the user had fewer warns than that.
    const cleared = warns.clear(guild.id, user.id, amount);

    return interaction.reply(
      reply.container({
        accent: RESET_ACCENT_COLOR,
        blocks: [
          reply.text_(`## ${t('resetwarns.embed.title')}`),
          reply.text_(t('resetwarns.embed.fields.reset.name')),
          reply.text_(t('resetwarns.embed.fields.reset.value', { count: cleared })),
        ],
      }),
    );
  },
});
