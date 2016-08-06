'use strict';

module.exports = [
    {
        method: 'GET',
        path: '/movies/add',
        config: {
            pre: [],
            handler(request, reply) {

                const models = request.server.plugins['plugins/mongoose'].models;

                models.Language
                    .find({}, {
                        _id: false,
                        __v: false
                    })
                    .exec()
                    .then((languages) => {

                        reply.view('movies/add', {
                            languages
                        });
                    })
                    .then((err) => reply(err).takeover());
            }
        }
    },
    {
        method: 'POST',
        path: '/movies/add',
        config: {
            pre: [
                {
                    assign: 'imdbId',
                    method(request, reply) {

                        const models = request.server.plugins['plugins/mongoose'].models;
                        const imdbId = request.payload.imdbid;

                        return models.Movie
                            .findOne({ imdbId })
                            .exec()
                            .then((data) => {

                                if (data === undefined || data === null) {
                                    reply(imdbId);
                                }

                                return models.Language
                                    .find({}, {
                                        _id: false,
                                        __v: false
                                    })
                                    .exec()
                                    .then((languages) => {

                                        return reply.view('movies/add', {
                                            languages,
                                            messages: {
                                                imdb: 'Imdb id already registered.'
                                            }
                                        }).takeover();
                                    })
                                    .then((err) => reply(err).takeover());
                            })
                            .then((err) => reply(err).takeover());
                    }
                },
                /*{
                    assign: 'languageId',
                    method(request, reply) {

                        const models = request.server.plugins['plugins/mongoose'].models;
                        const code = request.payload.languageid;

                        models.Language
                            .findOne({ code }, {
                                _id: true
                            })
                            .exec()
                            .then((data) => reply({ id: data._id }))
                            .then((err) => reply(err).takeover());
                    }
                },*/
                {
                    assign: 'languageId',
                    method(request, reply) {

                        const models = request.server.plugins['plugins/mongoose'].models;
                        const title = request.payload.title;
                        const year = request.payload.year;
                        const languageId = request.pre.languageId;
                        const imdbId = request.payload.imdbid;

                        models.Language
                            .find({}, {
                                __v: false,
                                _id: false,
                                createdAt: false,
                                updatedAt: false
                            })
                            .exec()
                            .then((data) => reply(data._id))
                            .catch((err) => reply(err).takeover());
                    }
                },
                {
                    assign: 'payload',
                    method(request, reply) {

                        const title = request.payload.title;
                        const year = request.payload.year;
                        const languageId = request.payload.languageid;
                        const imdbId = request.payload.imdbid;

                        reply({
                            title,
                            year,
                            languageId,
                            imdbId
                        });
                    }
                }
            ],
            handler(request, reply) {

                console.log('payload', request.payload);
                const title = request.payload.title;
                const year = request.payload.year;
                const languageId = request.payload.languageid;
                const imdbId = request.payload.imdbid;

                reply({
                    title,
                    year,
                    languageId,
                    imdbId
                });
            }
        }
    }
];
