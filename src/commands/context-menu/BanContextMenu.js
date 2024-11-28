const {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    PermissionsBitField
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const handleBan = require( '../../functions/handleBan' );

class BanContextMenu extends BaseCommand {
    constructor() {
        const commandData = new ContextMenuCommandBuilder()
            .setName( 'Ban' )
            .setType( ApplicationCommandType.User );

        super( commandData );
        this.requiresGuild = true;
    }

    async _mainExecute( interaction ) {
        const member = interaction.targetUser;
        const guild = interaction.guild;
        const memberInGuild = await guild.members.fetch( member.id );

        if ( !interaction.member.permissions.has( PermissionsBitField.Flags.BanMembers ) ) {
            return await interaction.reply( {
                content: this.getLangString( 'errors.noPerms' ),
                ephemeral: true
            } );
        }

        if ( member.bot ) {
            return await interaction.reply( {
                content: this.getLangString( 'errors.notAbleToBanUser' ),
                ephemeral: true
            } );
        }

        if ( await handleBan( memberInGuild ) ) {
            await interaction.reply( {
                content: this.getLangString( 'success.banSuccess' ),
                ephemeral: true
            } );
        } else {
            await interaction.reply( {
                content: this.getLangString( 'errors.notAbleToBanUser' ),
                ephemeral: true
            } );
        }
    }
}

module.exports = BanContextMenu;