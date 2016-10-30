'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

exports.register = (plugin, opts, next) => {

    const config = plugin.settings.app.config.db.app;
    const mongoose = Mongoose.connect(`${config.uri}/${config.partition}`);

    const models = {};
    const schemas = {};

    // Models
    schemas.country = new Schema({
        name: String,
        code: String,
        languages: [{
            type: Schema.Types.ObjectId, ref: 'language'
        }],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    schemas.language = new Schema({
        name: String,
        code: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    schemas.translation = new Schema({
        title: String,
        country: {
            type: Schema.Types.ObjectId, ref: 'country'
        },
        language: {
            type: Schema.Types.ObjectId, ref: 'language'
        },
        description: { type: String, default: '' },
        languageTranslations: [{
            type: Schema.Types.ObjectId, ref: 'languageTranslation'
        }],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    schemas.movie = new Schema({
        title: String,
        year: Number,
        imdbId: String,
        language: {
            type: Schema.Types.ObjectId, ref: 'language'
        },
        translations: [{
            type: Schema.Types.ObjectId, ref: 'translation'
        }],
        poster: String,
        createdBy: {
            type: Schema.Types.ObjectId, ref: 'user'
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    schemas.user = new Schema({
        username: String,
        email: String,
        name: String,
        password: String,
        language: {
            type: Schema.Types.ObjectId, ref: 'language'
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    schemas.languageTranslation = new Schema({
        language: {
            type: Schema.Types.ObjectId, ref: 'language'
        },
        title: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    // Models
    models.Country = mongoose.model('country', schemas.country);

    models.Language = mongoose.model('language', schemas.language);

    models.Translation = mongoose.model('translation', schemas.translation);

    models.LanguageTranslation =  mongoose.model('languageTranslation', schemas.languageTranslation);

    models.Movie = mongoose.model('movie', schemas.movie);

    models.User = mongoose.model('user', schemas.user);

    // Schema options
    Object.keys(schemas).forEach((key) => {

        schemas[key].set('toJSON', {
            virtuals: true
        });

        schemas[key].options.toJSON.transform = (doc, ret, options) => {

            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        };
    });

    plugin.expose('models', models);

    plugin.log(['mongoose-models', 'info'], 'Models area added');

    return next();
};

exports.register.attributes = {
    name: 'plugins/mongoose'
};
