'use strict';
const RethinkDb = require('rethinkdb');

exports.register = (plugin, opts, next) => {

    opts = opts || {};

    if (!opts.url) {
        opts.port = opts.port || 28015;
        opts.host = opts.host || 'localhost';
        opts.db = opts.db || 'test';

        if (opts.password) {
            opts.authKey = opts.password;
        }
    }
    else {
        const url = require('url').parse(opts.url);
        opts.port = parseInt(url.port, 10) || 28015;
        opts.host = url.hostname || 'localhost';
        opts.db = url.pathname ? url.pathname.replace(/^\//, '') : 'test';

        if (url.auth) {
            opts.authKey = url.auth.split(':')[1];
        }
    }

    if (opts.url && (opts.host || opts.port || opts.db || opts.password)) {
        plugin.log(['hapi-rethinkdb', 'warn'], 'Define either an URL or host, port, db and password variables');
    }

    RethinkDb.connect(opts, (err, conn) => {

        if (err) {
            plugin.log(['hapi-rethinkdb', 'error'], err.message);
            console.error(err);
            return next(err);
        }

        plugin.expose('connection', conn);
        plugin.expose('library', RethinkDb);
        plugin.expose('rethinkdb', RethinkDb);
        plugin.bind({
            rethinkdbConn: conn,
            rethinkdb: RethinkDb
        });

        plugin.log(['hapi-rethinkdb', 'info'], 'RethinkDB connection established');
        return next();
    });
};

exports.register.attributes = {
    name: 'plugins/rethinkdb'
};
