import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  InteractionContextType,
  type GuildMember,
  type UserContextMenuCommandInteraction,
} from 'discord.js';
import { defineCommand } from '../../core/command';
import { reply } from '../../core/reply';
import { canModerate, memberInfoBlocks } from '../info/info';

const INFO_ACCENT_COLOR = 0x0099ff;

const data = new ContextMenuCommandBuilder()
  .setName('Info')
  .setType(ApplicationCommandType.User)
  .setContexts(InteractionContextType.Guild);

export default defineCommand({
  data,
  guildOnly: true,
  async run({ interaction: raw, t }) {
    const interaction = raw as UserContextMenuCommandInteraction;
    const { guild } = interaction;
    if (!guild) return;

    const member = await guild.members.fetch(interaction.targetUser.id);
    const actor = interaction.member as GuildMember | null;

    // Same body and router-backed buttons as `/info`; legacy duplicated the embed here
    // and drove the buttons from a per-message collector.
    const blocks = memberInfoBlocks(member, t, {
      withModerationButtons: !!actor && canModerate(actor.permissions, member),
    });

    return interaction.reply(
      reply.container({ accent: INFO_ACCENT_COLOR, ephemeral: true, blocks }),
    );
  },
});
