const {
    ChannelType,
    SlashCommandBuilder,
    InteractionContextType,
    PermissionsBitField
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const Guilds = require( '../../../models/guilds' );
const langData = require( '../../../resources/translations/lang.json' );

class Join2CreateCommand extends BaseCommand {
    constructor() {
        const commandData = new SlashCommandBuilder()
            .setName( 'join2create' )
            .setDescription( langData.en.join2Create.command.description )
            .setDescriptionLocalizations( {
                de: langData.de.join2Create.command.description,
            } )
            .addChannelOption( option =>
                option
                    .setName( 'channel' )
                    .setDescription( langData.en.join2Create.command.channelOptionDescription )
                    .setDescriptionLocalizations( {
                        de: langData.de.join2Create.command.channelOptionDescription,
                    } )
                    .addChannelTypes( ChannelType.GuildVoice )
            )
            .setDefaultMemberPermissions( PermissionsBitField.Flags.Administrator )
            .setContexts( InteractionContextType.Guild );

        super( commandData );
        this.requiresGuild = true;
    }

    async _mainExecute( interaction ) {
        const [ dbGuild ] = await Guilds.findOrCreate( {
            where: { guildId: interaction.guild.id }
        } );

        const channel = interaction.options.getChannel( 'channel' );

        if ( !channel ) {
            await this._deactivateJoin2Create( interaction, dbGuild );
            return;
        }

        await this._activateJoin2Create( interaction, dbGuild, channel );
    }

    async _deactivateJoin2Create( interaction, dbGuild ) {
        await dbGuild.update( {
            join2CreateChannelId: null
        } );

        await interaction.reply( {
            content: this.getLangString( 'join2Create.reply.deactivated' ),
            ephemeral: true
        } );
    }

    async _activateJoin2Create( interaction, dbGuild, channel ) {
        await dbGuild.update( {
            join2CreateChannelId: channel.id
        } );

        await interaction.reply( {
            content: this.getLangString( 'join2Create.reply.activated' ),
            ephemeral: true
        } );
    }
}

module.exports = Join2CreateCommand;