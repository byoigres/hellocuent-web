'use strict';

const Hoek = require('hoek');

const defaultViewsContext = {
    title: 'Hellocuent'
};

exports.register = (server, options, next) => {

    server.ext('onPreResponse', (request, reply) => {

        const { response } = request;
        // console.log(JSON.stringify(response, null, 2));
        if (response.variety === 'view') {
            const viewsContext = Hoek.clone(defaultViewsContext);

            response.source.context = Hoek.merge(viewsContext, response.source.context);

            response.source.context = Hoek.merge(viewsContext, {
                assets: request.server.settings.app.config.assets
            });

            if (request.auth && request.auth.isAuthenticated && request.auth.credentials) {
                response.source.context = Hoek.merge(response.source.context, {
                    session: request.auth.credentials
                });
            }
        }

        if (response.isBoom /*&& response.data.name === 'ValidationError'*/) {
            // response.output.payload.message = 'Custom Message';
            response.output.payload = {
                error: {
                    messages: response.data
                }
            };
        }

        return reply.continue();
    });

    next();
};

exports.register.attributes = {
    name: 'plugins/context'
};
