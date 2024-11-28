const {
    ChannelType,
    SlashCommandBuilder,
    PermissionsBitField,
    InteractionContextType
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const Guilds = require( '../../../models/guilds' );
const langData = require( '../../../resources/translations/lang.json' );

class ChannelSetupCommand extends BaseCommand {
    constructor() {
        const commandData = new SlashCommandBuilder()
            .setName( 'channel' )
            .setDescription( '-' )
            .addSubcommandGroup( subcommandGroup =>
                subcommandGroup
                    .setName( 'set' )
                    .setDescription( '-' )
                    .addSubcommand( subcommand =>
                        subcommand
                            .setName( 'join' )
                            .setDescription( langData.en.channelSetup.command.subCommandJoin.description )
                            .setDescriptionLocalizations( {
                                de: langData.de.channelSetup.command.subCommandJoin.description,
                            } )
                            .addChannelOption( option =>
                                option
                                    .setName( 'channel' )
                                    .setDescription( langData.en.channelSetup.command.subCommandJoin.channelOptionDescription )
                                    .setDescriptionLocalizations( {
                                        de: langData.de.channelSetup.command.subCommandJoin.channelOptionDescription,
                                    } )
                                    .setRequired( true )
                                    .addChannelTypes( ChannelType.GuildText )
                            )
                    )
                    .addSubcommand( subcommand =>
                        subcommand
                            .setName( 'leave' )
                            .setDescription( langData.en.channelSetup.command.subCommandLeave.description )
                            .setDescriptionLocalizations( {
                                de: langData.de.channelSetup.command.subCommandLeave.description,
                            } )
                            .addChannelOption( option =>
                                option
                                    .setName( 'channel' )
                                    .setDescription( langData.en.channelSetup.command.subCommandLeave.channelOptionDescription )
                                    .setDescriptionLocalizations( {
                                        de: langData.de.channelSetup.command.subCommandLeave.channelOptionDescription,
                                    } )
                                    .setRequired( true )
                                    .addChannelTypes( ChannelType.GuildText )
                            )
                    )
            )
            .addSubcommandGroup( subcommandGroup =>
                subcommandGroup
                    .setName( 'unset' )
                    .setDescription( '-' )
                    .addSubcommand( subcommand =>
                        subcommand
                            .setName( 'join' )
                            .setDescription( langData.en.channelSetup.command.subCommandUnsetJoinDescription )
                            .setDescriptionLocalizations( {
                                de: langData.de.channelSetup.command.subCommandUnsetJoinDescription,
                            } )
                    )
                    .addSubcommand( subcommand =>
                        subcommand
                            .setName( 'leave' )
                            .setDescription( langData.en.channelSetup.command.subCommandUnsetLeaveDescription )
                            .setDescriptionLocalizations( {
                                de: langData.de.channelSetup.command.subCommandUnsetLeaveDescription,
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
            case 'unset':
                await this._handleUnset( interaction, guild );
                break;
            case 'set':
                await this._handleSet( interaction, guild );
                break;
        }
    }

    async _handleUnset( interaction, guild ) {
        switch ( interaction.options.getSubcommand() ) {
            case 'join':
                await guild.update( { welcomeChannelId: null } );
                await interaction.reply( {
                    content: this.getLangString( 'channelSetup.reply.joinChannelUnset' ),
                    ephemeral: true,
                } );
                break;
            case 'leave':
                await guild.update( { goodbyeChannelId: null } );
                await interaction.reply( {
                    content: this.getLangString( 'channelSetup.reply.leaveChannelUnset' ),
                    ephemeral: true,
                } );
                break;
        }
    }

    async _handleSet( interaction, guild ) {
        switch ( interaction.options.getSubcommand() ) {
            case 'join':
                const welcomeChannelId = interaction.options.getChannel( 'channel' );
                await guild.update( { welcomeChannelId: welcomeChannelId.id } );
                await interaction.reply( {
                    content: this.getLangString( 'channelSetup.reply.joinChannelSet' ) + `${ welcomeChannelId }`,
                    ephemeral: true,
                } );
                break;
            case 'leave':
                const goodbyeChannelId = interaction.options.getChannel( 'channel' );
                await guild.update( { goodbyeChannelId: goodbyeChannelId.id } );
                await interaction.reply( {
                    content: this.getLangString( 'channelSetup.reply.leaveChannelSet' ) + `${ goodbyeChannelId }`,
                    ephemeral: true,
                } );
                break;
        }
    }
}

module.exports = ChannelSetupCommand;