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
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'pokesag',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'pokesag',
    password: process.env.DB_PASS || 'pokesag',
});

function latest(offset=0) {
    return db.any (`SELECT rx_date, source, recipient, content FROM pages 
                    ORDER BY rx_date DESC, recipient ASC 
                    LIMIT 100 OFFSET $1::int`, [offset]);
}

function search(query, offset=0) {
    return db.any (`SELECT rx_date, source, recipient, content FROM pages 
                    WHERE tsx @@ websearch_to_tsquery('simple', $2::text)
                    ORDER BY rx_date DESC, recipient ASC 
                    LIMIT 100 OFFSET $1::int`, [offset, query]);
}

function search_basic(query, offset=0) {
    return db.any (`SELECT rx_date, source, recipient, content FROM pages 
                    WHERE content ILIKE $2::text OR recipient=$3::text
                    ORDER BY rx_date DESC, recipient ASC 
                    LIMIT 100 OFFSET $1::int`, [offset, `%${query}%`, query]);
}


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

function offset(req) {
    return Math.max (0, (parseInt (req.params.page) - 1) * 100) || 0;
}

GET('/pages/', () => latest ());
GET('/pages/:page/', req => latest (offset(req)));

GET('/pages/search/ft/:q/', req => search (req.params.q));
GET('/pages/search/ft/:q/:page/', req => search (req.params.q, offset(req)));

GET('/pages/search/basic/:q/', req => search_basic (req.params.q));
GET('/pages/search/basic/:q/:page/', req => search_basic (req.params.q, offset(req)));

let server = app.listen (port, '::', function () {
    console.log ('Listening on port %s.', server.address ().port);
});
