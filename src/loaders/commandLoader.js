const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Load commands from specified directories
 * @param {Client} client Discord.js client instance
 */
module.exports = async ( client ) => {
    try {
        const startTime = Date.now();

        // Define directories to load
        const commandDirectories = [
            { path: 'config', name: 'Server Configuration Commands' },
            { path: 'context-menu', name: 'Context Menus' },
            { path: 'info', name: 'Info Commands' },
            { path: 'moderation', name: 'Server Moderation Commands' },
            { path: 'voice', name: 'Voice Chat Related Commands' },
        ];

        let totalCommands = 0;
        let loadedCommands = 0;

        for ( const dir of commandDirectories ) {
            const commandsPath = path.join( __dirname, '..', 'commands', dir.path );

            // Skip if directory doesn't exist
            if ( !fs.existsSync( commandsPath ) ) {
                console.log( `Skipping ${ dir.name } - directory not found` );
                continue;
            }

            const commandFiles = fs.readdirSync( commandsPath )
                .filter( file => file.endsWith( '.js' ) );

            totalCommands += commandFiles.length;

            for ( const file of commandFiles ) {
                const filePath = path.join( commandsPath, file );
                const CommandClass = require( filePath );

                try {
                    const command = new CommandClass();
                    client.commands.set( command.data.name, command );
                    loadedCommands++;
                } catch ( error ) {
                    console.error( `Error loading ${ file }:`, error.message );
                }
            }
        }

        const loadingTime = Date.now() - startTime;
        const loadedCommandNames = Array.from( client.commands.keys() );

        console.log( '\nSummary:' );
        console.log( `└── Successfully loaded ${ loadedCommands }/${ totalCommands } commands in ${ loadingTime }ms` );
        console.log( '└── Active commands:', loadedCommandNames.join( ', ' ) );
    } catch ( error ) {
        console.error( 'Error in command loader:', error );
    }
};