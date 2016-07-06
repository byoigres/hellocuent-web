'use strict';

const Joi = require('joi');

module.exports = [
    {
        method: 'POST',
        path: '/api/movies/add',
        config: {
            validate: {
                payload: {
                    imdbId: Joi.string().required(),
                    languageId: Joi.string().required()
                }
            },
            pre: [
                {
                    assign: 'movieExists',
                    method(request, reply) {

                        const imdbId = request.payload.imdbId;
                        const models = request.server.plugins['plugins/thinky-models'].models;

                        return models.Movie.filter({
                            imdbId: imdbId
                        })
                        .run()
                        .then((movieData) => reply(movieData.length > 0));
                    }
                },
                {
                    assign: 'omdb',
                    method(request, reply) {

                        const movieExists = request.pre.movieExists;
                        const imdbId = request.payload.imdbId;
                        const findMovieByImdbId = request.server.plugins['plugins/omdbapi'].findMovieByImdbId;

                        if (movieExists) {
                            return reply('Movie already registered').takeover();
                        }

                        return findMovieByImdbId(imdbId)
                            .then((omdbData) => {

                                if (omdbData === null) {
                                    return reply('imdbId not found').takeover();
                                }

                                return reply(omdbData);
                            });
                    }
                }
            ]
        },
        handler(request, reply) {

            const omdb = request.pre.omdb;
            const imdbId = request.payload.imdbId;
            const models = request.server.plugins['plugins/thinky-models'].models;

            const movie = new models.Movie({
                title: omdb.title,
                year: omdb.year,
                imdbId: imdbId
            });

            return movie.save().then(() => {

                return reply(movie);
            });
        }
    }
];
