__Warning: Depending on your region, it may not be legal to share or act upon any messages received by a radio scanner__

__You are advised to check your local regulations, and to NOT expose this web-app to the Internet__

# PokéSAG
A web interface for viewing SDR-captured POCSAG pages

## Configuration
At this point, configuration is done by manually editing the source file 'pokesag.lua'. This has been pre-populated with some frequencies used in New Zealand.

## Running
* Launch the receiver via the './run.sh' script. This will receive pages and store them in a single-file sqlite3 database.
* Launch the WebApp with NodeJS: 'nodejs WebApp.js'. This will show the latest 100 pages on localhost:8080.
* The port can be set with the PORT environment variable: 'PORT=1234 nodejs WebApp.js'
