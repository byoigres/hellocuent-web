'use strict';
const Joi = require('joi');
const Boom = require('boom');

exports.register = (server, options, next) => {

    server.route([
        {
            method: 'GET',
            path: '/api/translation/{translationId}',
            handler(request, reply) {

                const models = request.server.plugins['plugins/mongoose'].models;
                const { translationId } = request.params;

                models.Translation.findOne({
                    _id: translationId
                }, {
                    __v: false,
                    updatedAt: false,
                    createdAt: false
                })
                .populate('country', '-_id code name')
                .populate('language', '-_id code name')
                .populate('languageTranslations', 'title language')
                .exec()
                .then((data) => reply(data))
                .catch((error) => reply(error));
            }
        },
        {
            method: 'POST',
            path: '/api/translation',
            config: {
                pre: [
                    {
                        method(request, reply) {

                            server.methods
                                .requestValidation(request.payload, {
                                    movieId: Joi.string().length(24).required().label('movieId'),
                                    title: Joi.string().required().label('title'),
                                    countryCode: Joi.string().length(2).required().label('country'),
                                    languageCode: Joi.string().length(2).required().label('language'),
                                    description: Joi.string().max(80).required().label('description')
                                }, request.i18n)
                                .then(() => reply())
                                .catch((errors) => reply(errors));
                        }
                    },
                    {
                        method(request, reply) {

                            const models = request.server.plugins['plugins/mongoose'].models;
                            const { movieId } = request.payload;

                            models.Movie
                                .findById(movieId)
                                .exec()
                                .then((movie) => {

                                    if (movie === null) {
                                        return reply(Boom.notAcceptable(null, {
                                            movie: request.i18n.__('movie.notExists')
                                        }));
                                    }

                                    reply();
                                })
                                .catch((error) => reply(error));
                        }
                    },
                    {
                        assign: 'country',
                        method(request, reply) {

                            const models = request.server.plugins['plugins/mongoose'].models;
                            const { countryCode } = request.payload;

                            models.Country
                                .findOne({ code: countryCode }, '_id code')
                                .exec()
                                .then((data) => {

                                    if (data === null) {
                                        return reply(Boom.notAcceptable(null, {
                                            country: request.i18n.__('country.invalid')
                                        }));
                                    }
                                    reply(data);
                                })
                                .catch((error) => reply(error));
                        }
                    },
                    {
                        assign: 'language',
                        method(request, reply) {

                            const models = request.server.plugins['plugins/mongoose'].models;
                            const { languageCode } = request.payload;

                            models.Language
                                .findOne({ code: languageCode }, '_id code')
                                .exec()
                                .then((data) => {

                                    if (data === null) {
                                        return reply(Boom.notAcceptable(null, {
                                            country: request.i18n.__('language.invalid')
                                        }));
                                    }
                                    reply(data);
                                })
                                .catch((error) => reply(error));
                        }
                    },
                    {
                        assign: 'data',
                        method(request, reply) {

                            const models = request.server.plugins['plugins/mongoose'].models;
                            const { movieId } = request.payload;
                            const { country, language } = request.pre;

                            models.Movie
                                .findById(movieId, 'translations _id')
                                .populate({
                                    path: 'translations',
                                    select: '-_id country',
                                    populate: [
                                        {
                                            path: 'country',
                                            select: '_id code',
                                            match: {
                                                code: country.code
                                            }
                                        },
                                        {
                                            path: 'language',
                                            select: '_id code',
                                            match: {
                                                code: language.code
                                            }
                                        }
                                    ]
                                })
                                .exec()
                                .then((data) => {

                                    if (data.translations.length === 1 &&
                                        data.translations[0].country !== null) {
                                        return reply(Boom.notAcceptable(null, {
                                            movie: request.i18n.__('translation.country.registered')
                                        }));
                                    }

                                    reply({
                                        movie: data,
                                        country,
                                        language
                                    });
                                })
                                .catch((error) => reply(error));
                        }
                    }
                ]
            },
            handler(request, reply) {

                const models = request.server.plugins['plugins/mongoose'].models;
                const { title, description } = request.payload;
                const { movie, country, language } = request.pre.data;
                const translation = new models.Translation();

                translation.set({
                    title,
                    country: country._id,
                    language: language._id,
                    description
                });

                translation.save()
                    .then(() => {

                        models.Movie.findByIdAndUpdate(movie.id, {
                            $push: { translations: translation._id }
                        }, {
                            safe: true,
                            upsert: true
                        }, (err) => {

                            if (err) {
                                return reply(err);
                            }

                            reply(translation._id);
                        });
                    })
                    .catch((err) => reply(err));
            }
        },
        {
            method: 'POST',
            path: '/api/translation/language',
            config: {
                pre: [
                    {
                        assign: 'languageId',
                        method(request, reply) {

                            server.methods
                                .requestValidation(request.payload, {
                                    translationId: Joi.string().length(24).required().label('translationId'),
                                    title: Joi.string().max(80).required().label('title')
                                }, request.i18n)
                                .then(() => reply())
                                .catch((errors) => reply(errors));
                        }
                    }
                ]
            },
            handler(request, reply) {

                const models = request.server.plugins['plugins/mongoose'].models;
                const { translationId, title } = request.payload;

                const translation = new models.LanguageTranslations();

                // translation.set({});
                // return translation.save();

                reply({ translationId, title });
            }
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'api/translations'
};
