require( 'dotenv' ).config();
const fs = require( 'fs' );
const path = require( 'path' );
const { REST, Routes } = require( 'discord.js' );

const startTime = Date.now();
const commands = [];

const categories = [
    'config',
    'context-menu',
    'info',
    'moderation',
    'voice',
];

categories.forEach( category => {
    const categoryPath = path.join( __dirname, 'commands', category );

    if ( !fs.existsSync( categoryPath ) ) {
        console.log( `Skipping ${ category } - directory not found` );
        return;
    }

    const commandFiles = fs.readdirSync( categoryPath )
        .filter( file => file.endsWith( '.js' ) );

    console.log( `Loading ${ commandFiles.length } commands from ${ category }...` );

    for ( const file of commandFiles ) {
        const filePath = path.join( categoryPath, file );
        try {
            const CommandClass = require( filePath );
            const command = new CommandClass();
            commands.push( command.data.toJSON() );
            console.log( `Loaded command: ${ command.data.name }` );
        } catch ( error ) {
            console.error( `Error loading command ${ file }:`, error.message );
        }
    }
} );

const rest = new REST( { version: '10' } ).setToken( process.env.TOKEN );

async function deployCommands( guildId = null ) {
    const route = guildId
        ? Routes.applicationGuildCommands( process.env.DISCORD_APPLICATION_ID, guildId )
        : Routes.applicationCommands( process.env.DISCORD_APPLICATION_ID );

    try {
        console.log( `Started deploying ${ commands.length } application commands...` );

        const data = await rest.put( route, { body: commands } );

        console.log( `Successfully deployed ${ data.length } application commands in ${ Date.now() - startTime }ms` );
        return data;
    } catch ( error ) {
        console.error( 'Error deploying commands:', error );
        throw error;
    }
}

async function deleteCommands( guildId = null ) {
    const route = guildId
        ? Routes.applicationGuildCommands( process.env.DISCORD_APPLICATION_ID, guildId )
        : Routes.applicationCommands( process.env.DISCORD_APPLICATION_ID );

    try {
        console.log( 'Started deleting application commands...' );
        await rest.put( route, { body: [] } );
        console.log( 'Successfully deleted all application commands.' );
    } catch ( error ) {
        console.error( 'Error deleting commands:', error );
        throw error;
    }
}

async function deleteCommand( commandId, guildId = null ) {
    const route = guildId
        ? Routes.applicationGuildCommand( process.env.DISCORD_APPLICATION_ID, guildId, commandId )
        : Routes.applicationCommand( process.env.DISCORD_APPLICATION_ID, commandId );

    try {
        console.log( `Deleting command ${ commandId }...` );
        await rest.delete( route );
        console.log( 'Successfully deleted command.' );
    } catch ( error ) {
        console.error( 'Error deleting command:', error );
        throw error;
    }
}

( async () => {
    try {
        if ( process.argv.includes( '--delete-all' ) ) {
            await deleteCommands( process.env.DISCORD_GUILD_ID );
            return;
        }

        if ( process.argv.includes( '--delete' ) ) {
            const commandId = process.argv[ process.argv.indexOf( '--delete' ) + 1 ];
            if ( !commandId ) {
                console.error( 'Please provide a command ID to delete' );
                return;
            }
            await deleteCommand( commandId, process.env.DISCORD_GUILD_ID );
            return;
        }

        await deployCommands( process.env.DISCORD_GUILD_ID );
    } catch ( error ) {
        console.error( 'Deployment failed:', error );
        process.exit( 1 );
    }
} )();