const {
    SlashCommandBuilder,
    InteractionContextType,
    PermissionsBitField
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const CMessage = require( '../../../models/cMessage' );
const langData = require( '../../../resources/translations/lang.json' );

class GoodbyeMessageCommand extends BaseCommand {
    constructor() {
        const commandData = new SlashCommandBuilder()
            .setName( 'goodbye' )
            .setDescription( langData.en.goodbye.command.description )
            .setDescriptionLocalizations( {
                de: langData.de.goodbye.command.description,
            } )
            .addStringOption( option =>
                option
                    .setName( 'message' )
                    .setDescription( langData.en.goodbye.command.messageOptionDescription )
                    .setDescriptionLocalizations( {
                        de: langData.de.goodbye.command.messageOptionDescription,
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

        const goodbyeMessage = interaction.options.getString( 'message' );
        await customMessage.update( {
            goodbyeMessage: goodbyeMessage,
        } );

        await interaction.editReply( {
            content: goodbyeMessage
                ? this.getLangString( 'goodbye.reply.messageSet' )
                : this.getLangString( 'goodbye.reply.messageReset' ),
            ephemeral: true,
        } );
    }
}

module.exports = GoodbyeMessageCommand;