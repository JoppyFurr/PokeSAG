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
    let statement = db.prepare ('select * from pages order by rx_date desc, recipient asc limit 150');
    statement.all ([], (error, rows) => {
        if (error) {
            throw error;
        }
        fix_dates (rows);
        res.send (rows);
    });
});

/* API to retrieve all pages matching a string */
app.get ('/Pages/Search/:type/:string/', function onListenEvent (req, res) {
    let search_string = decodeURIComponent(req.params.string).replace (/[#%.?\/\\]/g, '');
    let statement = db.prepare ("select * from pages where content like (?) order by rx_date desc, recipient asc limit 150");
    statement.all (['%' + search_string + '%'], (error, rows) => {
        if (error) {
            throw error;
        }
        fix_dates (rows);
        res.send (rows);
    });
});

let server = app.listen (port, '::', function () {
    console.log ('Listening on port %s.', server.address ().port);
});
