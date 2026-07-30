import { ActivityType, Events } from 'discord.js';
import { defineEvent } from '../core/event';
import { logger } from '../core/logger';
import { guildsRepo } from '../db/repos';

const STATS_INTERVAL_MS = 1000 * 350;

type MemberLike = { presence?: { status?: string } | null; user: { bot: boolean } };

export function countOnlineHumans(members: MemberLike[]): number {
  return members.filter(
    (member) =>
      !member.user.bot &&
      (member.presence?.status === 'online' ||
        member.presence?.status === 'idle' ||
        member.presence?.status === 'dnd'),
  ).length;
}

export function countBots(members: { user: { bot: boolean } }[]): number {
  return members.filter((member) => member.user.bot).length;
}

export default defineEvent({
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    for (const guildId of client.guilds.cache.keys()) {
      guildsRepo(client.db).ensure(guildId);
    }

    const refreshPresence = () => {
      client.user?.setPresence({
        activities: [
          { name: `${client.guilds.cache.size} server(s)`, type: ActivityType.Watching },
        ],
        status: 'online',
      });
    };

    refreshPresence();
    logger.info(`Ready as ${client.user?.tag}`);

    setInterval(() => {
      void (async () => {
        for (const guild of client.guilds.cache.values()) {
          const dbGuild = guildsRepo(client.db).ensure(guild.id);

          await guild.members.fetch();
          const members = [...guild.members.cache.values()];
          const online = countOnlineHumans(members);
          const bots = countBots(members);

          if (dbGuild.onlineChannelId) {
            try {
              await guild.channels.edit(dbGuild.onlineChannelId, { name: `Online: ${online}` });
            } catch (err) {
              logger.error(`Failed to update online channel for guild ${guild.id}:`, err);
            }
          }
          if (dbGuild.allChannelId) {
            try {
              await guild.channels.edit(dbGuild.allChannelId, {
                name: `Members: ${guild.memberCount}`,
              });
            } catch (err) {
              logger.error(`Failed to update all-members channel for guild ${guild.id}:`, err);
            }
          }
          if (dbGuild.botChannelId) {
            try {
              await guild.channels.edit(dbGuild.botChannelId, { name: `Bots: ${bots}` });
            } catch (err) {
              logger.error(`Failed to update bot channel for guild ${guild.id}:`, err);
            }
          }
        }

        refreshPresence();
      })();
    }, STATS_INTERVAL_MS);
  },
});
