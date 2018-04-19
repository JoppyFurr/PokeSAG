/*
 * Joppy Furr, 2018
 */
const express = require ('express');
const sqlite3 = require ('sqlite3').verbose ();

/***********************
 * Database Connection *
 ***********************/

let db = new sqlite3.Database('../pages.sqlite3', sqlite3.OPEN_READONLY, (error) => {
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

app.use (express.static ('Client', { 'index': ['main.html'] } ));

/* API to retrieve pages */
/* TODO: Come up with something faster, like sending 100 pages at a time */
app.get ('/Pages/', function onListenEvent (req, res) {
    db.all ('select * from pages order by rx_date', [], (error, rows) => {
        if (error) {
            throw error;
        }
        res.send (rows);
    });
});

let server = app.listen (port, '::', function () {
    console.log ('Listening on port %s.', server.address ().port);
});
