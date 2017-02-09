'use strict';

const Mongoose = require('mongoose');

exports.getAll = () => Mongoose.model('movie')
    .find({}, {
        __v: false,
        translations: false,
        updatedAt: false,
        createdAt: false
    })
    .populate('language', '-_id code name')
    .exec();

exports.getMovieById = (id) => Mongoose.model('movie')
    .findOne({
        _id: id
    }, {
        __v: false,
        updatedAt: false,
        createdAt: false
    })
    .populate('language', '-_id name code')
    .populate({
        path: 'translations',
        select: 'title country language description languageTranslations',
        populate: [
            {
                path: 'country',
                select: '-_id code name'
            },
            {
                path: 'language',
                select: '-_id code name'
            },
            {
                path: 'languageTranslations',
                select: 'title language'
            }
        ]
    })
    .exec();

exports.getMovieByImdbId = (imdbId) =>  Mongoose.model('movie').findOne({ imdbId }).exec();

exports.getLanguageByCode = (code) => Mongoose.model('language').findOne({ code }).exec();

exports.addMovie = (
    title,
    year,
    imdbId,
    language,
    poster,
    createdBy
) => {

    const MovieModel = Mongoose.model('movie');
    const movie = new MovieModel();

    movie.set({
        title,
        year,
        imdbId,
        language,
        poster,
        createdBy
    });

    return movie.save();
};
