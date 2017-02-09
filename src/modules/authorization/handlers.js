'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Bcrypt = require('bcryptjs');
const Models = require('./models');

exports.login = {
    auth: {
        mode: 'try',
        strategy: 'strategy-jwt'
    },
    validate: {
        payload: {
            username: Joi.string().max(35).required().label('username'),
            password: Joi.string().max(80).required().label('password')
        }
    },
    pre: [
        {
            assign: 'user',
            method(request, reply) {

                const { username, password } = request.payload;

                Models.validateCredentialsByEmailOrUsernameAndPassword(username, password)
                    .then((user) => {

                        if (user === undefined || user === null) {
                            return reply(Boom.notAcceptable(null, request.i18n.__('user.notFound')));
                        }

                        if (!Bcrypt.compareSync(password, user.password)) {
                            return reply(Boom.notAcceptable(null, request.i18n.__('user.notFound')));
                        }

                        reply({
                            id: user._id,
                            username: user.username,
                            email: user.email,
                            name: user.name,
                            language: user.language
                        });
                    })
                    .catch((err) => reply(err));
            }
        }
    ],
    handler(request, reply) {

        const { user } = request.pre;

        const sid = Uuid.v4();

        const sessionData = {
            sid,
            id: user.id,
            username: user.username,
            language: user.language.code
        };
        console.log('sessionData', sessionData);
        const token = createToken(sid, sessionData);

        request.server.app.cache.set(sid, sessionData, 0, (err) => {

            if (err) {
                return reply(err);
            }

            return reply(user).header('Authorization', token);
        });
    }
};

exports.register = {
    validate: {
        payload: {
            username: Joi.string().max(35).required().label('username'),
            email: Joi.string().email().max(80).required().label('email'),
            name: Joi.string().max(60).required().label('name'),
            password: Joi.string().max(80).required().label('password'),
            confirmPassword: Joi.string().max(80).required().label('confirmPassword')
        }
    },
    pre: [
        {
            method(request, reply) {

                const { password, confirmPassword } = request.payload;

                if (password !== confirmPassword) {
                    return reply(Boom.notAcceptable(null, request.i18n.__('RegisterUserAccount.PasswordsDontMatch')));
                }

                reply();
            }
        },
        {
            method(request, reply) {

                const { username, email } = request.payload;

                Models.findUserByEmailOrUsername(email, username)
                    .then((data) => {
                        console.log('AAA');
                        if (!data) {
                            return reply();
                        }
                        console.log('BBB');
                        if (data.username === username) {
                            return reply(Boom.notAcceptable(null, {
                                username: request.i18n.__('RegisterUserAccount.UsernameAlreadyExists')
                            }));
                        }
                        console.log('CCC');
                        if (data.email === email) {
                            return reply(Boom.notAcceptable(null, {
                                email: request.i18n.__('RegisterUserAccount.EmailAlreadyExists')
                            }));
                        }
                        console.log('DDD');
                    })
                    .catch((err) => reply(err));
            }
        },
        {
            assign: 'hash',
            method(request, reply) {

                const { password } = request.payload;

                reply(Bcrypt.hashSync(password, 10));
            }
        }
    ],
    handler(request, reply) {

        const { username, email, name } = request.payload;
        const { hash } = request.pre;

        Models.saveUser(username, email, name, hash)
            .then(() => reply({}))
            .catch((err) => reply(err));
    }
};
