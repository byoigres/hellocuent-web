'use strict';

const Handlers = require('./handlers');

exports.register = (server, options, next) => {

    server.route([
        {
            method: 'GET',
            path: '/api/languages',
            config: Handlers.getAllLanguages
        },
        {
            method: 'GET',
            path: '/api/languages/country/{code}',
            config: Handlers.getLanguagesByCountry
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'modules/languages'
};
