import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import { defineChatCommand } from '../../core/command';
import { reply, type ButtonRow } from '../../core/reply';
import { localizations, tEn } from '../../i18n';

const CONTRIBUTE_ACCENT_COLOR = 0x0099ff;
const DONATE_URL = 'https://buymeacoffee.com/nchoini';
const GITHUB_URL = 'https://github.com/Proton-Bot-Development/Proton/';

const data = new SlashCommandBuilder()
  .setName('contribute')
  .setDescription(tEn('contribute.command.description'))
  .setDescriptionLocalizations(localizations('contribute.command.description'));

export default defineChatCommand({
  data,
  async run({ interaction, t }) {
    const links: ButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(t('contribute.buttons.labelDonate'))
        .setURL(DONATE_URL),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(t('contribute.buttons.labelGithub'))
        .setURL(GITHUB_URL),
    );

    return interaction.reply(
      reply.container({
        accent: CONTRIBUTE_ACCENT_COLOR,
        ephemeral: true,
        blocks: [
          reply.text_(`## ${t('contribute.embed.title')}`),
          reply.text_(t('contribute.embed.description')),
          reply.separator(),
          reply.text_(
            `**${t('contribute.embed.fields.donate.name')}**\n${t('contribute.embed.fields.donate.value')}`,
          ),
          reply.text_(
            `**${t('contribute.embed.fields.github.name')}**\n${t('contribute.embed.fields.github.value')}`,
          ),
          links,
        ],
      }),
    );
  },
});
