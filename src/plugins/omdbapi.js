'use strict';
const Fetch = require('node-fetch');

exports.register = (plugin, opts, next) => {

    const API_URL = 'http://www.omdbapi.com/?type=movie&r=json&s=';

    plugin.expose('findMovie', (name) => {

        return Fetch(`${API_URL}${name}`)
            .then((response) => response.json())
            .then((json) => {

                if (json.Response === 'True') {
                    // console.log(json);

                    return json.Search.map((movie) => {

                        return Object.assign({}, {
                            title: movie.Title,
                            year: movie.Year,
                            imdbId: movie.imdbID
                        });
                    });
                }

                return Promise.reject('500 Server Error');
            });
    });

    return next();
};

exports.register.attributes = {
    name: 'plugins/omdbapi'
};
