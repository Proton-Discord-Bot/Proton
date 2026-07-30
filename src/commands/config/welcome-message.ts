import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { defineChatCommand } from '../../core/command';
import { reply } from '../../core/reply';
import { cMessagesRepo } from '../../db/repos';
import { localizations, tEn } from '../../i18n';

const data = new SlashCommandBuilder()
  .setName('welcome')
  .setDescription(tEn('welcome.command.description'))
  .setDescriptionLocalizations(localizations('welcome.command.description'))
  .addStringOption((option) =>
    option
      .setName('message')
      .setDescription(tEn('welcome.command.stringOptionDescription'))
      .setDescriptionLocalizations(localizations('welcome.command.stringOptionDescription')),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setContexts(InteractionContextType.Guild);

export default defineChatCommand({
  data,
  guildOnly: true,
  async run({ interaction, t, db, guildId }) {
    if (!guildId) return;

    // Omitting the option resets the message back to the built-in default.
    const message = interaction.options.getString('message');
    cMessagesRepo(db).set(guildId, { welcomeMessage: message });

    return interaction.reply(
      reply.ephemeralText(t(message ? 'welcome.reply.messageSet' : 'welcome.reply.messageReset')),
    );
  },
});
