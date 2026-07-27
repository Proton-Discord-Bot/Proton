import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnv } from './config/env';
import { createDb, migrateDb } from './db/client';
import { importLegacy } from './db/import-legacy';
import { loadCommands, loadComponents } from './core/registry';
import { loadEvents } from './core/load-events';
import { ProtonClient } from './client';
import { logger } from './core/logger';

const env = loadEnv();

const db = createDb(env.DATABASE_PATH);
migrateDb(db);
const legacy = join(process.cwd(), 'database.legacy.sqlite');
if (existsSync(legacy)) importLegacy({ legacyPath: legacy, targetDb: db });

const client = new ProtonClient(db);
client.commands = await loadCommands(join(import.meta.dir, 'commands'));
client.components = await loadComponents(join(import.meta.dir, 'components'));
await loadEvents(client, join(import.meta.dir, 'events'));

await client.login(env.TOKEN);
logger.info(`Ready as ${client.user?.tag}`);
