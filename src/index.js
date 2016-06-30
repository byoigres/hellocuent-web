'use strict';
const Composer = require('./composer');

Composer((composerErr, server) => {

    if (composerErr) {
        throw composerErr;
    }

    server.start((serverErr) => {

        if (serverErr) {
            throw serverErr;
        }

        console.log(`Server started at ${server.info.uri}`);
    });
});
