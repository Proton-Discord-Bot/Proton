const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction
} = require('discord.js')

const langData = require(`../../../resources/translations/lang.json`)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('contribute')
        .setDescription(langData.en.contribute.command.description)
        .setDescriptionLocalizations({
            de: langData.de.contribute.command.description,
        }),
    /**
     * @param {ChatInputCommandInteraction} interaction - The interaction object.
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const userLang = interaction.locale.slice(0, 2)

        let donate = new ButtonBuilder()
            .setLabel(langData[userLang].contribute.buttons.labelDonate)
            .setStyle(5)
            .setURL('https://buymeacoffee.com/nchoini')
        let errorReport = new ButtonBuilder()
            .setLabel(langData[userLang].contribute.buttons.labelGithub)
            .setStyle(5)
            .setURL('https://github.com/Proton-Bot-Development/Proton/')
        let contributeRow = new ActionRowBuilder().addComponents([
            donate,
            errorReport,
        ])
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(langData[userLang].contribute.embed.title)
                    .setDescription(
                        langData[userLang].contribute.embed.description
                    )
                    .addFields([
                        {
                            name: langData[userLang].contribute.embed.fields[0]
                                .name,
                            value: langData[userLang].contribute.embed.fields[0]
                                .value,
                        },
                        {
                            name: langData[userLang].contribute.embed.fields[1]
                                .name,
                            value: langData[userLang].contribute.embed.fields[1]
                                .value,
                        },
                    ]),
            ],
            ephemeral: true,
            components: [contributeRow],
        })
    },
}
