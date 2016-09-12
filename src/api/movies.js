'use strict';

const Joi = require('joi');
const Boom = require('boom');

exports.register = (server, options, next) => {

    server.route([
        {
            method: 'GET',
            path: '/api/movies',
            handler(request, reply) {

                const models = request.server.plugins['plugins/mongoose'].models;

                models.Movie.find({}, {
                    __v: false,
                    translations: false,
                    updatedAt: false,
                    createdAt: false
                })
                    .populate('language', '-_id code name')
                    .exec()
                    .then((data) => {

                        return reply(data.map((item) => item));
                    })
                    .catch((error) => reply(error));
            }
        },
        {
            method: 'GET',
            path: '/api/movies/{movieId}',
            handler(request, reply) {

                const models = request.server.plugins['plugins/mongoose'].models;
                const { movieId } = request.params;

                models.Movie.findOne({
                    _id: movieId
                }, {
                    __v: false,
                    updatedAt: false,
                    createdAt: false
                })
                    .populate('language', '-_id name code')
                    .populate({
                        path: 'translations',
                        select: 'title country language description',
                        populate: [
                            {
                                path: 'country',
                                select: '-_id code name'
                            },
                            {
                                path: 'language',
                                select: '-_id code name'
                            }
                        ]
                    })
                    .exec()
                    .then((data) => {

                        /*
                        const json = data.toJSON();
                        const code = json.language.code;
                        delete json.language;
                        json.language = code;
                        */
                        reply(data);
                    })
                    .catch((error) => reply(error));
            }
        },
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
                                .catch((err) => reply(err).takeover());
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
                                .catch((err) => reply(err).takeover());
                        }
                    }
                ]
            },
            handler(request, reply) {

                const {
                    title,
                    year,
                    imdbId
                } = request.payload;
                const language = request.pre.languageId;
                const models = request.server.plugins['plugins/mongoose'].models;
                const movie = new models.Movie();

                movie.set({
                    title,
                    year,
                    imdbId,
                    language
                });

                return movie.save()
                    .then(() => reply(movie))
                    .catch((err) => reply(err));
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
