'use strict';

const Handlers = require('./handlers');

exports.register = (server, options, next) => {

    server.route([
        {
            method: 'GET',
            path: '/api/movies',
            config: Handlers.listMovies
        },
        {
            method: 'GET',
            path: '/api/movies/{movieId}',
            config: Handlers.getMovieById
        },
        {
            method: 'POST',
            path: '/api/movies',
            config: Handlers.addMovie
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'modules/movies'
};
