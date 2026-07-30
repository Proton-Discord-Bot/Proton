import type { MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import type { ProtonClient } from '../client';
import type { DB } from '../db/client';
import type { Translator } from '../i18n';

export interface ComponentContext {
  interaction: MessageComponentInteraction | ModalSubmitInteraction;
  client: ProtonClient;
  t: Translator;
  db: DB;
  /**
   * The decoded action segment of the customId. A component registered against a whole
   * feature (`match: 'info'`) handles several actions and needs to know which one fired;
   * one registered as `feature:action` can ignore this.
   */
  action: string;
  args: string[];
}

export interface Component {
  match: string; // "feature:action" prefix
  run(ctx: ComponentContext): Promise<unknown>;
}

export function defineComponent(c: Component): Component {
  return c;
}
