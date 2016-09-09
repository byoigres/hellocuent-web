'use strict';

exports.register = (server, options, next) => {

    server.route([
        {
            method: 'GET',
            path: '/api/countries/{code?}',
            handler(request, reply) {

                const { code } = request.params;
                let criteria = {};

                if (code) {
                    criteria = { code };
                }

                const models = request.server.plugins['plugins/mongoose'].models;

                models.Country.find(criteria,'-_id -__v -createdAt -updatedAt')
                    .populate('languages', '-_id code')
                    .exec()
                    .then((data) => {

                        const result = data.map((item) => {

                            return {
                                name: item.name,
                                code: item.code,
                                languages: item.languages.map((lang) => lang.code)
                            };
                        });

                        reply(result);
                    })
                    .catch((error) => reply(error));
            }
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'api/countries'
};
