const {
    SlashCommandBuilder,
    InteractionContextType,
    PermissionsBitField
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const Guilds = require( '../../../models/guilds' );
const langData = require( '../../../resources/translations/lang.json' );

class LogSystemCommand extends BaseCommand {
    constructor() {
        const commandData = new SlashCommandBuilder()
            .setName( 'logsystem' )
            .setDescription( langData.en.logSystem.command.description )
            .setDescriptionLocalizations( {
                de: langData.de.logSystem.command.description,
            } )
            .addChannelOption( option =>
                option
                    .setName( 'channel' )
                    .setDescription( langData.en.logSystem.command.channelOptionDescription )
                    .setDescriptionLocalizations( {
                        de: langData.de.logSystem.command.channelOptionDescription,
                    } )
            )
            .setDefaultMemberPermissions( PermissionsBitField.Flags.Administrator )
            .setContexts( InteractionContextType.Guild );

        super( commandData );
        this.requiresGuild = true;
    }

    async _mainExecute( interaction ) {
        const [ guild ] = await Guilds.findOrCreate( {
            where: { guildId: interaction.guild.id }
        } );

        const channel = interaction.options.getChannel( 'channel' );

        if ( !channel ) {
            await this._disableLogSystem( interaction, guild );
            return;
        }

        await this._enableLogSystem( interaction, guild, channel );
    }

    async _disableLogSystem( interaction, guild ) {
        await guild.update( {
            logChannelId: null
        } );

        await interaction.reply( {
            content: this.getLangString( 'logSystem.reply.deactivated' ),
            ephemeral: true
        } );
    }

    async _enableLogSystem( interaction, guild, channel ) {
        await guild.update( {
            logChannelId: channel.id
        } );

        await interaction.reply( {
            content: this.getLangString( 'logSystem.reply.activated' ),
            ephemeral: true
        } );
    }
}

module.exports = LogSystemCommand;