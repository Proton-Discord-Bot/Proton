import {
  ContainerBuilder,
  Events,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  MessageFlags,
} from 'discord.js';
import { defineEvent } from '../core/event';
import { logger } from '../core/logger';
import { cMessagesRepo, guildsRepo } from '../db/repos';

const WELCOME_ACCENT_COLOR = 0x0099ff;

export function resolveWelcomeText(
  custom: string | null | undefined,
  username: string,
  guildName: string,
): string {
  if (custom && custom.length > 0) return custom;
  return `Welcome ${username} to ${guildName}!`;
}

export default defineEvent({
  name: Events.GuildMemberAdd,
  async execute(client, member) {
    const dbGuild = guildsRepo(client.db).ensure(member.guild.id);

    // Autorole first, unconditionally, and independent of the welcome message/channel
    // below. A missing or too-low role must not crash the handler.
    if (dbGuild.joinRoleId) {
      try {
        await member.roles.add(dbGuild.joinRoleId);
      } catch (err) {
        logger.error(`Failed to add join role for member ${member.id} in guild ${member.guild.id}:`, err);
      }
    }

    if (!dbGuild.welcomeChannelId) return;

    const custom = cMessagesRepo(client.db).get(member.guild.id)?.welcomeMessage;
    const text = resolveWelcomeText(custom, member.user.username, member.guild.name);

    const channel = await member.guild.channels.fetch(dbGuild.welcomeChannelId);
    if (!channel?.isSendable()) return;

    const section = new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('**Welcome**'),
        new TextDisplayBuilder().setContent(text),
      )
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(member.user.displayAvatarURL()));

    const container = new ContainerBuilder()
      .setAccentColor(WELCOME_ACCENT_COLOR)
      .addSectionComponents(section);

    await channel.send({ flags: [MessageFlags.IsComponentsV2], components: [container] });
  },
});
