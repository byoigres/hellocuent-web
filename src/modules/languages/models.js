'use strict';

const Mongoose = require('mongoose');

exports.getAllLanguages = (criteria) => Mongoose.model('languages')
    .find(criteria, {
        _id: false,
        __v: false,
        updatedAt: false,
        createdAt: false
    })
    .exec();

exports.getLanguagesByCountry = (code) => Mongoose.model('country')
    .findOne({ code }, {
        _id: false,
        __v: false,
        name: false,
        code: false,
        updatedAt: false,
        createdAt: false
    })
    .populate('languages', '-_id name code')
    .exec();
