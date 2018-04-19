/*
 * Joppy Furr, 2018
 */
const express = require ('express');
const sqlite3 = require ('sqlite3').verbose ();

/* Database connection */
let db = new sqlite3.Database('../pages.sqlite3', (error) => {
    if (error) {
        return console.error (error.message);
    }
    console.log ('PokéSAG WebApp connected to database file pages.sqlite3');
});

/* HTTP Server */
let app = express ();
let port = process.env.PORT || 8080;

app.use (express.static ('Static', { 'index': ['main.html'] } ));

let server = app.listen (port, '::', function () {
    console.log ('Listening on port %s.', server.address ().port);
});
