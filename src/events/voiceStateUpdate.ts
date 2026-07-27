import { ChannelType, Events } from 'discord.js';
import { defineEvent } from '../core/event';
import { logger } from '../core/logger';
import { guildsRepo } from '../db/repos';

const ROOM_SUFFIX = "'s room";

export function tempRoomName(username: string): string {
  return `${username}${ROOM_SUFFIX}`;
}

export function isTempRoom(channelName: string): boolean {
  return channelName.endsWith(ROOM_SUFFIX);
}

export default defineEvent({
  name: Events.VoiceStateUpdate,
  async execute(client, oldState, newState) {
    // Leaving a channel: tear down the room they vacated if it is an empty temp room.
    if (!newState.channel) {
      const left = oldState.channel;
      if (left && left.members.size === 0 && isTempRoom(left.name)) {
        try {
          await left.delete();
        } catch (err) {
          logger.error('Error deleting empty voice channel:', err);
        }
      }
      return;
    }

    const { guild, member, channel } = newState;

    const { join2CreateChannelId } = guildsRepo(client.db).ensure(guild.id);
    if (!join2CreateChannelId || channel.id !== join2CreateChannelId || !member) return;

    try {
      const room = await guild.channels.create({
        name: tempRoomName(member.user.username),
        type: ChannelType.GuildVoice,
        parent: channel.parentId,
      });

      await member.voice.setChannel(room.id);
    } catch (err) {
      logger.error('Error creating voice channel or moving member:', err);
      logger.error(
        'Ensure the bot has the required permissions: Manage Channels, Move Members, View Channel, Connect.',
      );
    }
  },
});
