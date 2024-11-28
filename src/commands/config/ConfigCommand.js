const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
    PermissionsBitField
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const Guilds = require( '../../../models/guilds' );
const cMessage = require( '../../../models/cMessage' );
const langData = require( '../../../resources/translations/lang.json' );

class ConfigCommand extends BaseCommand {
    constructor() {
        const commandData = new SlashCommandBuilder()
            .setName( 'config' )
            .setDescription( langData.en.config.commandDesciption )
            .setDescriptionLocalizations( {
                de: langData.de.config.commandDesciption,
            } )
            .setDefaultMemberPermissions( PermissionsBitField.Flags.Administrator )
            .setContexts( InteractionContextType.Guild );

        super( commandData );
        this.requiresGuild = true;
    }

    async _mainExecute( interaction ) {
        await interaction.deferReply( { ephemeral: true } );

        const [ dbguild ] = await Guilds.findOrCreate( {
            where: { guildId: interaction.guild.id }
        } );
        const [ customMessage ] = await cMessage.findOrCreate( {
            where: { guildId: interaction.guild.id }
        } );

        const trackEmbed = await this._createTrackingEmbed( interaction, dbguild );
        const channelEmbed = await this._createChannelEmbed( interaction, dbguild, customMessage );

        await interaction.editReply( {
            embeds: [ trackEmbed, channelEmbed ]
        } );
    }

    async _createTrackingEmbed( interaction, dbguild ) {
        return new EmbedBuilder()
            .setTitle( this.getLangString( 'config.trackEmbed.title' ) )
            .setFields( [
                {
                    name: this.getLangString( 'config.trackEmbed.fields.0.name' ),
                    value: `${ await dbguild.onlineChannelId
                        ? await interaction.guild.channels.fetch( await dbguild.onlineChannelId )
                        : this.getLangString( 'config.trackEmbed.fields.0.value' ) }`,
                    inline: true,
                },
                {
                    name: this.getLangString( 'config.trackEmbed.fields.1.name' ),
                    value: `${ await dbguild.allChannelId
                        ? await interaction.guild.channels.fetch( await dbguild.allChannelId )
                        : this.getLangString( 'config.trackEmbed.fields.1.value' ) }`,
                    inline: true,
                },
                {
                    name: this.getLangString( 'config.trackEmbed.fields.2.name' ),
                    value: `${ await dbguild.botChannelId
                        ? await interaction.guild.channels.fetch( await dbguild.botChannelId )
                        : this.getLangString( 'config.trackEmbed.fields.2.value' ) }`,
                    inline: true,
                },
            ] );
    }

    async _createChannelEmbed( interaction, dbguild, customMessage ) {
        return new EmbedBuilder()
            .setTitle( this.getLangString( 'config.channelEmbed.title' ) )
            .setFields( [
                {
                    name: this.getLangString( 'config.channelEmbed.fields.0.name' ),
                    value: `${ await dbguild.welcomeChannelId
                        ? await interaction.guild.channels.fetch( await dbguild.welcomeChannelId )
                        : this.getLangString( 'config.channelEmbed.fields.0.value' ) }`,
                    inline: true,
                },
                {
                    name: this.getLangString( 'config.channelEmbed.fields.1.name' ),
                    value: `${ await dbguild.leaveChannelId
                        ? await interaction.guild.channels.fetch( await dbguild.leaveChannelId )
                        : this.getLangString( 'config.channelEmbed.fields.1.value' ) }`,
                    inline: true,
                },
                {
                    name: ' ',
                    value: ' ',
                    inline: true,
                },
                {
                    name: this.getLangString( 'config.channelEmbed.fields.2.name' ),
                    value: '```' + `${ await customMessage.welcomeMessage
                        ? await customMessage.welcomeMessage
                        : this.getLangString( 'config.channelEmbed.fields.2.value' ) }` + '```',
                    inline: true,
                },
                {
                    name: this.getLangString( 'config.channelEmbed.fields.3.name' ),
                    value: '```' + `${ await customMessage.goodbyeMessage
                        ? await customMessage.goodbyeMessage
                        : this.getLangString( 'config.channelEmbed.fields.3.value' ) }` + '```',
                    inline: true,
                },
            ] );
    }
}

module.exports = ConfigCommand;