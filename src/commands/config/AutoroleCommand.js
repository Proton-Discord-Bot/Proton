const {
    SlashCommandBuilder,
    PermissionsBitField,
    InteractionContextType
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const Guilds = require( '../../../models/guilds' );
const langData = require( '../../../resources/translations/lang.json' );

class AutoroleCommand extends BaseCommand {
    constructor() {
        const commandData = new SlashCommandBuilder()
            .setName( 'autorole' )
            .setDescription( langData.en.joinRole.command.description )
            .setDescriptionLocalizations( {
                de: langData.de.joinRole.command.description,
            } )
            .addRoleOption( roleOption =>
                roleOption
                    .setName( 'role' )
                    .setDescription( langData.en.joinRole.command.roleOptionDescription )
                    .setDescriptionLocalizations( {
                        de: langData.de.joinRole.command.roleOptionDescription,
                    } )
            )
            .setDefaultMemberPermissions( PermissionsBitField.Flags.Administrator )
            .setContexts( InteractionContextType.Guild );

        super( commandData );
        this.requiresGuild = true;
    }

    async _mainExecute( interaction ) {
        await interaction.deferReply( { ephemeral: true } );
        const joinRole = interaction.options.getRole( 'role' );

        if ( !joinRole ) {
            await this._removeAutorole( interaction );
            return;
        }

        await this._setAutorole( interaction, joinRole );
    }

    async _removeAutorole( interaction ) {
        const [ dbguild ] = await Guilds.findOrCreate( {
            where: {
                guildId: interaction.guild.id,
            },
        } );

        await dbguild.update( {
            joinRoleId: null,
        } );

        await interaction.editReply( {
            content: this.getLangString( 'joinRole.reply.roleReset' ),
            ephemeral: true,
        } );
    }

    async _setAutorole( interaction, role ) {
        const [ dbguild ] = await Guilds.findOrCreate( {
            where: {
                guildId: interaction.guild.id,
            },
        } );

        await dbguild.update( {
            joinRoleId: role.id,
        } );

        await interaction.editReply( {
            content: this.getLangString( 'joinRole.reply.roleSet' ),
            ephemeral: true,
        } );
    }
}

module.exports = AutoroleCommand;