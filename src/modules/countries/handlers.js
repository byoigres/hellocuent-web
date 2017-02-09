'use strict';

const Models = require('./models');

exports.getAllCountries = {
    handler(request, reply) {

        const { code } = request.params;
        let criteria = {};

        if (code) {
            criteria = { code };
        }

        Models.getAllCountries(criteria)
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
};
