'use strict';

const Languages = require('./languages');

exports.register = (server, options, next) => {

    server.route(Languages);

    server.route([
        {
            method: 'GET',
            path: '/api',
            handler(request, reply) {

                reply();
            }
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'api/index'
};
