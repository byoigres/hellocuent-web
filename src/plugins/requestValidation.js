'use strict';

const Joi = require('joi');
const Boom = require('boom');

const internals = {};

internals.validate = (value, schema, i18n) => {

    const result = Joi.validate(value, schema, {
        abortEarly: false
    });

    if (result.error) {
        const errors = {};

        result.error.details.forEach((error) => {

            const field = error.context.key;

            errors[field] = i18n.__(`${field}.${error.type}`);
        });

        return Promise.reject(Boom.badRequest(null, errors));
    }

    return Promise.resolve();
};

exports.register = (server, options, next) => {

    server.method('requestValidation', internals.validate, {
        callback: false
    });

    next();
};

exports.register.attributes = {
    name: 'helpers/joi'
};
