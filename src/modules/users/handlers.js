'use strict';

const Models = require('./models');

exports.getUserByUsername = {
    handler(request, reply) {

        const { username } = request.params;

        Models.getUserByUsername(username)
            .then((data) => reply(data))
            .catch((err) => reply(err));
    }
};
