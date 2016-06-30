'use strict';

const Hoek = require('hoek');

const defaultViewsContext = {
    title: 'Hellocuent'
};

exports.register = (server, options, next) => {

    server.ext('onPreResponse', (request, reply) => {

        if (request.response.variety === 'view') {
            const viewsContext = Hoek.clone(defaultViewsContext);

            request.response.source.context = Hoek.merge(viewsContext, request.response.source.context);

            request.response.source.context = Hoek.merge(viewsContext, {
                assets: request.server.settings.app.config.assets
            });

            if (request.auth && request.auth.isAuthenticated && request.auth.credentials) {
                request.response.source.context = Hoek.merge(request.response.source.context, {
                    session: request.auth.credentials
                });
            }
        }

        return reply.continue();
    });

    next();
};

exports.register.attributes = {
    name: 'plugins/context'
};
