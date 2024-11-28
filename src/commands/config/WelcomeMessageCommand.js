const {
    SlashCommandBuilder,
    InteractionContextType,
    PermissionsBitField
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const CMessage = require( '../../../models/cMessage' );
const langData = require( '../../../resources/translations/lang.json' );

class WelcomeMessageCommand extends BaseCommand {
    constructor() {
        const commandData = new SlashCommandBuilder()
            .setName( 'welcome' )
            .setDescription( langData.en.welcome.command.description )
            .setDescriptionLocalizations( {
                de: langData.de.welcome.command.description,
            } )
            .addStringOption( option =>
                option
                    .setName( 'message' )
                    .setDescription( langData.en.welcome.command.stringOptionDescription )
                    .setDescriptionLocalizations( {
                        de: langData.de.welcome.command.stringOptionDescription,
                    } )
            )
            .setDefaultMemberPermissions( PermissionsBitField.Flags.Administrator )
            .setContexts( InteractionContextType.Guild );

        super( commandData );
        this.requiresGuild = true;
    }

    async _mainExecute( interaction ) {
        await interaction.deferReply( { ephemeral: true } );

        const [ customMessage ] = await CMessage.findOrCreate( {
            where: {
                guildId: interaction.guild.id,
            },
        } );

        const welcomeMessage = interaction.options.getString( 'message' );
        await customMessage.update( {
            welcomeMessage: welcomeMessage,
        } );

        await interaction.editReply( {
            content: welcomeMessage
                ? this.getLangString( 'welcome.reply.messageSet' )
                : this.getLangString( 'welcome.reply.messageReset' ),
            ephemeral: true,
        } );
    }
}

module.exports = WelcomeMessageCommand;