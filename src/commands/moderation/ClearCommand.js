const {
    SlashCommandBuilder,
    PermissionsBitField
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const langData = require( '../../../resources/translations/lang.json' );

class ClearCommand extends BaseCommand {
    constructor() {
        const commandData = new SlashCommandBuilder()
            .setName( 'clear' )
            .setDescription( langData.en.clear.command.description )
            .setDescriptionLocalizations( {
                de: langData.de.clear.command.description,
            } )
            .addIntegerOption( option =>
                option
                    .setName( 'amount' )
                    .setDescription( langData.en.clear.command.integerOptionDescription )
                    .setDescriptionLocalizations( {
                        de: langData.de.clear.command.integerOptionDescription,
                    } )
                    .setRequired( true )
            )
            .setDefaultMemberPermissions( PermissionsBitField.Flags.ManageMessages );

        super( commandData );
        this.requiresGuild = true;
    }

    async _mainExecute( interaction ) {
        const amount = interaction.options.getInteger( 'amount' );

        if ( amount > 100 ) {
            return await interaction.reply( {
                ephemeral: true,
                content: this.getLangString( 'clear.reply.over100' ),
            } );
        }

        if ( amount < 1 ) {
            return await interaction.reply( {
                ephemeral: true,
                content: this.getLangString( 'clear.reply.under1' ),
            } );
        }

        try {
            await interaction.channel.bulkDelete( amount, true );

            await interaction.reply( {
                ephemeral: true,
                content: `${ amount }` + this.getLangString( 'clear.reply.success' ),
            } );
        } catch ( err ) {
            console.error( err );
            await interaction.reply( {
                ephemeral: true,
                content: this.getLangString( 'clear.reply.error' ),
            } );
        }
    }
}

module.exports = ClearCommand;