const {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    SlashCommandBuilder,
    PermissionsBitField,
    ButtonStyle,
    InteractionContextType
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const handleKick = require( '../../functions/handleKick' );
const handleBan = require( '../../functions/handleBan' );
const langData = require( '../../../resources/translations/lang.json' );

class InfoCommand extends BaseCommand {
    constructor() {
        const commandData = new SlashCommandBuilder()
            .setName( 'info' )
            .setDescription( langData.en.info.command.description )
            .setDescriptionLocalizations( {
                de: langData.de.info.command.description,
            } )
            .addUserOption( option =>
                option
                    .setName( langData.en.info.command.userOptionName )
                    .setNameLocalizations( {
                        de: langData.de.info.command.userOptionName,
                    } )
                    .setDescription( langData.en.info.command.userOptionDescription )
                    .setDescriptionLocalizations( {
                        de: langData.de.info.command.userOptionDescription,
                    } )
                    .setRequired( true )
            )
            .setContexts( InteractionContextType.Guild );

        super( commandData );
        this.requiresGuild = true;
    }

    async _mainExecute( interaction ) {
        const memberInGuild = await interaction.guild.members.fetch(
            interaction.options.getMember( 'member' ).id
        );

        const infoEmbed = await this._createInfoEmbed( interaction, memberInGuild );
        const response = await this._createResponse( interaction, memberInGuild, infoEmbed );

        if ( response.components.length > 0 ) {
            await this._setupCollector( interaction, memberInGuild, response );
        }
    }

    async _createInfoEmbed( interaction, memberInGuild ) {
        return new EmbedBuilder()
            .setTitle(
                this.getLangString( 'info.embed.title' ) +
                `${ memberInGuild.user.tag } aka ${ memberInGuild.displayName }`
            )
            .setThumbnail( memberInGuild.displayAvatarURL( { dynamic: true } ) )
            .addFields( [
                {
                    name: this.getLangString( 'info.embed.fields.accountCreated' ),
                    value: `<t:${ Math.round( memberInGuild.user.createdTimestamp / 1000 ) }>`,
                    inline: true,
                },
                {
                    name: this.getLangString( 'info.embed.fields.serverJoined' ),
                    value: `<t:${ Math.round( memberInGuild.joinedTimestamp / 1000 ) }>`,
                    inline: true,
                },
            ] );
    }

    async _createResponse( interaction, memberInGuild, embed ) {
        const { BanMembers, KickMembers } = PermissionsBitField.Flags;
        const response = { embeds: [ embed ], ephemeral: true, components: [] };

        if (
            interaction.member.permissions.has( [ BanMembers, KickMembers ] ) &&
            !memberInGuild.user.bot
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

module.exports = InfoCommand;