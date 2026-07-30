import { Events } from 'discord.js';
import { defineEvent } from '../core/event';
import { guildsRepo } from '../db/repos';

export default defineEvent({
  name: Events.GuildCreate,
  execute(client, guild) {
    guildsRepo(client.db).ensure(guild.id);
  },
});
