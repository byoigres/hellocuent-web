'use strict';
const Fetch = require('node-fetch');

const API_URL = 'http://www.omdbapi.com/?type=movie&r=json&';

const findMovieByName = (name) => {

    return Fetch(`${API_URL}s=${name}`)
        .then((response) => response.json())
        .then((json) => {

            if (json.Response === 'True') {

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
};

const findMovieByImdbId = (imdbId) => {

    return Fetch(`${API_URL}&i=${imdbId}`)
        .then((response) => response.json())
        .then((json) => {

            // console.log('JSON', json);
            if (json.Response === 'True') {

                return Object.assign({}, {
                    title: json.Title,
                    year: json.Year
                });
            }

            if (json.Response === 'False') {

                return null;
            }

            return Promise.reject('500 Server Error');
        });
};

exports.register = (plugin, opts, next) => {

    plugin.expose('findMovieByName', findMovieByName);
    plugin.expose('findMovieByImdbId', findMovieByImdbId);

    return next();
};

exports.register.attributes = {
    name: 'plugins/omdbapi'
};
