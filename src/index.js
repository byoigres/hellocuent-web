'use strict';
require('dotenv').config();
const Composer = require('./composer');

Composer((composerErr, server) => {

    if (composerErr) {
        throw composerErr;
    }

    server.start()
        .then(() => server.log(['hellocuent-web', 'info'], `Server started at ${server.info.uri}`))
        .catch((err) => server.log(['hellocuent-web', 'info'], err));
});
