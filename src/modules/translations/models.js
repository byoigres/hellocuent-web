'use strict';

const Mongoose = require('mongoose');

exports.getTranslationById = (id) => Mongoose.model('translation')
    .findOne({
        _id: id
    }, {
        __v: false,
        updatedAt: false,
        createdAt: false
    })
    .populate('country', '-_id code name')
    .populate('language', '-_id code name')
    .populate('languageTranslations', 'title language')
    .exec();

exports.getMovieById = (id) => Mongoose.model('movie').findById(id).exec();

exports.getCountryByCode = (code) => Mongoose.model('country').findOne({ code }, '_id code').exec();

exports.getLanguageByCode = (code) => Mongoose.model('language').findOne({ code }, '_id code').exec();

exports.verifyIfTranslationExists = (movieId, countryCode, languageCode) => Mongoose.model('movie')
    .findById(movieId, 'translations _id')
    .populate({
        path: 'translations',
        select: '-_id country',
        populate: [
            {
                path: 'country',
                select: '_id code',
                match: {
                    code: countryCode
                }
            },
            {
                path: 'language',
                select: '_id code',
                match: {
                    code: languageCode
                }
            }
        ]
    })
    .exec();

exports.addTranslation = (
    movieId,
    title,
    countryId,
    languageId,
    description
) => {

    const TranslationModel = Mongoose.model('translation');
    const translation = new TranslationModel();

    translation.set({
        title,
        country: countryId,
        language: languageId,
        description
    });

    return translation.save()
        .then(() => {

            const MovieModel = Mongoose.model('movie');

            return MovieModel.findByIdAndUpdate(movieId, {
                $push: { translations: translation._id }
            }, {
                safe: true,
                upsert: true
            }, (err) => {

                if (err) {
                    return Promise.reject(err);
                }

                return Promise.resolve(translation._id);
            });
        });
};

exports.addLanguageTranslation = (translationId, language, title) => {

    const LanguageTranslationModel = Mongoose.model('languageTranslation');
    const translation = new LanguageTranslationModel();

    translation.set({
        language,
        title
    });

    return translation.save()
        .then(() => {

            const TranslationModel = Mongoose.model('translation');

            return TranslationModel.findByIdAndUpdate(translationId, {
                $push: { languageTranslations: translation._id }
            }, {
                safe: true,
                upsert: true
            }, (err) => {

                if (err) {
                    return Promise.reject(err);
                }

                return Promise.resolve(translation);
            });
        });
};
