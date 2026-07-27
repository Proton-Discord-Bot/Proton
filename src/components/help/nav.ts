import { MessageFlags, type MessageComponentInteraction } from 'discord.js';
import { defineComponent } from '../../core/component';
import { reply } from '../../core/reply';
import { buildHelpPage, helpEntries } from '../../commands/info/help';

const HELP_ACCENT_COLOR = 0x0099ff;

/**
 * Pagination for `/help`. The page number rides in the customId, so navigation is
 * stateless and keeps working across restarts — legacy used a 5-minute collector that
 * left the buttons dead afterwards.
 */
export default defineComponent({
  match: 'help:nav',
  async run({ interaction, client, t, args }) {
    if (!interaction.isMessageComponent()) return;

    const page = Number.parseInt(args[0] ?? '0', 10);
    const entries = helpEntries(client.commands.values());

    const payload = reply.container({
      accent: HELP_ACCENT_COLOR,
      ephemeral: true,
      blocks: buildHelpPage(entries, Number.isNaN(page) ? 0 : page, t),
    });

    // `update` edits the existing ephemeral message in place; the Ephemeral flag is not
    // valid on an update payload, only IsComponentsV2.
    await (interaction as MessageComponentInteraction).update({
      flags: [MessageFlags.IsComponentsV2],
      components: payload.components,
    });
  },
});
