const {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    ButtonStyle,
    PermissionsBitField
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const handleKick = require( '../../functions/handleKick' );
const handleBan = require( '../../functions/handleBan' );

class InfoContextMenu extends BaseCommand {
    constructor() {
        const commandData = new ContextMenuCommandBuilder()
            .setName( 'Info' )
            .setType( ApplicationCommandType.User );

        super( commandData );
        this.requiresGuild = true;
    }

    async _mainExecute( interaction ) {
        const member = interaction.targetUser;
        const guild = interaction.guild;
        const memberInGuild = await guild.members.fetch( member.id );

        const infoEmbed = await this._createInfoEmbed( interaction, member, memberInGuild );
        const response = await this._createResponse( interaction, member, memberInGuild, infoEmbed );

        if ( response.components.length > 0 ) {
            await this._setupCollector( interaction, memberInGuild, response );
        } else {
            await interaction.reply( response );
        }
    }

    async _createInfoEmbed( interaction, member, memberInGuild ) {
        return new EmbedBuilder()
            .setTitle(
                this.getLangString( 'info.embed.title' ) +
                `${ member.username } aka ${ memberInGuild.displayName }`
            )
            .setThumbnail( member.displayAvatarURL( { dynamic: true } ) )
            .addFields( [
                {
                    name: this.getLangString( 'info.embed.fields.accountCreated' ),
                    value: `<t:${ Math.round( member.createdTimestamp / 1000 ) }>`,
                    inline: true,
                },
                {
                    name: this.getLangString( 'info.embed.fields.serverJoined' ),
                    value: `<t:${ Math.round( memberInGuild.joinedTimestamp / 1000 ) }>`,
                    inline: true,
                },
            ] );
    }

    async _createResponse( interaction, member, memberInGuild, embed ) {
        const { BanMembers, KickMembers } = PermissionsBitField.Flags;
        const response = { embeds: [ embed ], ephemeral: true, components: [] };

        if (
            interaction.member.permissions.has( [ BanMembers, KickMembers ] ) &&
            !member.bot
        ) {
            const kickButton = new ButtonBuilder()
                .setStyle( ButtonStyle.Danger )
                .setCustomId( 'kick' )
                .setLabel( this.getLangString( 'info.buttons.kick' ) );

            const banButton = new ButtonBuilder()
                .setStyle( ButtonStyle.Danger )
                .setCustomId( 'ban' )
                .setLabel( this.getLangString( 'info.buttons.ban' ) );

            const buttonRow = new ActionRowBuilder().addComponents( [ kickButton, banButton ] );
            response.components.push( buttonRow );
        }

        return response;
    }

    async _setupCollector( interaction, memberInGuild, response ) {
        const message = await interaction.reply( response );
        const collector = message.createMessageComponentCollector();

        collector.on( 'collect', async i => {
            switch ( i.customId ) {
                case 'kick':
                    if ( await handleKick( memberInGuild ) ) {
                        await i.reply( {
                            ephemeral: true,
                            content: this.getLangString( 'success.kickSuccess' ),
                        } );
                    } else {
                        await i.reply( {
                            ephemeral: true,
                            content: this.getLangString( 'errors.notAbleToKickUser' ),
                        } );
                    }
                    break;

                case 'ban':
                    if ( await handleBan( memberInGuild ) ) {
                        await i.reply( {
                            ephemeral: true,
                            content: this.getLangString( 'success.banSuccess' ),
                        } );
                    } else {
                        await i.reply( {
                            ephemeral: true,
                            content: this.getLangString( 'errors.notAbleToBanUser' ),
                        } );
                    }
                    break;

                default:
                    await i.reply( {
                        ephemeral: true,
                        content: this.getLangString( 'errors.smthWentWrong' ),
                    } );
            }
        } );
    }
}

module.exports = InfoContextMenu;