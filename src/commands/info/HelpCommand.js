const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require( 'discord.js' );
const BaseCommand = require( '../../structures/BaseCommand' );
const fs = require( 'fs' );
const path = require( 'path' );
const langData = require( '../../../resources/translations/lang.json' );

class HelpCommand extends BaseCommand {
    constructor() {
        const commandData = new SlashCommandBuilder()
            .setName( 'help' )
            .setDescription( langData.en.help.command.description )
            .setDescriptionLocalizations( {
                de: langData.de.help.command.description,
            } );

        super( commandData );
        this.COMMANDS_PER_PAGE = 6;
    }

    async _mainExecute( interaction ) {
        const pages = await this._createCategoryPages( interaction );

        if ( pages.length === 0 ) {
            return await interaction.reply( {
                content: 'No commands found.',
                ephemeral: true
            } );
        }

        let currentPage = 0;

        const buttons = this._createNavigationButtons( currentPage, pages.length );

        const response = await interaction.reply( {
            embeds: [ pages[ currentPage ] ],
            components: buttons,
            ephemeral: true,
            fetchReply: true
        } );

        const collector = response.createMessageComponentCollector( {
            time: 300000 // 5 minutes
        } );

        collector.on( 'collect', async i => {
            if ( i.user.id !== interaction.user.id ) {
                await i.reply( {
                    content: 'You cannot use these buttons.',
                    ephemeral: true
                } );
                return;
            }

            if ( i.customId === 'prev' ) {
                currentPage--;
            } else if ( i.customId === 'next' ) {
                currentPage++;
            }

            const updatedButtons = this._createNavigationButtons( currentPage, pages.length );

            await i.update( {
                embeds: [ pages[ currentPage ] ],
                components: updatedButtons
            } );
        } );

        collector.on( 'end', () => {
            const disabledButtons = this._createNavigationButtons( currentPage, pages.length, true );
            interaction.editReply( {
                components: disabledButtons
            } ).catch( () => { } );
        } );
    }

    async _createCategoryPages( interaction ) {
        const pages = [];
        const categories = {
            'moderation': '🛡️ Moderation',
            'config': '⚙️ Configuration',
            'info': 'ℹ️ Information',
            'voice': '🔊 Voice',
            'utils': '🔧 Utilities',
            'context-menu': '📱 Context Menu'
        };

        const allCommands = [];
        for ( const [ folder, displayName ] of Object.entries( categories ) ) {
            const commandsPath = path.join( __dirname, '..', folder );

            if ( !fs.existsSync( commandsPath ) ) continue;

            const commands = fs.readdirSync( commandsPath )
                .filter( file => file.endsWith( '.js' ) )
                .map( file => {
                    const CommandClass = require( path.join( commandsPath, file ) );
                    const command = new CommandClass();
                    return {
                        name: command.data.name,
                        description: command.data.description,
                        category: displayName
                    };
                } );

            allCommands.push( ...commands );
        }

        for ( let i = 0; i < allCommands.length; i += this.COMMANDS_PER_PAGE ) {
            const pageCommands = allCommands.slice( i, i + this.COMMANDS_PER_PAGE );

            const embed = new EmbedBuilder()
                .setTitle( this.getLangString( 'help.embed.title' ) )
                .setDescription( this.getLangString( 'help.embed.description' ) )
                .setColor( '#0099ff' )
                .setTimestamp()
                .setFooter( {
                    text: `${ this.getLangString( 'help.embed.footer' ) } • Page ${ pages.length + 1 }/${ Math.ceil( allCommands.length / this.COMMANDS_PER_PAGE ) }`,
                    iconURL: interaction.client.user.displayAvatarURL()
                } );

            const categorizedCommands = {};
            pageCommands.forEach( cmd => {
                if ( !categorizedCommands[ cmd.category ] ) {
                    categorizedCommands[ cmd.category ] = [];
                }
                categorizedCommands[ cmd.category ].push( cmd );
            } );

            for ( const [ category, commands ] of Object.entries( categorizedCommands ) ) {
                const commandList = commands
                    .map( cmd => `\`/${ cmd.name }\` - ${ cmd.description }` )
                    .join( '\n' );

                embed.addFields( {
                    name: category,
                    value: commandList,
                    inline: false
                } );
            }

            pages.push( embed );
        }

        return pages;
    }

    _createNavigationButtons( currentPage, totalPages, disabled = false ) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId( 'prev' )
                .setLabel( 'Previous' )
                .setStyle( ButtonStyle.Primary )
                .setDisabled( disabled || currentPage === 0 ),
            new ButtonBuilder()
                .setCustomId( 'next' )
                .setLabel( 'Next' )
                .setStyle( ButtonStyle.Primary )
                .setDisabled( disabled || currentPage === totalPages - 1 )
        );

        return [ row ];
    }
}

module.exports = HelpCommand;