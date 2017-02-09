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
        },
        cache: {
            name: 'mongo',
            engine: 'catbox-mongodb',
            uri: Config.get('/db/cache/uri'),
            partition: Config.get('/db/cache/partition')
        }
    },
    connections: [{
        host: Config.get('/server/api/host'),
        port: Config.get('/server/api/port'),
        labels: Config.get('/server/api/labels'),
        routes: {
            validate: Config.get('/routeValidations')
        }
    }],
    registrations: [
        {
            plugin: {
                register: 'good',
                options: {
                    reporters: {
                        console: [{
                            module: 'good-console'
                        }, 'stdout']
                    }
                }
            }
        },
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
                    directory: `${__dirname}/resources/locales`
                }
            }
        },
        { plugin: 'hapi-auth-jwt2' },
        {
            plugin: './plugins/context'
        },
        {
            plugin: './plugins/mongoose'
        },
        {
            plugin: './plugins/session'
        },
        {
            plugin: './modules/public/routes'
        },
        {
            plugin: './modules/authorization/routes'
        },
        {
            plugin: './modules/movies/routes'
        },
        {
            plugin: './modules/countries/routes'
        },
        {
            plugin: './modules/translations/routes'
        },
        {
            plugin: './modules/users/routes'
        }
    ]
};

const store = new Confidence.Store(manifest);

exports.get = (key) => store.get(key, criteria);

exports.meta = (key) => store.meta(key, criteria);
