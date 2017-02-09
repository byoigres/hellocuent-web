'use strict';

const Handlers = require('./handlers');

exports.register = (server, options, next) => {

    server.route([
        {
            method: 'GET',
            path: '/api/countries/{code?}',
            config: Handlers.getAllCountries
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'modules/countries'
};
