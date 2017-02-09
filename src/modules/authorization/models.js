'use strict';

const Mongoose = require('mongoose');

exports.validateCredentialsByEmailOrUsernameAndPassword = (username, password) => {

    const UserModel = Mongoose.model('user');

    return UserModel
        .findOne({
            $or: [
                { username },
                { email: username }
            ]
        }, {
            __v: false,
            updatedAt: false,
            createdAt: false
        })
        .populate('language', '-_id code name')
        .exec();
};

exports.findUserByEmailOrUsername = (email, username) => {

    const UserModel = Mongoose.model('user');

    return UserModel
        .findOne({
            $or: [
                { email },
                { username }
            ]
        })
        .exec();
};

exports.saveUser = (username, email, name, hashedPassword) => {

    const UserModel = Mongoose.model('user');
    const user = new UserModel();

    user.set({
        username,
        email,
        name,
        password: hashedPassword
    });

    return user.save();
};
