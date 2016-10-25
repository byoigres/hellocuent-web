'use strict';

module.exports = [
    {
        method: 'GET',
        path: '/api/languages',
        config: {
            handler(request, reply) {

                const models = request.server.plugins['plugins/mongoose'].models;
                const { exclude } = request.query;
                const criteria = {};

                if (exclude) {
                    criteria.code = {
                        $ne: exclude
                    };
                }

                models.Language
                    .find(criteria, {
                        _id: false,
                        __v: false,
                        updatedAt: false,
                        createdAt: false
                    })
                    .exec()
                    .then((languages) => reply(languages))
                    .catch((err) => reply(err));
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
                    .catch((err) => reply(err));
            }
        }
    }
];
