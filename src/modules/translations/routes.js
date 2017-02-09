'use strict';

const Handlers = require('./handlers');

exports.register = (server, options, next) => {

    server.route([
        {
            method: 'GET',
            path: '/api/translation/{translationId}',
            config: Handlers.getTranslationById
        },
        {
            method: 'POST',
            path: '/api/translation',
            config: Handlers.addTranslation
        },
        {
            method: 'POST',
            path: '/api/translation/language',
            config: Handlers.addLanguageTranslation
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'modules/translations'
};
