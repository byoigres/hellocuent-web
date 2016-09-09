'use strict';

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
    },
    {
        method: 'GET',
        path: '/api/languages/country/{code}',
        config: {
            handler(request, reply) {

                const { code } = request.params;

                const models = request.server.plugins['plugins/mongoose'].models;

                models.Country
                    .findOne({ code }, {
                        _id: false,
                        __v: false,
                        name: false,
                        code: false,
                        updatedAt: false,
                        createdAt: false
                    })
                    .populate('languages', '-_id name code')
                    .exec()
                    .then((data) => reply(data.languages.map((item) => item)))
                    .then((err) => reply(err));
            }
        }
    }
];
