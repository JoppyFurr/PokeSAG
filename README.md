__Warning: Depending on your region, it may not be legal to share or act upon any messages received by a radio scanner__

__You are advised to check your local regulations, and to NOT expose this web-app to the Internet__

# PokéSAG
An interface for receiving and viewing POCSAG pages

The receiver has been tested with an RTL-SDRv3 on a Raspberry Pi 2. CPU utilisation is around 80%.

## Dependencies
* LuaRadio
  * Dependencies of LuaRadio (fftw3, libvolk, libliquid)
* LuaJIT
* SQLite3
* SQLite3 for Lua (`luarocks install lsqlite3 --local`)
* SQLite3 for Node (`npm install` in the WebApp directory)

### For Postgres
* libpg-dev
* Postgres for Lua (`luarocks install luapgsql --local PQ_INCDIR=/usr/include/postgresql PQ_LIBDIR=/usr/lib/arm-linux-gnueabihf`)
  * Note: This command will need to be modified if not running on ARM
* Postgres for Node (`npm install` in the WebApp directory)

## Configuration
* The port for the web app can be supplied as the environment variable PORT. (defaults to 8080)
* Frequency and device configuration is done by manually editing the source file `pokesag.lua` / `pokesag-postgres.lua`.
  * This has been pre-populated with some frequencies used in New Zealand.

## Running
* Launch the receiver with the `./run.sh` or `./run-postgres.sh` script. This will receive pages and store them in a database.

* Launch the WebApp with NodeJS: `nodejs WebApp.js` or `nodejs WebApp-postgres.js`. This will show the latest 100 pages on localhost:8080.
