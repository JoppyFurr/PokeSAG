/*
 * Joppy Furr, 2018
 */
const path = require ('path');
const express = require ('express');
const compression = require ('compression');
const sqlite3 = require ('sqlite3').verbose ();
const { DateTime } = require('luxon');


/*********************
 * Utility functions *
 *********************/

function fix_dates (rows)
{
    for (i = 0; i < rows.length; i++)
    {
        /* Convert legacy date format to ISO 8601 */
        rows[i].rx_date = DateTime.fromSQL(rows[i].rx_date).toISO();
    }
}


/***********************
 * Database Connection *
 ***********************/
const db_path = path.resolve (__dirname, '../pages.sqlite3');
let db = new sqlite3.Database(db_path, sqlite3.OPEN_READONLY, (error) => {
    if (error) {
        return console.error (error.message);
    }
    console.log ('PokéSAG WebApp connected to database file pages.sqlite3');
});

function latest(offset=0) {
    return db.prepare (`SELECT * FROM pages 
                        ORDER BY rx_date DESC, recipient ASC 
                        LIMIT 100 OFFSET (?)`, [offset]);
}

function search(query, offset=0) {
    return db.prepare (`SELECT * FROM pages 
                        WHERE content LIKE (?) 
                        ORDER BY rx_date DESC, recipient ASC 
                        LIMIT 100 OFFSET (?)`, [`%${query}%`, offset]);
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
    app.get(url, (req, res) => {
        handler(req).all ((error, rows) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    error: error.message || error
                });
            }
            fix_dates (rows);
            res.json({
                success: true,
                data: rows
            });
        });
    });
}

function offset(req) {
    return Math.max (0, (parseInt (req.params.page) - 1) * 100) || 0;
}

GET('/pages/', () => latest ());
GET('/pages/:page/', req => latest (offset(req)));

GET('/pages/search/:t/:q/', req => search (req.params.q));
GET('/pages/search/:t/:q/:page/', req => search (req.params.q, offset(req)));

let server = app.listen (port, '::', function () {
    console.log ('Listening on port %s.', server.address ().port);
});
