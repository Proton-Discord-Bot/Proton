const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
    PermissionsBitField
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const warns = require( '../../../models/warns' );
const langData = require( '../../../resources/translations/lang.json' );

class ResetWarnsCommand extends BaseCommand {
    constructor() {
        const commandData = new SlashCommandBuilder()
            .setName( 'resetwarns' )
            .setDescription( langData.en.resetwarns.command.description )
            .setDescriptionLocalizations( {
                de: langData.de.resetwarns.command.description,
            } )
            .addUserOption( option =>
                option
                    .setName( 'user' )
                    .setDescription( langData.en.resetwarns.command.userOptionDescription )
                    .setDescriptionLocalizations( {
                        de: langData.de.resetwarns.command.userOptionDescription,
                    } )
                    .setRequired( true )
            )
            .addIntegerOption( option =>
                option
                    .setName( 'amount' )
                    .setDescription( langData.en.resetwarns.command.integerOptionDescription )
                    .setDescriptionLocalizations( {
                        de: langData.de.resetwarns.command.integerOptionDescription,
                    } )
            )
            .setDefaultMemberPermissions( PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.BanMembers )
            .setContexts( InteractionContextType.Guild );

        super( commandData );
        this.requiresGuild = true;
    }

    async _mainExecute( interaction ) {
        const userId = interaction.options.getUser( 'user' ).id;
        const amount = interaction.options.getInteger( 'amount' ) ?? null;

        const userWarns = await warns.findOne( {
            where: {
                guildId: interaction.guild.id,
                userId: userId,
            },
        } );

        if ( !userWarns ) {
            await this._sendNoWarnsEmbed( interaction );
            return;
        }

        await warns.destroy( {
            where: {
                guildId: interaction.guild.id,
                userId: userId,
            },
            limit: amount,
        } );

        await this._sendResetConfirmEmbed( interaction, amount );
    }

    async _sendNoWarnsEmbed( interaction ) {
        const embed = new EmbedBuilder()
            .setTitle( this.getLangString( 'resetwarns.embed.title' ) )
            .setFields( [ {
                name: this.getLangString( 'resetwarns.embed.fields.1.name' ),
                value: this.getLangString( 'resetwarns.embed.fields.1.value' ),
            } ] )
            .setColor( 'Green' );

        await interaction.reply( {
            embeds: [ embed ],
            ephemeral: true
        } );
    }

    async _sendResetConfirmEmbed( interaction, amount ) {
        const embed = new EmbedBuilder()
            .setTitle( this.getLangString( 'resetwarns.embed.title' ) )
            .setFields( [ {
                name: this.getLangString( 'resetwarns.embed.fields.0.name' ),
                value: this.getLangString( 'resetwarns.embed.fields.0.value' ) +
                    `${ amount || this.getLangString( 'resetwarns.all' ) }`,
            } ] )
            .setColor( 'Green' )
            .setTimestamp();

        await interaction.reply( { embeds: [ embed ] } );
    }
}

module.exports = ResetWarnsCommand;