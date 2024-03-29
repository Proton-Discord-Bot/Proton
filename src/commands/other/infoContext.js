const {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    EmbedBuilder,
    PermissionsBitField,
    ButtonBuilder,
    ActionRowBuilder,
} = require('discord.js')

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Info')
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
        const member = interaction.targetUser
        const guild = interaction.guild
        const memberInGuild = guild.members.cache.get(member.id)
        let kick, ban, admin, button
        const { BanMembers, KickMembers } = PermissionsBitField.Flags
        if (
            interaction.member.permissions.has([BanMembers, KickMembers]) &&
            !member.bot
        ) {
            kick = new ButtonBuilder()
                .setStyle(4)
                .setCustomId('kick')
                .setLabel('Kick')
            ban = new ButtonBuilder()
                .setStyle(4)
                .setCustomId('ban')
                .setLabel('Ban')
            button = [kick, ban]
            admin = new ActionRowBuilder().addComponents(button)
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`User info about ${member.tag}`)
                        .setThumbnail(
                            member.displayAvatarURL({ dynamic: true })
                        )
                        .setFooter({ text: `${member.id}` })
                        .addFields([
                            {
                                name: 'Account Creation Date',
                                value: `<t:${Math.round(
                                    member.createdTimestamp / 1000
                                )}>`,
                                inline: true,
                            },
                            {
                                name: 'Joined Server Date',
                                value: `<t:${Math.round(
                                    memberInGuild.joinedTimestamp / 1000
                                )}>`,
                                inline: true,
                            },
                        ]),
                ],
                ephemeral: true,
                components: [admin],
            })
        } else {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`User info about ${member.tag}`)
                        .setThumbnail(
                            member.displayAvatarURL({ dynamic: true })
                        )
                        .addFields([
                            {
                                name: 'Account Creation Date',
                                value: `<t:${Math.round(
                                    member.createdTimestamp / 1000
                                )}>`,
                                inline: true,
                            },
                            {
                                name: 'Joined Server Date',
                                value: `<t:${Math.round(
                                    memberInGuild.joinedTimestamp / 1000
                                )}>`,
                                inline: true,
                            },
                        ]),
                ],
                ephemeral: true,
            })
        }
    },
}
