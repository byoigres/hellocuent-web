'use strict';

// const Joi = require('joi');

module.exports = [
    {
        method: 'GET',
        path: '/api/languages',
        config: {
            handler(request, reply) {

                const models = request.server.plugins['plugins/thinky-models'].models;

                return models.Language
                .pluck([
                    'id',
                    'name',
                    'code',
                    'description'
                ])
                .run()
                .then((json) => reply(json)).catch((err) => reply(err));
            }
        }
    }
];
