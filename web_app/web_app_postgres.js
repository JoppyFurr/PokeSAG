/*
 * Joppy Furr, 2018
 */
const path = require ('path');
const express = require ('express');
const compression = require ('compression');
const pg = require('pg');
const { DateTime } = require("luxon");

const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME || 'pokesag';
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_PORT = process.env.DB_PORT || 5432;


/***********************
 * Database Connection *
 ***********************/

let db = new pg.Client (
    {
        user: DB_USER,
        password: DB_PASS,
        host: DB_HOST,
        database: DB_NAME,
        port: DB_PORT,
    } );
db.connect ();

/* replace the default node-postgres date parser with one that doesn't (incorrectly) assume UTC */
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, date => {
    return DateTime.fromSQL(date).toISO();
});


/***************
 * HTTP Server *
 ***************/

let app = express ();
let port = process.env.PORT || 8080;

app.use (compression ())

app.use (express.static (path.resolve (__dirname, './client/static'), { 'index': ['index.html'] } ));
app.use (express.static (path.resolve (__dirname, './client/dist')));

/* API to retrieve the 100 most recent pages */
app.get ('/Pages/', function onListenEvent (req, res) {
    db.query (`select rx_date, source, recipient, content from pages
               order by rx_date desc, recipient asc limit 150`, (query_err, query_res) => {
        if (query_err) {
            throw query_err;
        }
        res.send (query_res.rows);
    });
});

/* API to retrieve all pages matching a string */
app.get ('/Pages/Search/:type/:string/', function onListenEvent (req, res) {
    if (req.params.type == 'ft') {
        let search_string = decodeURIComponent(req.params.string);
        db.query (`select rx_date, source, recipient, content from pages where tsx @@ websearch_to_tsquery('simple', $1)
                   order by rx_date desc, recipient asc limit 150`, [search_string], (query_err, query_res) => {
            if (query_err) {
                throw query_err;
            }
            res.send (query_res.rows);
        });
    } else {
        let search_string = decodeURIComponent(req.params.string).replace (/[#%.?\/\\]/g, '');
        db.query (`select rx_date, source, recipient, content from pages where content ilike $1 or recipient=$2
                   order by rx_date desc, recipient asc limit 150`, ['%' + search_string + '%', search_string], (query_err, query_res) => {
            if (query_err) {
                throw query_err;
            }
            res.send (query_res.rows);
        });
    }

});

let server = app.listen (port, '::', function () {
    console.log ('Listening on port %s.', server.address ().port);
});
