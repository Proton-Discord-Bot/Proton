import { z } from 'zod';

export const envSchema = z.object({
  TOKEN: z.string().min(1),
  DISCORD_APPLICATION_ID: z.string().min(1),
  DISCORD_GUILD_ID: z.string().optional(),
  DATABASE_PATH: z.string().default('./database.sqlite'),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function loadEnv(): Env {
  return (cached ??= envSchema.parse(process.env));
}
