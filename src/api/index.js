'use strict';

exports.register = (server, options, next) => {

    server.route([
        {
            method: 'GET',
            path: '/api/test',
            config: {
                handler(request, reply) {

                    const s = request.query.s;

                    const r = request.server.plugins['plugins/rethinkdb'].rethinkdb;
                    const connection = request.server.plugins['plugins/rethinkdb'].connection;

                    /*
                    r.db('test').tableCreate('movies').run(connection)
                        .then((response) => {

                            reply(response);
                        }).error((error) => {

                            reply(error);
                        });
                    */
                    /*
                    r.db('test').table('movies')
                        .insert(r.http('http://rethinkdb.com/sample/top-250-ratings.json'))
                        .run(connection)
                        .then((response) => {

                            reply(response);
                        }).error((error) => {

                            reply(error);
                        });
                    */
                    //r.table('movies').filter({ rank: 4 }).run(connection)
                    r.table('movies')
                        .filter(r.row('title').match(`(?i)${s}`))
                        .limit(10).run(connection)
                        .then((cursor) => cursor.toArray())
                        .then((response) => {

                            console.log(response);
                            reply(response);
                        }).error((error) => {

                            reply(error);
                        });
                }
            }
        },
        {
            method: 'GET',
            path: '/api/omdbapi',
            config: {
                handler(request, reply) {

                    const s = request.query.s;
                    const findMovie = request.server.plugins['plugins/omdbapi'].findMovie;

                    return findMovie(s).then((json) => reply(json)).catch((err) => reply(err));
                }
            }
        }
    ]);

    next();
};

exports.register.attributes = {
    name: 'api/index'
};
