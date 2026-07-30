import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../core/command';
import { defineChatCommand } from '../../core/command';
import { encodeId } from '../../core/customId';
import { reply, type Block } from '../../core/reply';
import { localizations, tEn, type Translator } from '../../i18n';

const HELP_ACCENT_COLOR = 0x0099ff;
export const COMMANDS_PER_PAGE = 6;

/** Display names for the command folders, matching the legacy help menu. */
const CATEGORY_LABELS: Record<string, string> = {
  moderation: '🛡️ Moderation',
  config: '⚙️ Configuration',
  info: 'ℹ️ Information',
  voice: '🔊 Voice',
  utils: '🔧 Utilities',
  'context-menu': '📱 Context Menu',
};

export interface HelpEntry {
  name: string;
  description: string;
  category: string;
}

function describe(command: Command): string {
  const json = command.data.toJSON() as { description?: string };
  return json.description ?? '';
}

/** Flattens the registry into help entries, ordered by category then command name. */
export function helpEntries(commands: Iterable<Command>): HelpEntry[] {
  const order = Object.keys(CATEGORY_LABELS);

  return [...commands]
    .map((c) => ({
      name: c.data.name,
      description: describe(c),
      category: CATEGORY_LABELS[c.category ?? ''] ?? c.category ?? '',
    }))
    .sort((a, b) => {
      const byCategory =
        order.indexOf(a.category) - order.indexOf(b.category) ||
        a.category.localeCompare(b.category);
      return byCategory !== 0 ? byCategory : a.name.localeCompare(b.name);
    });
}

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / COMMANDS_PER_PAGE));
}

/** Clamps a requested page into range, so a stale button can never render an empty page. */
export function clampPage(page: number, total: number): number {
  return Math.min(Math.max(page, 0), pageCount(total) - 1);
}

export function buildHelpPage(entries: HelpEntry[], page: number, t: Translator): Block[] {
  const pages = pageCount(entries.length);
  const current = clampPage(page, entries.length);
  const slice = entries.slice(current * COMMANDS_PER_PAGE, (current + 1) * COMMANDS_PER_PAGE);

  const grouped = new Map<string, HelpEntry[]>();
  for (const entry of slice) {
    const bucket = grouped.get(entry.category) ?? [];
    bucket.push(entry);
    grouped.set(entry.category, bucket);
  }

  const blocks: Block[] = [
    reply.text_(`## ${t('help.embed.title')}`),
    reply.text_(t('help.embed.description')),
  ];

  for (const [category, items] of grouped) {
    const list = items.map((c) => `\`/${c.name}\` — ${c.description}`).join('\n');
    blocks.push(reply.separator(), reply.text_(`**${category}**\n${list}`));
  }

  blocks.push(
    reply.separator(),
    reply.text_(`-# ${t('help.embed.footer')} • Page ${current + 1}/${pages}`),
  );

  if (pages > 1) {
    blocks.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(encodeId('help', 'nav', String(current - 1)))
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(current === 0),
        new ButtonBuilder()
          .setCustomId(encodeId('help', 'nav', String(current + 1)))
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(current === pages - 1),
      ),
    );
  }

  return blocks;
}

const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription(tEn('help.command.description'))
  .setDescriptionLocalizations(localizations('help.command.description'));

export default defineChatCommand({
  data,
  async run({ interaction, client, t }) {
    const entries = helpEntries(client.commands.values());

    return interaction.reply(
      reply.container({
        accent: HELP_ACCENT_COLOR,
        ephemeral: true,
        blocks: buildHelpPage(entries, 0, t),
      }),
    );
  },
});
