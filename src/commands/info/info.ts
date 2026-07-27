import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type GuildMember,
} from 'discord.js';
import { defineChatCommand } from '../../core/command';
import { encodeId } from '../../core/customId';
import { reply, type Block } from '../../core/reply';
import { localizations, tEn } from '../../i18n';

const INFO_ACCENT_COLOR = 0x0099ff;

/** Whether the invoker may act on the target: legacy required both Ban *and* Kick. */
export function canModerate(
  actorPermissions: { has(perm: bigint | bigint[]): boolean },
  target: { user: { bot: boolean } },
): boolean {
  return (
    actorPermissions.has([PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers]) &&
    !target.user.bot
  );
}

const data = new SlashCommandBuilder()
  .setName('info')
  .setDescription(tEn('info.command.description'))
  .setDescriptionLocalizations(localizations('info.command.description'))
  .addUserOption((option) =>
    option
      .setName(tEn('info.command.userOptionName'))
      .setNameLocalizations(localizations('info.command.userOptionName'))
      .setDescription(tEn('info.command.userOptionDescription'))
      .setDescriptionLocalizations(localizations('info.command.userOptionDescription'))
      .setRequired(true),
  )
  .setContexts(InteractionContextType.Guild);

export default defineChatCommand({
  data,
  guildOnly: true,
  async run({ interaction, t }) {
    const { guild } = interaction;
    if (!guild) return;

    const user = interaction.options.getUser(tEn('info.command.userOptionName'), true);
    const member = await guild.members.fetch(user.id);

    const blocks: Block[] = [
      reply.text_(
        `## ${t('info.embed.title', { user: `${member.user.tag} aka ${member.displayName}` })}`,
      ),
      reply.text_(
        t('info.embed.fields.accountCreated', {
          date: `<t:${Math.round(member.user.createdTimestamp / 1000)}>`,
        }),
      ),
      reply.text_(
        t('info.embed.fields.serverJoined', {
          date: member.joinedTimestamp ? `<t:${Math.round(member.joinedTimestamp / 1000)}>` : '—',
        }),
      ),
    ];

    const actor = interaction.member as GuildMember | null;
    if (actor && canModerate(actor.permissions, member)) {
      // Legacy attached a message component collector here, which died with the process
      // and after its timeout. The buttons now round-trip through the router instead.
      blocks.push(
        reply.separator(),
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setCustomId(encodeId('info', 'kick', member.id))
            .setLabel(t('info.buttons.kick')),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setCustomId(encodeId('info', 'ban', member.id))
            .setLabel(t('info.buttons.ban')),
        ),
      );
    }

    return interaction.reply(
      reply.container({ accent: INFO_ACCENT_COLOR, ephemeral: true, blocks }),
    );
  },
});
