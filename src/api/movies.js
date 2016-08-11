'use strict';

const Joi = require('joi');
const Boom = require('boom');

const translations = {
    english: {
        title: {
            any: {
                empty: 'You must specify a title'
            }
        },
        year: {
            'number': {
                base: 'The year is invalid'
            }
        },
        imdbId: {
            any: {
                empty: 'You must provide a imdb id'
            }
        },
        languageCode: {
            any: {
                empty: 'The selected language is not valid'
            }
        }
    }
};

const validatePayload = (value, options, next) => {

    const schema = {
        title: Joi.string().required().label('title'),
        year: Joi.number().required().label('year'),
        imdbId: Joi.string().required().label('imdbId'),
        languageCode: Joi.string(2).required().label('languageCode')
    };

    const result = Joi.validate(value, schema, { abortEarly: false });

    console.log(JSON.stringify(result, null, 2));

    if (result.error) {
        const errors = {};

        result.error.details.forEach((error) => {

            const [type, name] = error.type.split('.');
            const field = error.context.key;

            errors[field] = translations.english[field][type][name];
        });

        console.log(JSON.stringify(errors, null, 2));

        next(Boom.badRequest('Joi error', errors));
    }

    next();
};

module.exports = [
    {
        method: 'POST',
        path: '/api/movies/add',
        config: {
            validate: {
                payload: validatePayload
            },
            pre: [
                {
                    method(request, reply) {

                        const models = request.server.plugins['plugins/mongoose'].models;
                        const imdbId = request.payload.imdbId;

                        return models.Movie
                            .findOne({ imdbId })
                            .exec()
                            .then((data) => {

                                if (data === undefined || data === null) {
                                    return reply(imdbId);
                                }

                                reply(Boom.notAcceptable('', {
                                    imdbId: 'Imdb id already registered.'
                                })).takeover();
                            })
                            .then((err) => reply(err).takeover());
                    }
                },
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
    },
    {
        method: 'POST',
        path: '/api/movies/omdbapi',
        config: {
            handler(request, reply) {

                const s = request.query.criteria;
                const findMovieByName = request.server.plugins['plugins/omdbapi'].findMovieByName;

                return findMovieByName(s).then((json) => {

                    return reply(json);
                }).catch((err) => reply(err));
            }
        }
    }
];
