import { ContainerBuilder, Events, TextDisplayBuilder, MessageFlags } from 'discord.js';
import { defineEvent } from '../core/event';
import { cMessagesRepo, guildsRepo } from '../db/repos';

export function resolveGoodbyeText(custom: string | null | undefined, username: string): string {
  if (custom && custom.length > 0) return custom;
  return `**${username}** left the server!`;
}

export default defineEvent({
  name: Events.GuildMemberRemove,
  async execute(client, member) {
    const dbGuild = guildsRepo(client.db).ensure(member.guild.id);

    if (!dbGuild.goodbyeChannelId) return;

    // ENHANCEMENT: legacy always sent a hardcoded goodbye and ignored the stored
    // goodbyeMessage. This now mirrors welcome's custom-vs-default behavior.
    const custom = cMessagesRepo(client.db).get(member.guild.id)?.goodbyeMessage;
    const text = resolveGoodbyeText(custom, member.user.username);

    const channel = await member.guild.channels.fetch(dbGuild.goodbyeChannelId);
    if (!channel?.isSendable()) return;

    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(text),
    );

    await channel.send({ flags: [MessageFlags.IsComponentsV2], components: [container] });
  },
});
