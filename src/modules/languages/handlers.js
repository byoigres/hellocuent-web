'use strict';

const Models = require('./models');

exports.getAllLanguages = {
    handler(request, reply) {

        const { exclude } = request.query;
        const criteria = {};

        if (exclude) {
            criteria.code = {
                $ne: exclude
            };
        }

        Models.getAllLanguages(criteria)
            .then((languages) => reply(languages))
            .catch((err) => reply(err));
    }
};

exports.getLanguagesByCountry = {
    handler(request, reply) {

        const { code } = request.params;

        Models.getLanguagesByCountry(code)
            .then((data) => reply(data.languages.map((item) => item)))
            .catch((err) => reply(err));
    }
};
