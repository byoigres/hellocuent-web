'use strict';
const Confidence = require('confidence');
const Path = require('path');

const criteria = {
    env: process.env.NODE_ENV
};

const manifest = {
    $meta: 'Emojite Web-API Configuration',
    server: {
        api: {
            host: 'localhost',
            port: 7001,
            labels: ['web-api']
        }
    },
    db: {
        cache: {
            uri: 'mongodb://172.17.0.2',
            partition: 'cache'
        },
        app: {
            uri: 'mongodb://172.17.0.2',
            partition: 'hellocuent'
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
    uploads: {
        directory: Path.join(__dirname, 'public/images')
    }
};

const store = new Confidence.Store(manifest);

exports.get = (key) => store.get(key, criteria);

exports.meta = (key) => store.meta(key, criteria);
