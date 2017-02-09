'use strict';

const Mongoose = require('mongoose');

exports.getUserByUsername = (username) => Mongoose.model('user')
    .findOne({ username }, {
        __v: false,
        password: false,
        updatedAt: false,
        createdAt: false
    })
    .populate('language', '-_id -updatedAt -createdAt')
    .exec();
