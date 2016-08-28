'use strict';

exports.register = (server, options, next) => {

    server.route([
        {
            method: 'GET',
            path: '/images/{p*}',
            handler: {
                directory: {
                    path: './src/public/images'
                }
            }
        },
        {
            method: 'GET',
            path: '/static/{p*}',
            handler: {
                directory: {
                    path: './src/public/static'
                }
            }
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'plugins/public'
};
