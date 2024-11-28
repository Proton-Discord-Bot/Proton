const {
    SlashCommandBuilder,
    InteractionContextType,
    PermissionsBitField
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const Guilds = require( '../../../models/guilds' );
const langData = require( '../../../resources/translations/lang.json' );

class TrackCommand extends BaseCommand {
    constructor() {
        const commandData = new SlashCommandBuilder()
            .setName( 'track' )
            .setDescription( '-' )
            .addSubcommandGroup( group =>
                group
                    .setName( 'add' )
                    .setDescription( '-' )
                    .addSubcommand( subcommand =>
                        subcommand
                            .setName( 'online' )
                            .setDescription( langData.en.track.command.addOnlineDescription )
                            .setDescriptionLocalizations( {
                                de: langData.de.track.command.addOnlineDescription,
                            } )
                            .addChannelOption( option =>
                                option
                                    .setName( 'channel' )
                                    .setDescription( langData.en.track.command.channelOptionDesciption )
                                    .setDescriptionLocalizations( {
                                        de: langData.de.track.command.channelOptionDesciption,
                                    } )
                                    .setRequired( true )
                            )
                    )
                    .addSubcommand( subcommand =>
                        subcommand
                            .setName( 'all' )
                            .setDescription( langData.en.track.command.addAllDescription )
                            .setDescriptionLocalizations( {
                                de: langData.de.track.command.addAllDescription,
                            } )
                            .addChannelOption( option =>
                                option
                                    .setName( 'channel' )
                                    .setDescription( langData.en.track.command.channelOptionDesciption )
                                    .setDescriptionLocalizations( {
                                        de: langData.de.track.command.channelOptionDesciption,
                                    } )
                                    .setRequired( true )
                            )
                    )
                    .addSubcommand( subcommand =>
                        subcommand
                            .setName( 'bots' )
                            .setDescription( langData.en.track.command.addBotsDescription )
                            .setDescriptionLocalizations( {
                                de: langData.de.track.command.addBotsDescription,
                            } )
                            .addChannelOption( option =>
                                option
                                    .setName( 'channel' )
                                    .setDescription( langData.en.track.command.channelOptionDesciption )
                                    .setDescriptionLocalizations( {
                                        de: langData.de.track.command.channelOptionDesciption,
                                    } )
                                    .setRequired( true )
                            )
                    )
            )
            .addSubcommandGroup( group =>
                group
                    .setName( 'remove' )
                    .setDescription( '-' )
                    .addSubcommand( subcommand =>
                        subcommand
                            .setName( 'online' )
                            .setDescription( langData.en.track.command.removeOnlineDescription )
                            .setDescriptionLocalizations( {
                                de: langData.de.track.command.removeOnlineDescription,
                            } )
                    )
                    .addSubcommand( subcommand =>
                        subcommand
                            .setName( 'all' )
                            .setDescription( langData.en.track.command.removeAllDescription )
                            .setDescriptionLocalizations( {
                                de: langData.de.track.command.removeAllDescription,
                            } )
                    )
                    .addSubcommand( subcommand =>
                        subcommand
                            .setName( 'bots' )
                            .setDescription( langData.en.track.command.removeBotsDescription )
                            .setDescriptionLocalizations( {
                                de: langData.de.track.command.removeBotsDescription,
                            } )
                    )
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

        switch ( interaction.options.getSubcommandGroup() ) {
            case 'add':
                await this._handleAdd( interaction, guild );
                break;
            case 'remove':
                await this._handleRemove( interaction, guild );
                break;
        }
    }

    async _handleAdd( interaction, guild ) {
        await interaction.deferReply( { ephemeral: true } );
        const channel = interaction.options.getChannel( 'channel' );

        switch ( interaction.options.getSubcommand() ) {
            case 'online':
                await guild.update( { onlineChannelId: channel.id } );
                await interaction.editReply( {
                    content: `The bot will now track the amount of online users in ${ channel }!`
                } );
                break;
            case 'all':
                await guild.update( { allChannelId: channel.id } );
                await interaction.editReply( {
                    content: `The bot will now track the amount of all users in ${ channel }!`
                } );
                break;
            case 'bots':
                await guild.update( { botChannelId: channel.id } );
                await interaction.editReply( {
                    content: `The bot will now track the amount of bots in ${ channel }!`
                } );
                break;
        }
    }

    async _handleRemove( interaction, guild ) {
        await interaction.deferReply( { ephemeral: true } );

        switch ( interaction.options.getSubcommand() ) {
            case 'online':
                await guild.update( { onlineChannelId: null } );
                await interaction.editReply( {
                    content: 'The bot will no longer track the amount of online users!'
                } );
                break;
            case 'all':
                await guild.update( { allChannelId: null } );
                await interaction.editReply( {
                    content: 'The bot will no longer track the amount of all users!'
                } );
                break;
            case 'bots':
                await guild.update( { botChannelId: null } );
                await interaction.editReply( {
                    content: 'The bot will no longer track the amount of bots!'
                } );
                break;
        }
    }
}

module.exports = TrackCommand;