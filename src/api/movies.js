'use strict';

const Joi = require('joi');
const Boom = require('boom');

exports.register = (server, options, next) => {

    server.route([
        {
            method: 'POST',
            path: '/api/movies/add',
            config: {
                pre: [
                    {
                        method(request, reply) {

                            server.methods
                                .requestValidation(request.payload, {
                                    title: Joi.string().required().label('title'),
                                    year: Joi.number().min(1900).max(2050).required().label('year'),
                                    imdbId: Joi.string().required().label('imdbId'),
                                    languageCode: Joi.string(2).required().label('languageCode')
                                }, request.i18n)
                                .then(() => reply())
                                .catch((errors) => reply(errors));
                        }
                    },
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

                                    reply(Boom.notAcceptable(null, {
                                        imdbId: request.i18n.__('imdbid.registered')
                                    })).takeover();
                                })
                                .then((err) => reply(err).takeover());
                        }
                    },
                    {
                        assign: 'languageId',
                        method(request, reply) {

                            const models = request.server.plugins['plugins/mongoose'].models;
                            const code = request.payload.languageCode;

                            return models.Language
                                .findOne({ code })
                                .exec()
                                .then((data) => {

                                    if (data === undefined || data === null) {
                                        reply(Boom.notAcceptable(null, {
                                            languageCode: request.i18n.__('languageCode.invalid')
                                        })).takeover();
                                    }

                                    reply(data._id);
                                })
                                .then((err) => reply(err).takeover());
                        }
                    }
                ]
            },
            handler(request, reply) {

                const title = request.payload.title;
                const year = request.payload.year;
                const imdbId = request.payload.imdbId;
                const language = request.pre.languageId;
                const models = request.server.plugins['plugins/mongoose'].models;

                reply({
                    title,
                    year,
                    imdbId,
                    language
                });

                const movie = new models.Movie();

                movie.set({
                    title,
                    year,
                    imdbId,
                    language
                });

                return movie.save()
                    .then(() => reply(movie))
                    .then((err) => reply(err));
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
    ]);

    next();
};

exports.register.attributes = {
    name: 'api/movies'
};
