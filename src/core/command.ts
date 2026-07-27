import type {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  AutocompleteInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import type { ProtonClient } from '../client';
import type { DB, GuildRow } from '../db/client';
import type { Translator } from '../i18n';

export interface CommandData {
  name: string;
  toJSON(): RESTPostAPIApplicationCommandsJSONBody;
}
export type AnyCommandInteraction = ChatInputCommandInteraction | ContextMenuCommandInteraction;

export interface CommandContext<I = AnyCommandInteraction> {
  interaction: I;
  client: ProtonClient;
  t: Translator;
  db: DB;
  guildId?: string;
  guild?: GuildRow;
}

export interface Command {
  data: CommandData;
  guildOnly?: boolean;
  cooldown?: number; // seconds
  run(ctx: CommandContext): Promise<unknown>;
  autocomplete?(ctx: CommandContext<AutocompleteInteraction>): Promise<void>;
}

export function defineCommand(cmd: Command): Command {
  return cmd;
}
