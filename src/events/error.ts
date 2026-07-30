import { Events } from 'discord.js';
import { defineEvent } from '../core/event';
import { logger } from '../core/logger';

export default defineEvent({
  name: Events.Error,
  execute(_client, err) {
    logger.error(err);
  },
});
