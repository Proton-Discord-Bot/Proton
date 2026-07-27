import type { MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import type { ProtonClient } from '../client';
import type { DB } from '../db/client';
import type { Translator } from '../i18n';

export interface ComponentContext {
  interaction: MessageComponentInteraction | ModalSubmitInteraction;
  client: ProtonClient;
  t: Translator;
  db: DB;
  args: string[];
}

export interface Component {
  match: string; // "feature:action" prefix
  run(ctx: ComponentContext): Promise<unknown>;
}

export function defineComponent(c: Component): Component {
  return c;
}
