import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { defineChatCommand } from '../../core/command';
import { reply, type Block } from '../../core/reply';
import { cMessagesRepo, guildsRepo } from '../../db/repos';
import { localizations, tEn, type I18nKey, type Translator } from '../../i18n';

const CONFIG_ACCENT_COLOR = 0x0099ff;

/** Channel mention, or the "not configured" copy for this field. */
function channelOrFallback(id: string | null | undefined, fallback: I18nKey, t: Translator) {
  return id ? `<#${id}>` : t(fallback);
}

function field(name: I18nKey, value: string, t: Translator) {
  return reply.text_(`**${t(name)}**\n${value}`);
}

const data = new SlashCommandBuilder()
  .setName('config')
  .setDescription(tEn('config.commandDesciption'))
  .setDescriptionLocalizations(localizations('config.commandDesciption'))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setContexts(InteractionContextType.Guild);

export default defineChatCommand({
  data,
  guildOnly: true,
  async run({ interaction, t, db, guildId }) {
    if (!guildId) return;

    const g = guildsRepo(db).ensure(guildId);
    const messages = cMessagesRepo(db).get(guildId);

    const blocks: Block[] = [
      reply.text_(`## ${t('config.trackEmbed.title')}`),
      field(
        'config.trackEmbed.fields.online.name',
        channelOrFallback(g.onlineChannelId, 'config.trackEmbed.fields.online.value', t),
        t,
      ),
      field(
        'config.trackEmbed.fields.all.name',
        channelOrFallback(g.allChannelId, 'config.trackEmbed.fields.all.value', t),
        t,
      ),
      field(
        'config.trackEmbed.fields.bots.name',
        channelOrFallback(g.botChannelId, 'config.trackEmbed.fields.bots.value', t),
        t,
      ),
      reply.separator(),
      reply.text_(`## ${t('config.channelEmbed.title')}`),
      field(
        'config.channelEmbed.fields.welcome.name',
        channelOrFallback(g.welcomeChannelId, 'config.channelEmbed.fields.welcome.value', t),
        t,
      ),
      // FIX: legacy read `dbguild.leaveChannelId`, which is not a column — the goodbye
      // channel always rendered as unconfigured even when it was set.
      field(
        'config.channelEmbed.fields.leave.name',
        channelOrFallback(g.goodbyeChannelId, 'config.channelEmbed.fields.leave.value', t),
        t,
      ),
      field(
        'config.channelEmbed.fields.welcomeMessage.name',
        `\`\`\`${messages?.welcomeMessage || t('config.channelEmbed.fields.welcomeMessage.value')}\`\`\``,
        t,
      ),
      field(
        'config.channelEmbed.fields.goodbyeMessage.name',
        `\`\`\`${messages?.goodbyeMessage || t('config.channelEmbed.fields.goodbyeMessage.value')}\`\`\``,
        t,
      ),
    ];

    return interaction.reply(
      reply.container({ accent: CONFIG_ACCENT_COLOR, ephemeral: true, blocks }),
    );
  },
});
