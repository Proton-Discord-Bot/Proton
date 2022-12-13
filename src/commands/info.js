const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField} = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("gives info about a user")
    .addUserOption(option => option.setName("member").setDescription("The user's info you want to get").setRequired(true)),
    async execute(interaction) {
        const member = interaction.options.getMember("member");
        var isAdmin = false
        try {
            isAdmin = interaction.member.permissions.has(PermissionsBitField.ADMINISTRATOR);
        } catch (error) {}
        let kick, ban, button = []
        if(isAdmin && !member.user.bot){
            kick = new ButtonBuilder()
                .setStyle(4)
                .setCustomId("kick")
                .setLabel("Kick")
            ban = new ButtonBuilder()
                .setStyle(4)
                .setCustomId("ban")
                .setLabel("Ban")
            Button = [kick, ban]
        } else {
            let sayHi = new ButtonBuilder()
                .setStyle(2)
                .setCustomId("sayHi")
                .setLabel("Say Hi👋")
            Button = [sayHi]
        }
        interaction.reply({embeds: [
            new EmbedBuilder()
            .setTitle(`User info about ${member.user.tag}`)
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .addFields([
                {
                    name: "Account Creation Date",
                    value: `<t:${Math.round(member.user.createdTimestamp / 1000)}>`,
                    inline: true
                },
                {
                    name: "Joined Server Date",
                    value: `<t:${Math.round(member.joinedTimestamp / 1000)}>`,
                    inline: true
                }
            ])
            .setDescription(`${member.user.id}`) 
            .setFooter({text: `${member.user.id}`})
        ], 
            ephemeral: true,
            components: [
                new ActionRowBuilder()
                .addComponents(Button)
            ]
        })
    }
}
