'use strict';
const Joi = require('joi');
const Boom = require('boom');
const Bcrypt = require('bcrypt');
const Uuid = require('uuid');
const Jwt = require('jsonwebtoken');

/*eslint hapi/hapi-scope-start: 0*/
const createToken = (sid, data) => Jwt.sign(data, 'NeverShareYourSecret', {
    algorithm: 'HS256',
    expiresIn: '1h'
});
// THIS IS TEMPORARY
// THIS IS TEMPORARY
// THIS IS TEMPORARY

exports.register = (server, options, next) => {

    server.route([
        {
            method: 'POST',
            path: '/api/auth/login',
            config: {
                auth: {
                    mode: 'try',
                    strategy: 'strategy-jwt'
                },
                pre: [
                    {
                        method(request, reply) {

                            server.methods
                                .requestValidation(request.payload, {
                                    username: Joi.string().max(35).required().label('username'),
                                    password: Joi.string().max(80).required().label('password')
                                }, request.i18n)
                                .then(() => reply())
                                .catch((errors) => reply(errors));
                        }
                    },
                    {
                        assign: 'user',
                        method(request, reply) {

                            const { username, password } = request.payload;
                            const models = request.server.plugins['plugins/mongoose'].models;

                            models.User
                                .findOne({
                                    $or: [
                                        { username },
                                        { email: username }
                                    ]
                                }, {
                                    __v: false,
                                    updatedAt: false,
                                    createdAt: false
                                })
                                .populate('language', '-_id code name')
                                .exec()
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
            }
        },
        {
            method: 'POST',
            path: '/api/auth/register',
            config: {
                pre: [
                    {
                        method(request, reply) {

                            server.methods
                                .requestValidation(request.payload, {
                                    username: Joi.string().max(35).required().label('username'),
                                    email: Joi.string().email().max(80).required().label('email'),
                                    name: Joi.string().max(60).required().label('name'),
                                    password: Joi.string().max(80).required().label('password'),
                                    confirmPassword: Joi.string().max(80).required().label('confirmPassword')
                                }, request.i18n)
                                .then(() => reply())
                                .catch((errors) => reply(errors));
                        }
                    },
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
                            const models = request.server.plugins['plugins/mongoose'].models;

                            models.User
                            .findOne({
                                $or: [
                                    { username },
                                    { email }
                                ]
                            })
                            .exec()
                            .then((data) => {

                                if (!data) {
                                    return reply();
                                }

                                if (data.username === username) {
                                    return reply(Boom.notAcceptable(null, {
                                        username: request.i18n.__('RegisterUserAccount.UsernameAlreadyExists')
                                    }));
                                }

                                if (data.email === email) {
                                    return reply(Boom.notAcceptable(null, {
                                        email: request.i18n.__('RegisterUserAccount.EmailAlreadyExists')
                                    }));
                                }
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

                    const models = request.server.plugins['plugins/mongoose'].models;
                    const { username, email, name } = request.payload;
                    const { hash } = request.pre;

                    const user = new models.User();

                    user.set({
                        username,
                        email,
                        name,
                        password: hash
                    });

                    return user.save()
                        .then(() => reply({}))
                        .catch((err) => reply(err));
                }
            }
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'api/auth'
};
