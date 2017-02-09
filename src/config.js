'use strict';
const Confidence = require('confidence');
const Path = require('path');
const MongodbUri = require('mongodb-uri');

const criteria = {
    env: process.env.NODE_ENV
};

const manifest = {
    $meta: 'Web-API Configuration',
    server: {
        api: {
            host: process.env.API_HOST,
            port: process.env.API_PORT,
            labels: ['web-api']
        }
    },
    db: {
        cache: {
            uri: MongodbUri.format({
                hosts: [{
                    host: process.env.MONGO_HOST
                }]
            }),
            partition: process.env.MONGO_PARTITION
        },
        app: {
            uri: MongodbUri.format({
                hosts: [{
                    host: process.env.MONGO_HOST
                }]
            }),
            partition: process.env.MONGO_PARTITION
        }
    },
    assets: {
        $filter: 'env',
        $default: {
            vendor: {
                js: '/public/static/vendor.js',
                css: '/public/static/vendor.css'
            },
            app: {
                js: '/public/static/app.js'
            }
        },
        production: {}
    },
    routeValidations: {
        options: {
            abortEarly: false
        },
        failAction: function (request, reply, source, error) {

            if (request.i18n && error && error.data && error.data.isJoi) {

                error.data.details.forEach((item) => {

                    const field = item.context.key;

                    item.message = request.i18n.__(`${field}.${item.type}`);
                });

                return reply(error);
            }

            reply();
        }
    },
    uploads: {
        directory: Path.join(__dirname, 'public/images')
    }
};

const store = new Confidence.Store(manifest);

exports.get = (key) => store.get(key, criteria);

exports.meta = (key) => store.meta(key, criteria);
