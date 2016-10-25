'use strict';

const Languages = require('./languages');

exports.register = (server, options, next) => {

    server.route(Languages);

    server.route([
        {
            method: 'GET',
            path: '/api',
            /*config: {
                auth: {
                    mode: 'required',
                    strategy: 'strategy-jwt'
                }
            },*/
            handler(request, reply) {

                const models = request.server.plugins['plugins/mongoose'].models;

                //reply(Object.keys(models));
                models
                    .LanguageTranslation.find({})
                    .exec()
                    .then((languages) => reply(languages))
                    .catch((err) => reply(err));
            }
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'api/index'
};
