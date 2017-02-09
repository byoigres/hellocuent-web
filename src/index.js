'use strict';
require('dotenv').config();
const Composer = require('./composer');

Composer((composerErr, server) => {

    if (composerErr) {
        throw composerErr;
    }

    server.start()
        .then(() => console.log(`Server started at ${server.info.uri}`))
        .catch((err) => console.log(err));
});
