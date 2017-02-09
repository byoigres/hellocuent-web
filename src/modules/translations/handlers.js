'use strict';

const Joi = require('joi');
const Models = require('./models');

exports.getTranslationById = {
    handler(request, reply) {

        const { translationId } = request.params;

        Models.getTranslationById(translationId)
            .then((data) => reply(data))
            .catch((error) => reply(error));
    }
};

exports.addTranslation = {
    validate: {
        payload: {
            movieId: Joi.string().length(24).required().label('movieId'),
            title: Joi.string().required().label('title'),
            countryCode: Joi.string().length(2).required().label('country'),
            languageCode: Joi.string().length(2).required().label('language'),
            description: Joi.string().max(80).required().label('description')
        }
    },
    pre: [
        {
            method(request, reply) {

                const { movieId } = request.payload;

                Models.getMovieById(movieId)
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

                const { countryCode } = request.payload;

                Models.getCountryByCode(countryCode)
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

                const { languageCode } = request.payload;

                Models.getLanguageByCode(languageCode)
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

                const { movieId } = request.payload;
                const { country, language } = request.pre;

                Models.verifyIfTranslationExists(movieId, country.code, language.code)
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
    ],
    handler(request, reply) {

        const { title, description } = request.payload;
        const { movie, country, language } = request.pre.data;

        Models.addTranslation(
            movie.id,
            title,
            country._id,
            language._id,
            description
        )
            .then((translationId) => reply(translationId))
            .catch((err) => reply(err));
    }
};

exports.addLanguageTranslation = {
    validate: {
        payload: {
            translationId: Joi.string().length(24).required().label('translationId'),
            title: Joi.string().max(80).required().label('title')
        }
    },
    handler(request, reply) {

        const { translationId, title } = request.payload;

        ///// THIS SHOULD BE THE USER LANGUAGE
        const language = '57e216a05d9d3724e0e00068';
        ///// THIS SHOULD BE THE USER LANGUAGE

        return Models.addLanguageTranslation(
            translationId,
            language,
            title
        ).then(() => reply(translation));
    }
};
