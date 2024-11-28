const {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    SlashCommandBuilder
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand.js' );
const langData = require( '../../../resources/translations/lang.json' );

class ContributeCommand extends BaseCommand {
    constructor() {
        const commandData = new SlashCommandBuilder()
            .setName( 'contribute' )
            .setDescription( langData.en.contribute.command.description )
            .setDescriptionLocalizations( {
                de: langData.de.contribute.command.description,
            } );

        super( commandData );
    }

    async _mainExecute( interaction ) {
        const donateButton = new ButtonBuilder()
            .setLabel( this.getLangString( 'contribute.buttons.labelDonate' ) )
            .setStyle( 5 )
            .setURL( 'https://buymeacoffee.com/nchoini' );

        const githubButton = new ButtonBuilder()
            .setLabel( this.getLangString( 'contribute.buttons.labelGithub' ) )
            .setStyle( 5 )
            .setURL( 'https://github.com/Proton-Bot-Development/Proton/' );

        const buttonRow = new ActionRowBuilder().addComponents( [
            donateButton,
            githubButton
        ] );

        const contributeEmbed = new EmbedBuilder()
            .setTitle( this.getLangString( 'contribute.embed.title' ) )
            .setDescription( this.getLangString( 'contribute.embed.description' ) )
            .addFields( [
                {
                    name: this.getLangString( 'contribute.embed.fields.0.name' ),
                    value: this.getLangString( 'contribute.embed.fields.0.value' )
                },
                {
                    name: this.getLangString( 'contribute.embed.fields.1.name' ),
                    value: this.getLangString( 'contribute.embed.fields.1.value' )
                }
            ] );

        await interaction.reply( {
            embeds: [ contributeEmbed ],
            components: [ buttonRow ],
            ephemeral: true
        } );
    }
}

module.exports = ContributeCommand;