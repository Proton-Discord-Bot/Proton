import { join } from 'node:path';
import { REST, Routes } from 'discord.js';
import { loadEnv } from '../src/config/env';
import { logger } from '../src/core/logger';
import { loadCommands } from '../src/core/registry';

/**
 * Registers application commands with Discord.
 *
 * The command list comes from the same registry the bot loads at runtime, so deployment
 * can never drift from what is actually implemented — the legacy script kept its own
 * hardcoded category list and silently skipped anything outside it.
 *
 * Pass `--delete-all` to clear every registered command instead.
 */
const deleteAll = process.argv.includes('--delete-all');

const env = loadEnv();
const rest = new REST().setToken(env.TOKEN);

// Guild-scoped registration updates instantly, which is what you want while developing;
// global registration is the production path.
const route = env.DISCORD_GUILD_ID
  ? Routes.applicationGuildCommands(env.DISCORD_APPLICATION_ID, env.DISCORD_GUILD_ID)
  : Routes.applicationCommands(env.DISCORD_APPLICATION_ID);
const scope = env.DISCORD_GUILD_ID ? `guild ${env.DISCORD_GUILD_ID}` : 'globally';

if (deleteAll) {
  await rest.put(route, { body: [] });
  logger.info(`Deleted all application commands ${scope}.`);
} else {
  const commands = await loadCommands(join(import.meta.dir, '../src/commands'));
  const body = commands.map((c) => c.data.toJSON());

  if (body.length === 0) {
    logger.error('No commands found to deploy — refusing to wipe the registered set.');
    process.exit(1);
  }

  await rest.put(route, { body });
  logger.info(`Deployed ${body.length} command(s) ${scope}: ${[...commands.keys()].join(', ')}`);
}
