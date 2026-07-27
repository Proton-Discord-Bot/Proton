import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  InteractionContextType,
  PermissionFlagsBits,
} from 'discord.js';
import { defineCommand } from '../../core/command';
import { banMember, moderateTarget } from '../../core/moderation';

const data = new ContextMenuCommandBuilder()
  .setName('Ban')
  .setType(ApplicationCommandType.User)
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setContexts(InteractionContextType.Guild);

export default defineCommand({
  data,
  guildOnly: true,
  run: (ctx) =>
    moderateTarget(ctx, {
      permission: PermissionFlagsBits.BanMembers,
      act: banMember,
      successKey: 'success.banSuccess',
      failureKey: 'errors.notAbleToBanUser',
    }),
});
