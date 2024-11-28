const { SlashCommandBuilder, ContextMenuCommandBuilder } = require( 'discord.js' );
const Guilds = require( '../../models/guilds' );
const langData = require( '../../resources/translations/lang.json' );

/**
 * BaseCommand class serves as a base structure for creating and executing commands.
 * It provides a standardized way to handle command execution, including pre-execution,
 * main execution, post-execution, and error handling steps.
 *
 * @class
 * @abstract
 */
class BaseCommand {
  /**
   * Creates an instance of BaseCommand.
   * 
   * @constructor
   * @param {SlashCommandBuilder|ContextMenuCommandBuilder} commandData - The command data, must be an instance of SlashCommandBuilder.
   * @throws {Error} Throws an error if commandData is not an instance of SlashCommandBuilder.
   */
  constructor( commandData ) {
    if ( !( commandData instanceof SlashCommandBuilder ) &&
      !( commandData instanceof ContextMenuCommandBuilder ) ) {
      throw new Error( 'commandData must be an instance of SlashCommandBuilder or ContextMenuCommandBuilder' );
    }

    this.data = commandData;
    this.requiresGuild = false;
  }

  /**
   * Executes the command by running pre-execution, main execution, and post-execution steps.
   * Handles any errors that occur during execution.
   *
   * @param {Object} interaction - The interaction object that contains details about the command execution context.
   * @returns {Promise<void>} A promise that resolves when the command execution is complete.
   */
  async execute( interaction ) {
    try {
      await this._preExecute( interaction );
      await this._mainExecute( interaction );
      await this._postExecute( interaction );
    } catch ( error ) {
      await this._handleError( interaction, error );
    }
  }

  /**
   * Pre-execution hook for a command interaction.
   * 
   * @async
   * @param {Object} interaction - The interaction object.
   * @param {string} interaction.locale - The locale of the user.
   * @param {string} [interaction.guildId] - The ID of the guild where the interaction occurred.
   * 
   * @property {string} userLang - The language code derived from the user's locale.
   * @property {Object} [guildData] - The guild data if the command requires a guild and the interaction occurred in a guild.
   * 
   * @returns {Promise<void>} - A promise that resolves when the pre-execution steps are complete.
   */
  async _preExecute( interaction ) {
    this.userLang = interaction.locale.slice( 0, 2 );

    if ( this.requiresGuild && interaction.guildId ) {
      const [ guild ] = await Guilds.findOrCreate( {
        where: { guildId: interaction.guildId }
      } );
      this.guildData = guild;
    }
  }

  /**
   * Main execution method that must be implemented by child classes.
   * 
   * @param {Object} interaction - The interaction object that contains details about the command execution.
   * @throws {Error} Throws an error if the method is not implemented by a child class.
   * @abstract
   */
  async _mainExecute( interaction ) {
    throw new Error( '_mainExecute must be implemented by child classes' );
  }

  /**
   * Post-execution hook for the command.
   * This method is called after the main execution of the command.
   *
   * @param {Object} interaction - The interaction object that triggered the command.
   * @returns {Promise<void>} - A promise that resolves when the post-execution is complete.
   * @protected
   */
  async _postExecute( interaction ) { }

  /**
   * Handles errors that occur during the execution of a command.
   *
   * @param {Object} interaction - The interaction object representing the command.
   * @param {Error} error - The error that occurred.
   * @returns {Promise<void>} A promise that resolves when the error handling is complete.
   */
  async _handleError( interaction, error ) {
    console.error( 'Error in ' + interaction.commandName + ' command:', error );
    const errorMessage = 'An error occurred while processing your request.';

    if ( !interaction.replied ) {
      await interaction.reply( {
        content: errorMessage,
        ephemeral: true
      } );
    }
  }

  /**
   * Retrieves a language string based on the provided path.
   *
   * @param {string} path - The dot-separated path to the desired language string.
   * @returns {string|undefined} The language string if found, otherwise undefined.
   */
  getLangString( path ) {
    return path.split( '.' ).reduce( ( obj, key ) => obj?.[ key ], langData[ this.userLang ] );
  }
}

module.exports = BaseCommand;