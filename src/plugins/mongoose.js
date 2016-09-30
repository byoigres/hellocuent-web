'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

exports.register = (plugin, opts, next) => {

    const mongoose = Mongoose.connect('mongodb://172.17.0.2/test');

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
        description: String,
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
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    schemas.user = new Schema({
        username: String,
        email: String,
        password: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    // Models
    models.Country = mongoose.model('country', schemas.country);

    models.Language = mongoose.model('language', schemas.language);

    models.Translation = mongoose.model('translation', schemas.translation);

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
