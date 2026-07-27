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
  .setName('channel')
  .setDescription('-')
  .addSubcommandGroup((group) =>
    group
      .setName('set')
      .setDescription('-')
      .addSubcommand((sub) =>
        sub
          .setName('join')
          .setDescription(tEn('channelSetup.command.subCommandJoin.description'))
          .setDescriptionLocalizations(
            localizations('channelSetup.command.subCommandJoin.description'),
          )
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription(tEn('channelSetup.command.subCommandJoin.channelOptionDescription'))
              .setDescriptionLocalizations(
                localizations('channelSetup.command.subCommandJoin.channelOptionDescription'),
              )
              .setRequired(true)
              .addChannelTypes(ChannelType.GuildText),
          ),
      )
      .addSubcommand((sub) =>
        sub
          .setName('leave')
          .setDescription(tEn('channelSetup.command.subCommandLeave.description'))
          .setDescriptionLocalizations(
            localizations('channelSetup.command.subCommandLeave.description'),
          )
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription(tEn('channelSetup.command.subCommandLeave.channelOptionDescription'))
              .setDescriptionLocalizations(
                localizations('channelSetup.command.subCommandLeave.channelOptionDescription'),
              )
              .setRequired(true)
              .addChannelTypes(ChannelType.GuildText),
          ),
      ),
  )
  .addSubcommandGroup((group) =>
    group
      .setName('unset')
      .setDescription('-')
      .addSubcommand((sub) =>
        sub
          .setName('join')
          .setDescription(tEn('channelSetup.command.subCommandUnsetJoinDescription'))
          .setDescriptionLocalizations(
            localizations('channelSetup.command.subCommandUnsetJoinDescription'),
          ),
      )
      .addSubcommand((sub) =>
        sub
          .setName('leave')
          .setDescription(tEn('channelSetup.command.subCommandUnsetLeaveDescription'))
          .setDescriptionLocalizations(
            localizations('channelSetup.command.subCommandUnsetLeaveDescription'),
          ),
      ),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setContexts(InteractionContextType.Guild);

export default defineChatCommand({
  data,
  guildOnly: true,
  async run({ interaction, t, db, guildId }) {
    if (!guildId) return;

    const group = interaction.options.getSubcommandGroup();
    const sub = interaction.options.getSubcommand();
    const column = sub === 'join' ? 'welcomeChannelId' : 'goodbyeChannelId';

    if (group === 'unset') {
      guildsRepo(db).update(guildId, { [column]: null });
      return interaction.reply(
        reply.ephemeralText(
          t(
            sub === 'join'
              ? 'channelSetup.reply.joinChannelUnset'
              : 'channelSetup.reply.leaveChannelUnset',
          ),
        ),
      );
    }

    const channel = interaction.options.getChannel('channel', true);
    guildsRepo(db).update(guildId, { [column]: channel.id });

    return interaction.reply(
      reply.ephemeralText(
        t(
          sub === 'join'
            ? 'channelSetup.reply.joinChannelSet'
            : 'channelSetup.reply.leaveChannelSet',
          { channel: `<#${channel.id}>` },
        ),
      ),
    );
  },
});
