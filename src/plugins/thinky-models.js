'use strict';

const Thinky = require('thinky');

exports.register = (plugin, options, next) => {

    const thinky = Thinky({
        host: options.host || '172.17.0.1'
    });

    const type = thinky.type;

    const models = {};

    models.Movie = thinky.createModel('movie', {
        id: type.string(),
        title: type.string(),
        year: type.string(),
        imdbId: type.string(),
        languageId: type.string()
    });

    models.Translation = thinky.createModel('translation', {
        id: type.string(),
        title: type.string(),
        movieId: type.string(),
        countryId: type.string()
    });

    models.Country = thinky.createModel('country', {
        id: type.string(),
        name: type.string(),
        code: type.string()
    });

    models.Language = thinky.createModel('language', {
        id: type.string(),
        name: type.string(),
        code: type.string(),
        description: type.virtual().default(function () {

            return `${this.name} (${this.code})`;
        })
    });

    models.Language.hasMany(models.Movie, 'movies', 'id', 'languageId');
    models.Movie.belongsTo(models.Language, 'language', 'languageId', 'id');

    models.Movie.hasMany(models.Translation, 'translations', 'id', 'movieId');
    models.Translation.belongsTo(models.Movie, 'movies', 'movieId', 'id');

    models.Country.hasMany(models.Translation, 'translations', 'id', 'translationId');
    models.Translation.belongsTo(models.Country, 'country', 'countryId', 'id');

    models.Language.hasMany(models.Translation, 'translations', 'id', 'translationId');
    models.Translation.belongsTo(models.Language, 'language', 'languageId', 'id');

    plugin.expose('models', models);

    plugin.log(['thinky-models', 'info'], 'Models area added');

    return next();
};


exports.register.attributes = {
    name: 'plugins/thinky-models'
};
