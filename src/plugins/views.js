'use strict';

exports.register = (server, options, next) => {

    server.route([
        {
            method: 'GET',
            path: '/{p*}',
            handler(request, reply) {

                reply.view('HomeView');
            }
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'plugins/views'
};
