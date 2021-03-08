/*
 * Joppy Furr, 2018
 */
const path = require ('path');
const express = require ('express');
const compression = require ('compression');
const { DateTime } = require('luxon');


/***********************
 * Database Connection *
 ***********************/

const pgp = require('pg-promise')();

// replace the default node-postgres date parser with one that doesn't (incorrectly) assume UTC
pgp.pg.types.setTypeParser(pgp.pg.types.builtins.TIMESTAMP, date => {
    return DateTime.fromSQL(date).toISO();
});

const db = pgp ({
    user: process.env.DB_USER,
    password: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME || 'pokesag',
    port: process.env.DB_PORT || 5432,
});


/***************
 * HTTP Server *
 ***************/

let app = express ();
let port = process.env.PORT || 8080;

app.use (compression ())

app.use (express.static (path.resolve (__dirname, './client/static'), { 'index': ['index.html'] } ));
app.use (express.static (path.resolve (__dirname, './client/dist')));

/* A small wrapper around a app.get handler.
   This abstracts away generic code that is used on all API requests. */
function GET(url, handler) {
    app.get(url, async (req, res) => {
        try {
            // execute the database query
            const data = await handler(req);
            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || error
            });
        }
    });
}

GET('/pages/', () => {
    return db.any(`select rx_date, source, recipient, content from pages 
                   order by rx_date desc, recipient asc 
                   limit 150`);
});

GET('/pages/search/ft/:string/', req => {
    const query = req.params.string;
    return db.any(`select rx_date, source, recipient, content from pages 
                   where tsx @@ websearch_to_tsquery('simple', $1::text)
                   order by rx_date desc, recipient asc 
                   limit 150`, [query]);
});

GET('/pages/search/basic/:string/', req => {
    const query = req.params.string;
    return db.any(`select rx_date, source, recipient, content from pages 
                   where content ilike $1::text OR recipient=$2::text
                   order by rx_date desc, recipient asc 
                   limit 150`, [`%${query}%`, query]);
});

let server = app.listen (port, '::', function () {
    console.log ('Listening on port %s.', server.address ().port);
});
