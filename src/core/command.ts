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

export type ChatInputContext = CommandContext<ChatInputCommandInteraction>;

export interface ChatCommand extends Omit<Command, 'run'> {
  run(ctx: ChatInputContext): Promise<unknown>;
}

/**
 * `defineCommand` for slash commands. The router hands every command the same widened
 * `CommandContext`, but a command built from a `SlashCommandBuilder` can only ever be
 * invoked with a `ChatInputCommandInteraction` — this narrows it once, here, instead of
 * making every command body cast.
 */
export function defineChatCommand(cmd: ChatCommand): Command {
  return { ...cmd, run: (ctx) => cmd.run(ctx as ChatInputContext) };
}
