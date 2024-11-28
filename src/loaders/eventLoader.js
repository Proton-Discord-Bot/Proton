const fs = require( 'fs' );

module.exports = async ( client ) => {
    try {
        const startTime = Date.now();

        const eventFiles = await fs.promises.readdir( './events' );

        for ( const file of eventFiles ) {
            if ( file.endsWith( '.js' ) ) {
                const event = await require( `../../events/${ file }` );
                if ( event.once ) {
                    client.once( event.name, event.execute );
                } else {
                    client.on( event.name, event.execute );
                }
            }
        }

        const loadingTime = Date.now() - startTime;
        console.log( `Events loaded! (${ loadingTime } ms)` );
    } catch ( error ) {
        console.error( 'Error in the command handler', error );
    }
};
