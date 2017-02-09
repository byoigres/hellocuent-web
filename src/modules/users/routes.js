'use strict';

const Handlers = require('./handlers');

exports.register = (server, options, next) => {

    server.route([
        {
            method: 'GET',
            path: '/api/user/{username}',
            config: Handlers.getUserByUsername
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'modules/users'
};
