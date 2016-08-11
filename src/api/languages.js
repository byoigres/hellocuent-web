'use strict';

// const Joi = require('joi');

module.exports = [
    {
        method: 'GET',
        path: '/api/languages',
        config: {
            handler(request, reply) {

                const models = request.server.plugins['plugins/mongoose'].models;

                models.Language
                    .find({}, {
                        _id: false,
                        __v: false,
                        updatedAt: false,
                        createdAt: false
                    })
                    .exec()
                    .then((languages) => reply(languages))
                    .then((err) => reply(err));
            }
        }
    }
];
