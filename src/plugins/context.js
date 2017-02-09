'use strict';

const Hoek = require('hoek');

const defaultViewsContext = {
    title: 'Hellocuent'
};

exports.register = (server, options, next) => {

    server.ext('onPreResponse', (request, reply) => {

        const { response } = request;

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

        const contentType = request.raw.req.headers['content-type'];

        if (!response.isBoom && contentType && contentType.match(/application\/json/)) {
            return reply.continue();
        }

        if (response.isBoom /*&& response.data.name === 'ValidationError'*/) {
            // response.output.payload.message = 'Custom Message';
            if (response.data === null) {
                return reply.continue();
            }

            if (typeof response.data === 'string') {
                response.output.payload = {
                    error: {
                        message: response.data
                    }
                };
            }
            else {
                const messages = {};

                response.data.details.map((item) => {
                    messages[item.context.key] = item.message;
                });

                response.output.payload = {
                    error: {
                        messages
                    }
                };
            }
        }

        return reply.continue();
    });

    next();
};

exports.register.attributes = {
    name: 'plugins/context'
};
