'use strict';
const Confidence = require('confidence');
const Config = require('./config');

const criteria = {
    env: process.env.NODE_ENV
};

const manifest = {
    $meta: 'Emojite API Manifest',
    server: {
        debug: {
            log: ['error'],
            request: ['error']
        },
        app: {
            config: Config.get('/')
        }
    },
    connections: [{
        host: Config.get('/server/api/host'),
        port: Config.get('/server/api/port'),
        labels: Config.get('/server/api/labels')
    }],
    registrations: [
        { plugin: 'inert' },
        { plugin: 'vision' },
        {
            plugin: {
                register: 'visionary',
                options: {
                    engines: {
                        js: 'hapi-react-views'
                    },
                    compileOptions: {
                        renderMethod: 'renderToString'
                    },
                    relativeTo: __dirname,
                    path: './views'
                }
            }
        },
        {
            plugin: {
                register: 'hapi-i18n',
                options: {
                    locales: ['es', 'en'],
                    directory: `${__dirname}/config/locales`
                }
            }
        },
        /*
        {
            plugin: {
                register: './plugins/thinky-models',
                options: {
                    host: '172.17.0.1'
                }
            }
        },*/
        {
            plugin: './plugins/context'
        },
        {
            plugin: './plugins/requestValidation'
        },
        {
            plugin: './plugins/mongoose'
        },
        {
            plugin: './plugins/views'
        },
        {
            plugin: './api'
        },
        {
            plugin: './api/movies'
        }/*,
        {
            plugin: {
                register: './plugins/rethinkdb',
                options: {
                    host: '172.17.0.1'
                }
            }
        },
        {
            plugin: './plugins/omdbapi'
        }*/
    ]
};

const store = new Confidence.Store(manifest);

exports.get = (key) => store.get(key, criteria);

exports.meta = (key) => store.meta(key, criteria);
