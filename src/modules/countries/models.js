'use strict';

const Mongoose = require('mongoose');

exports.getAllCountries = (criteria) => Mongoose.model('country')
    .find(criteria, '-_id -__v -createdAt -updatedAt')
    .populate('languages', '-_id code')
    .exec();
