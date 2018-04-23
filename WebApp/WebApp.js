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

/* API to retrieve the 100 most recent pages */
app.get ('/Pages/', function onListenEvent (req, res) {
    let statement = db.prepare ('select * from pages order by rx_date desc limit 100');
    statement.all ([], (error, rows) => {
        if (error) {
            throw error;
        }
        res.send (rows);
    });
});

/* API to retrieve all pages matching a string */
app.get ('/Pages/Search/:string/', function onListenEvent (req, res) {
    let statement = db.prepare ("select * from pages where content like (?) order by rx_date desc");
    statement.all (['%' + req.params.string + '%'], (error, rows) => {
        if (error) {
            throw error;
        }
        res.send (rows);
    });
});

let server = app.listen (port, '::', function () {
    console.log ('Listening on port %s.', server.address ().port);
});
