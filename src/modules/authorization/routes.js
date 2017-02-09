'use strict';

const Handlers = require('./handlers');

exports.register = (server, options, next) => {

    server.route([
        {
            method: 'POST',
            path: '/api/auth/login',
            config: Handlers.login
        },
        {
            method: 'POST',
            path: '/api/auth/register',
            config: Handlers.register
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'modules/authorization'
};
