import { Events } from 'discord.js';
import { defineEvent } from '../core/event';
import { cMessagesRepo, guildsRepo, warnsRepo } from '../db/repos';

export default defineEvent({
  name: Events.GuildDelete,
  execute(client, guild) {
    cMessagesRepo(client.db).delete(guild.id);
    guildsRepo(client.db).delete(guild.id);
    warnsRepo(client.db).clearGuild(guild.id);
  },
});
