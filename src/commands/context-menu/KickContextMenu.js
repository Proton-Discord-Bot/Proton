const {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    PermissionsBitField
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const handleKick = require( '../../functions/handleKick' );

class KickContextMenu extends BaseCommand {
    constructor() {
        const commandData = new ContextMenuCommandBuilder()
            .setName( 'Kick' )
            .setType( ApplicationCommandType.User );

        super( commandData );
        this.requiresGuild = true;
    }

    async _mainExecute( interaction ) {
        const member = interaction.targetUser;
        const guild = interaction.guild;
        const memberInGuild = await guild.members.fetch( member.id );

        if ( !interaction.member.permissions.has( PermissionsBitField.Flags.KickMembers ) ) {
            return await interaction.reply( {
                content: this.getLangString( 'errors.noPerms' ),
                ephemeral: true
            } );
        }

        if ( member.bot ) {
            return await interaction.reply( {
                content: this.getLangString( 'errors.notAbleToKickUser' ),
                ephemeral: true
            } );
        }

        if ( await handleKick( memberInGuild ) ) {
            await interaction.reply( {
                content: this.getLangString( 'success.kickSuccess' ),
                ephemeral: true
            } );
        } else {
            await interaction.reply( {
                content: this.getLangString( 'errors.notAbleToKickUser' ),
                ephemeral: true
            } );
        }
    }
}

module.exports = KickContextMenu;