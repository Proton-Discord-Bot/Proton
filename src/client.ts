import { Client, Collection, GatewayIntentBits } from 'discord.js';
import type { Command } from './core/command';
import type { Component } from './core/component';
import type { DB } from './db/client';
import { makeTranslator, resolveLocale, type Translator } from './i18n';

export const INTENTS = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildPresences,
  GatewayIntentBits.MessageContent,
];

export class ProtonClient extends Client {
  commands = new Collection<string, Command>();
  components = new Collection<string, Component>();
  constructor(public db: DB) {
    super({ intents: INTENTS });
  }
  translator(locale: string): Translator {
    return makeTranslator(resolveLocale(locale));
  }
}
