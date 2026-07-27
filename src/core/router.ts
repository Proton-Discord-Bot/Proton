import type { AutocompleteInteraction, Interaction, InteractionReplyOptions } from 'discord.js';
import type { ProtonClient } from '../client';
import type { CommandContext } from './command';
import type { ComponentContext } from './component';
import type { Translator } from '../i18n';
import { compose, cooldown, guildGuard } from './middleware';
import { decodeId } from './customId';
import { reply } from './reply';
import { logger } from './logger';

/**
 * Single entry point for every interaction the client receives (slash/context-menu
 * commands, autocomplete, buttons, select menus, modal submits). Looks up the matching
 * command/component, builds its context, and dispatches to `run`/`autocomplete`.
 *
 * Any error thrown during dispatch is caught, logged, and reported back to the user as
 * an ephemeral notice — this function never rejects.
 */
export async function handleInteraction(client: ProtonClient, interaction: Interaction): Promise<void> {
  const t = client.translator(interaction.locale);

  try {
    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) {
        logger.warn(`No command registered for "${interaction.commandName}"`);
        return;
      }
      // `interaction` is narrowed to ChatInputCommandInteraction | ContextMenuCommandInteraction
      // here, which is exactly `AnyCommandInteraction` — the cast just spells that out for tsc.
      const ctx = { interaction, client, t, db: client.db } as CommandContext;
      // `Command['run']` returns `Promise<unknown>` (handlers may return anything); `compose`
      // wants a `Promise<void>` final step, so the result is discarded here on purpose.
      await compose([guildGuard(cmd), cooldown(cmd.cooldown ?? 0)], async (c) => {
        await cmd.run(c);
      })(ctx);
      return;
    }

    if (interaction.isAutocomplete()) {
      const cmd = client.commands.get(interaction.commandName);
      const ctx = { interaction, client, t, db: client.db } as CommandContext<AutocompleteInteraction>;
      await cmd?.autocomplete?.(ctx);
      return;
    }

    if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
      const { feature, action, args } = decodeId(interaction.customId);
      const component = client.components.get(`${feature}:${action}`) ?? client.components.get(feature);
      if (!component) {
        logger.warn(`No component registered for customId "${interaction.customId}"`);
        return;
      }
      // `interaction` is narrowed to ButtonInteraction | AnySelectMenuInteraction |
      // ModalSubmitInteraction here, matching ComponentContext['interaction'].
      const ctx = { interaction, client, t, db: client.db, args } as ComponentContext;
      await component.run(ctx);
      return;
    }
  } catch (err) {
    logger.error('Unhandled error while dispatching interaction:', err);
    await replyWithError(interaction, t);
  }
}

/**
 * Best-effort ephemeral error notice. Autocomplete interactions can't be replied to, so
 * they're skipped. Any failure while sending the notice itself is logged and swallowed
 * so it can never surface as an unhandled rejection out of `handleInteraction`.
 */
async function replyWithError(interaction: Interaction, t: Translator): Promise<void> {
  if (interaction.isAutocomplete()) return;

  try {
    // `reply.ephemeralText` returns a structurally-correct but loosely-typed payload
    // (plain `MessageFlags[]`/builder arrays); discord.js wants its own narrower
    // `InteractionReplyOptions` shape, so this cast just re-asserts what's already true
    // at runtime. Same pattern as the existing `reply.ephemeralText` call in middleware.ts.
    const payload = reply.ephemeralText(t('common.error')) as InteractionReplyOptions;
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  } catch (err) {
    logger.error('Failed to send the error notice to the user:', err);
  }
}
