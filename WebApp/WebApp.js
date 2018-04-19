/*
 * Joppy Furr, 2018
 */

/* HTTP Server */
var express = require ("express"),
    app = express (),
    port = process.env.PORT || 8080;

app.use (express.static ("Static", { "index": ["main.html"] } ));

var server = app.listen (port, "::", function () {
    console.log ("Listening on port %s.", server.address ().port);
});
