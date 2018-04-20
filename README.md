__Warning: Depending on your region, it may not be legal to share or act upon any messages received by a radio scanner__

__You are advised to check your local regulations, and to NOT expose this web-app to the Internet__

# PokéSAG
A web interface for viewing SDR-captured POCSAG pages

## Dependencies
* LuaRadio
* LuaJIT
* sqlite3
* lsqlite3 for Lua ('luarocks install lsqlite3 --local')
* sqlite3 for Node ('npm install' in the WebApp directory')

## Configuration
* The port for the web app can be supplied as the environment variable PORT. (defaults to 8080)
* Frequency / device configuration is done by manually editing the source file 'pokesag.lua'. This has been pre-populated with some frequencies used in New Zealand.

## Running
* Launch the receiver via the './run.sh' script. This will receive pages and store them in a single-file sqlite3 database.
* Launch the WebApp with NodeJS: 'nodejs WebApp.js'. This will show the latest 100 pages on localhost:8080.
