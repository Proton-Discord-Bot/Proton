import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { defineChatCommand } from '../../core/command';
import { reply } from '../../core/reply';
import { guildsRepo } from '../../db/repos';
import { localizations, tEn } from '../../i18n';

const data = new SlashCommandBuilder()
  .setName('autorole')
  .setDescription(tEn('joinRole.command.description'))
  .setDescriptionLocalizations(localizations('joinRole.command.description'))
  .addRoleOption((option) =>
    option
      .setName('role')
      .setDescription(tEn('joinRole.command.roleOptionDescription'))
      .setDescriptionLocalizations(localizations('joinRole.command.roleOptionDescription')),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setContexts(InteractionContextType.Guild);

export default defineChatCommand({
  data,
  guildOnly: true,
  async run({ interaction, t, db, guildId }) {
    if (!guildId) return;

    // Legacy deferred first and then editReply'd; the write is a local SQLite update, so
    // there is nothing slow to defer for.
    const role = interaction.options.getRole('role');
    guildsRepo(db).update(guildId, { joinRoleId: role?.id ?? null });

    return interaction.reply(
      reply.ephemeralText(t(role ? 'joinRole.reply.roleSet' : 'joinRole.reply.roleReset')),
    );
  },
});
