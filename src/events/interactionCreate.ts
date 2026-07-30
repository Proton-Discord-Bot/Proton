import { Events } from 'discord.js';
import { defineEvent } from '../core/event';
import { handleInteraction } from '../core/router';

export default defineEvent({
  name: Events.InteractionCreate,
  execute: (client, interaction) => handleInteraction(client, interaction),
});
