import {
  ChannelType,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { defineChatCommand } from '../../core/command';
import { reply } from '../../core/reply';
import { guildsRepo } from '../../db/repos';
import { localizations, tEn } from '../../i18n';

const data = new SlashCommandBuilder()
  .setName('join2create')
  .setDescription(tEn('join2Create.command.description'))
  .setDescriptionLocalizations(localizations('join2Create.command.description'))
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription(tEn('join2Create.command.channelOptionDescription'))
      .setDescriptionLocalizations(localizations('join2Create.command.channelOptionDescription'))
      .addChannelTypes(ChannelType.GuildVoice),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setContexts(InteractionContextType.Guild);

export default defineChatCommand({
  data,
  guildOnly: true,
  async run({ interaction, t, db, guildId }) {
    if (!guildId) return;

    // Omitting the channel turns join-to-create off.
    const channel = interaction.options.getChannel('channel');
    guildsRepo(db).update(guildId, { join2CreateChannelId: channel?.id ?? null });

    return interaction.reply(
      reply.ephemeralText(
        t(channel ? 'join2Create.reply.activated' : 'join2Create.reply.deactivated'),
      ),
    );
  },
});
