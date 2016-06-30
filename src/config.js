'use strict';
const Confidence = require('confidence');

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
        directory: __dirname + '\\public\\images\\'
    }
};

const store = new Confidence.Store(manifest);

exports.get = (key) => store.get(key, criteria);

exports.meta = (key) => store.meta(key, criteria);
