'use strict';

const Joi = require('joi');
const ShortId = require('shortId');
const Mime = require('mime-types');
const Path = require('path');
const Fs = require('fs');
const Models = require('./models');

exports.listMovies = {
    handler(request, reply) {

        Models.getAll()
            .then((data) => {

                return reply(data.map((item) => item));
            })
            .catch((error) => reply(error));
    }
};

exports.getMovieById = {
    handler(request, reply) {

        const { movieId } = request.params;

        Models.getMovieById(movieId)
            .then((data) => reply(data))
            .catch((error) => reply(error));
    }
};

exports.addMovie = {
    auth: {
        mode: 'required',
        strategy: 'strategy-jwt'
    },
    payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data'
    },
    validate: {
        payload: {
            title: Joi.string().required().label('title'),
            year: Joi.number().min(1900).max(2050).required().label('year'),
            imdbId: Joi.string().required().label('imdbId'),
            languageCode: Joi.string().required().label('languageCode'),
            /*
            poster: Joi.object({
                'content-disposition' : Joi.string().required(),
                'content-type' : Joi.string().valid(['image/jpeg']).required()
            }).required()
            */
            poster: Joi.object()
        }
    },
    pre: [
        {
            method(request, reply) {

                const { imdbId } = request.payload;

                Models.getMovieByImdbId(imdbId)
                    .then((data) => {

                        if (data === undefined || data === null) {
                            return reply(imdbId);
                        }

                        reply(Boom.notAcceptable(null, {
                            imdbId: request.i18n.__('imdbid.registered')
                        }));
                    })
                    .catch((err) => reply(err));
            }
        },
        {
            assign: 'languageId',
            method(request, reply) {

                const code = request.payload.languageCode;

                Models.getLanguageByCode(code)
                    .then((data) => {

                        if (data === undefined || data === null) {
                            reply(Boom.notAcceptable(null, {
                                languageCode: request.i18n.__('languageCode.invalid')
                            }));
                        }

                        reply(data._id);
                    })
                    .catch((err) => reply(err));
            }
        },
        {
            assign: 'poster',
            method(request, reply) {

                const { payload } = request;

                if (payload.poster) {
                    const { directory } = request.server.settings.app.config.uploads;
                    const type = payload.poster.hapi.headers['content-type'];
                    const name = `${ShortId.generate()}.${Mime.extension(type)}`;
                    const path = Path.join(directory, name);
                    const file = Fs.createWriteStream(path);

                    file.on('error', (err) => console.error(err));

                    payload.poster.pipe(file);

                    payload.poster.on('end', (err) => {

                        if (err) {
                            throw err;
                        }

                        reply(name);
                    });
                }
            }
        }
    ],
    handler(request, reply) {

        const {
            title,
            year,
            imdbId
        } = request.payload;
        const language = request.pre.languageId;
        const { poster } = request.pre;
        const createdBy = request.auth.credentials.id;

        Models.addMovie(
            title,
            year,
            imdbId,
            language,
            poster,
            createdBy
        )
            .then((movie) => reply(movie))
            .catch((err) => reply(err));
    }
};
