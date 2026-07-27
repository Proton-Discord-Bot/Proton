import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { defineChatCommand } from '../../core/command';
import { reply } from '../../core/reply';
import { guildsRepo } from '../../db/repos';
import { localizations, tEn, type I18nKey } from '../../i18n';

type Counter = 'online' | 'all' | 'bots';

const COLUMNS: Record<Counter, 'onlineChannelId' | 'allChannelId' | 'botChannelId'> = {
  online: 'onlineChannelId',
  all: 'allChannelId',
  bots: 'botChannelId',
};

const SET_KEYS: Record<Counter, I18nKey> = {
  online: 'track.reply.onlineSet',
  all: 'track.reply.allSet',
  bots: 'track.reply.botsSet',
};

const UNSET_KEYS: Record<Counter, I18nKey> = {
  online: 'track.reply.onlineUnset',
  all: 'track.reply.allUnset',
  bots: 'track.reply.botsUnset',
};

const COUNTERS: Counter[] = ['online', 'all', 'bots'];

const ADD_DESCRIPTIONS: Record<Counter, I18nKey> = {
  online: 'track.command.addOnlineDescription',
  all: 'track.command.addAllDescription',
  bots: 'track.command.addBotsDescription',
};

const REMOVE_DESCRIPTIONS: Record<Counter, I18nKey> = {
  online: 'track.command.removeOnlineDescription',
  all: 'track.command.removeAllDescription',
  bots: 'track.command.removeBotsDescription',
};

const data = new SlashCommandBuilder()
  .setName('track')
  .setDescription('-')
  .addSubcommandGroup((group) => {
    group.setName('add').setDescription('-');
    for (const counter of COUNTERS) {
      group.addSubcommand((sub) =>
        sub
          .setName(counter)
          .setDescription(tEn(ADD_DESCRIPTIONS[counter]))
          .setDescriptionLocalizations(localizations(ADD_DESCRIPTIONS[counter]))
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription(tEn('track.command.channelOptionDesciption'))
              .setDescriptionLocalizations(localizations('track.command.channelOptionDesciption'))
              .setRequired(true),
          ),
      );
    }
    return group;
  })
  .addSubcommandGroup((group) => {
    group.setName('remove').setDescription('-');
    for (const counter of COUNTERS) {
      group.addSubcommand((sub) =>
        sub
          .setName(counter)
          .setDescription(tEn(REMOVE_DESCRIPTIONS[counter]))
          .setDescriptionLocalizations(localizations(REMOVE_DESCRIPTIONS[counter])),
      );
    }
    return group;
  })
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setContexts(InteractionContextType.Guild);

export default defineChatCommand({
  data,
  guildOnly: true,
  async run({ interaction, t, db, guildId }) {
    if (!guildId) return;

    const group = interaction.options.getSubcommandGroup();
    const counter = interaction.options.getSubcommand() as Counter;
    const column = COLUMNS[counter];
    if (!column) return;

    if (group === 'remove') {
      guildsRepo(db).update(guildId, { [column]: null });
      return interaction.reply(reply.ephemeralText(t(UNSET_KEYS[counter])));
    }

    const channel = interaction.options.getChannel('channel', true);
    guildsRepo(db).update(guildId, { [column]: channel.id });

    return interaction.reply(
      reply.ephemeralText(t(SET_KEYS[counter], { channel: `<#${channel.id}>` })),
    );
  },
});
