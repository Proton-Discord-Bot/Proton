import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { defineChatCommand } from '../../core/command';
import { reply } from '../../core/reply';
import { guildsRepo } from '../../db/repos';
import { localizations, tEn } from '../../i18n';

const data = new SlashCommandBuilder()
  .setName('logsystem')
  .setDescription(tEn('logSystem.command.description'))
  .setDescriptionLocalizations(localizations('logSystem.command.description'))
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription(tEn('logSystem.command.channelOptionDescription'))
      .setDescriptionLocalizations(localizations('logSystem.command.channelOptionDescription')),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setContexts(InteractionContextType.Guild);

export default defineChatCommand({
  data,
  guildOnly: true,
  async run({ interaction, t, db, guildId }) {
    if (!guildId) return;

    // Omitting the channel disables logging, as in the legacy command.
    const channel = interaction.options.getChannel('channel');
    guildsRepo(db).update(guildId, { logChannelId: channel?.id ?? null });

    return interaction.reply(
      reply.ephemeralText(t(channel ? 'logSystem.reply.activated' : 'logSystem.reply.deactivated')),
    );
  },
});
