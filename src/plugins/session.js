'use strict';

exports.register = (server, options, next) => {

    const cache = server.cache({
        cache: 'mongo',
        segment: 'sessions',
        expiresIn: 3 * 24 * 60 * 60 * 1000
    });

    server.app.cache = cache;

    server.auth.strategy('strategy-jwt', 'jwt', {
        key: 'NeverShareYourSecret',
        validateFunc: (decoded, request, callback) => {

            console.log('>>>>>>>>>>>>>>>>>>>>>>>>> decoded\n\n', decoded, '\n\n>>>>>>>>>>>>>>>>>>>>>>>>>\n');

            cache.get(decoded.sid, (err, cached) => {

                console.log('>>>>>>>>>>>>>>>>>>>>>>>>> cached err\n\n', err, '\n\n>>>>>>>>>>>>>>>>>>>>>>>>>\n');
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>> cached\n\n', cached, '\n\n>>>>>>>>>>>>>>>>>>>>>>>>>\n');

                if (err) {
                    return callback(err, false);
                }

                if (!cached) {
                    return callback(null, false);
                }

                return callback(null, true, cached);
            });
        },
        verifyOptions: {
            algorithms: ['HS256']
        }
    });

    next();
};

exports.register.attributes = {
    name: 'plugins/session'
};
