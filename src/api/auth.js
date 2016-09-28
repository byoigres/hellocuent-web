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
                                .findOne({ username }, {
                                    __v: false,
                                    updatedAt: false,
                                    createdAt: false
                                })
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
                                        username: user.username
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
                        username: user.username
                    };
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
                                    password: Joi.string().max(80).required().label('password')
                                }, request.i18n)
                                .then(() => reply())
                                .catch((errors) => reply(errors));
                        }
                    },
                    {
                        method(request, reply) {

                            const { username } = request.payload;
                            const models = request.server.plugins['plugins/mongoose'].models;

                            models.User
                            .findOne({ username })
                            .exec()
                            .then((data) => {

                                if (!data) {
                                    return reply();
                                }

                                reply(Boom.notAcceptable(null, {
                                    imdbId: request.i18n.__('user.registered')
                                })).takeover();
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
                    const { username } = request.payload;
                    const { hash } = request.pre;

                    const user = new models.User();

                    user.set({
                        username,
                        password: hash
                    });

                    return user.save()
                        .then(() => reply(user))
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
