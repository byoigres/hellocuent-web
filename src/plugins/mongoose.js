'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

exports.register = (plugin, opts, next) => {

    const mongoose = Mongoose.connect('mongodb://172.17.0.1/test');

    const models = {};

    models.Country = mongoose.model('country', {
        name: String,
        code: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    models.Language = mongoose.model('language', {
        name: String,
        code: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    models.Translation = mongoose.model('translation', {
        title: String,
        country: {
            type: Schema.Types.ObjectId, ref: 'country'
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    const movieSchema = new Schema({
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

    movieSchema.method('toClient', function () {

        const obj = this.toObject();

        //Rename fields
        obj.id = obj._id;
        delete obj._id;

        return obj;
    });

    /*
    movieSchema.set('toJSON', {
        virtuals: true
    });
    */

    models.Movie = mongoose.model('movie', movieSchema);

    plugin.expose('models', models);

    plugin.log(['mongoose-models', 'info'], 'Models area added');

    return next();
};

exports.register.attributes = {
    name: 'plugins/mongoose'
};
