'use strict';

const MoviesAdd = require('./movies/add');

exports.register = (server, options, next) => {

    server.route(MoviesAdd);

    server.route([
        {
            method: 'GET',
            path: '/',
            config: {
                handler(request, reply) {

                    reply.view('index');
                }
            }
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'entries/index'
};
