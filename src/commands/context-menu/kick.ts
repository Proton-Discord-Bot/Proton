import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  InteractionContextType,
  PermissionFlagsBits,
} from 'discord.js';
import { defineCommand } from '../../core/command';
import { kickMember, moderateTarget } from '../../core/moderation';

const data = new ContextMenuCommandBuilder()
  .setName('Kick')
  .setType(ApplicationCommandType.User)
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .setContexts(InteractionContextType.Guild);

export default defineCommand({
  data,
  guildOnly: true,
  run: (ctx) =>
    moderateTarget(ctx, {
      permission: PermissionFlagsBits.KickMembers,
      act: kickMember,
      successKey: 'success.kickSuccess',
      failureKey: 'errors.notAbleToKickUser',
    }),
});
