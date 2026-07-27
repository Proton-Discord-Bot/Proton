import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { defineChatCommand } from '../../core/command';
import { reply } from '../../core/reply';
import { cMessagesRepo } from '../../db/repos';
import { localizations, tEn } from '../../i18n';

const data = new SlashCommandBuilder()
  .setName('goodbye')
  .setDescription(tEn('goodbye.command.description'))
  .setDescriptionLocalizations(localizations('goodbye.command.description'))
  .addStringOption((option) =>
    option
      .setName('message')
      .setDescription(tEn('goodbye.command.messageOptionDescription'))
      .setDescriptionLocalizations(localizations('goodbye.command.messageOptionDescription')),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setContexts(InteractionContextType.Guild);

export default defineChatCommand({
  data,
  guildOnly: true,
  async run({ interaction, t, db, guildId }) {
    if (!guildId) return;

    const message = interaction.options.getString('message');
    cMessagesRepo(db).set(guildId, { goodbyeMessage: message });

    return interaction.reply(
      reply.ephemeralText(t(message ? 'goodbye.reply.messageSet' : 'goodbye.reply.messageReset')),
    );
  },
});
