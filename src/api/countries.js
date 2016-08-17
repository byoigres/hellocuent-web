'use strict';

exports.register = (server, options, next) => {

    server.route([
        {
            method: 'GET',
            path: '/api/countries',
            handler(request, reply) {

                const models = request.server.plugins['plugins/mongoose'].models;

                models.Country.find({},'-_id -__v -createdAt -updatedAt')
                    .exec()
                    .then((data) => reply(data))
                    .catch((error) => reply(error));
            }
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'api/countries'
};
