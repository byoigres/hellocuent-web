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
        imdbId: type.string()
    });

    models.Translation = thinky.createModel('translation', {
        id: type.string(),
        title: type.string(),
        movieId: type.string()
    });

    models.Movie.hasMany(models.Translation, 'translations', 'id', 'movieId');
    models.Translation.belongsTo(models.Movie, 'movie', 'movieId', 'id');

    plugin.expose('models', models);

    plugin.log(['thinky-models', 'info'], 'Models area added');

    return next();
};


exports.register.attributes = {
    name: 'plugins/thinky-models'
};
