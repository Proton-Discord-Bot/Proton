import type { Command, CommandContext } from './command';
import { reply } from './reply';
import { guildsRepo } from '../db/repos';

export type Middleware = (ctx: CommandContext, next: () => Promise<void>) => Promise<void>;

export function compose(mws: Middleware[], final: (ctx: CommandContext) => Promise<void>) {
  return (ctx: CommandContext) => {
    const run = (i: number): Promise<void> =>
      i < mws.length ? mws[i]!(ctx, () => run(i + 1)) : final(ctx);
    return run(0);
  };
}

const hits = new Map<string, number>();
export function cooldown(seconds: number): Middleware {
  return async (ctx, next) => {
    if (seconds <= 0) return next();
    const i = ctx.interaction as {
      user: { id: string };
      commandName: string;
      reply: (m: unknown) => unknown;
    };
    const key = `${i.user.id}:${i.commandName}`;
    const now = Date.now();
    const until = hits.get(key) ?? 0;
    if (now < until) {
      const left = Math.ceil((until - now) / 1000);
      await i.reply(ctx.t('common.cooldown', { seconds: left }));
      return;
    }
    hits.set(key, now + seconds * 1000);
    return next();
  };
}

export function guildGuard(command: Pick<Command, 'guildOnly'>): Middleware {
  return async (ctx, next) => {
    if (!command.guildOnly) return next();
    const i = ctx.interaction as {
      inGuild(): boolean;
      guildId: string | null;
      reply: (m: unknown) => unknown;
    };
    if (!i.inGuild() || !i.guildId) {
      await i.reply(reply.ephemeralText(ctx.t('common.guildOnly')));
      return;
    }
    ctx.guildId = i.guildId;
    ctx.guild = guildsRepo(ctx.db).ensure(i.guildId);
    return next();
  };
}
