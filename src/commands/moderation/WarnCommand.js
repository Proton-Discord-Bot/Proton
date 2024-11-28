const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
    PermissionsBitField
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const warns = require( '../../../models/warns' );
const langData = require( '../../../resources/translations/lang.json' );

class WarnCommand extends BaseCommand {
    constructor() {
        const commandData = new SlashCommandBuilder()
            .setName( 'warn' )
            .setDescription( langData.en.warn.command.description )
            .setDescriptionLocalizations( {
                de: langData.de.warn.command.description
            } )
            .addUserOption( option =>
                option
                    .setName( 'user' )
                    .setDescription( langData.en.warn.command.userOptionDescription )
                    .setDescriptionLocalizations( {
                        de: langData.de.warn.command.userOptionDescription
                    } )
                    .setRequired( true )
            )
            .addStringOption( option =>
                option
                    .setName( 'reason' )
                    .setDescription( langData.en.warn.command.stringOptionDescription )
                    .setDescriptionLocalizations( {
                        de: langData.de.warn.command.stringOptionDescription
                    } )
                    .setRequired( true )
            )
            .setDefaultMemberPermissions( PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.BanMembers )
            .setContexts( InteractionContextType.Guild );

        super( commandData );
        this.requiresGuild = true;
    }

    async _mainExecute( interaction ) {
        const user = interaction.options.getUser( 'user' );
        const reason = interaction.options.getString( 'reason' );

        if ( user.id === interaction.user.id ) {
            return await interaction.reply( {
                content: this.getLangString( 'warn.reply.notYourself' ),
                ephemeral: true
            } );
        }

        const member = await interaction.guild.members.fetch( user.id );

        if ( member.permissions.has( PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.BanMembers ) ) {
            return await interaction.reply( {
                content: this.getLangString( 'warn.reply.notAdmin' ),
                ephemeral: true
            } );
        }

        const warnsCount = await warns.count( {
            where: {
                guildId: interaction.guild.id,
                userId: user.id,
            },
        } );

        await warns.create( {
            guildId: interaction.guild.id,
            userId: user.id,
            reason: reason,
        } );

        if ( warnsCount >= 3 ) {
            await this._sendMultipleWarnsEmbed( interaction, user, warnsCount );
            await this._sendWarnEmbed( interaction, reason );
        } else {
            await this._sendWarnEmbed( interaction, reason );
        }
    }

    async _sendMultipleWarnsEmbed( interaction, user, warnsCount ) {
        const reminderEmbed = new EmbedBuilder()
            .setTitle( this.getLangString( 'warn.embed.title' ) )
            .setFields( [ {
                name: this.getLangString( 'warn.embed.fields.name1' ) +
                    `${ user.username }` +
                    this.getLangString( 'warn.embed.fields.name2' ) +
                    `${ warnsCount }`,
                value: ' ',
            } ] )
            .setFooter( {
                text: this.getLangString( 'warn.embed.footer' ),
            } )
            .setColor( 'Red' );

        await interaction.reply( {
            embeds: [ reminderEmbed ],
            ephemeral: true,
        } );

        await new Promise( resolve => setTimeout( resolve, 1000 ) );
    }

    async _sendWarnEmbed( interaction, reason ) {
        const warnEmbed = new EmbedBuilder()
            .setTitle( this.getLangString( 'warn.embed.title' ) )
            .setFields( [ {
                name: this.getLangString( 'warn.embed.fields.0.name' ),
                value: reason,
            } ] )
            .setColor( 'Red' )
            .setTimestamp();

        const replyOptions = {
            embeds: [ warnEmbed ],
            ephemeral: true
        };

        if ( interaction.replied ) {
            await interaction.followUp( replyOptions );
        } else {
            await interaction.reply( replyOptions );
        }
    }
}

module.exports = WarnCommand;