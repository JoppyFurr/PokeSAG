__Warning: Depending on your region, it may not be legal to share or act upon any messages received by a radio scanner. 
You are advised to check your local regulations, and to NOT expose PokéSAG to the internet.__

![PokéSAG Logo](web_app/client/static/images/icon_x128.png)

# PokéSAG
An interface for receiving and viewing POCSAG pages.

The receiver has been tested with an RTL-SDRv3 on a Raspberry Pi 2. CPU utilisation is around 80%.

## Configuration
PokéSAG is configured using environment variables. The following environment variables are always available.

* `PORT`: The port for the web interface.

The following environment variables are only used for PostgreSQL.

* `DB_HOST`: The host/IP address of your database server.
* `DB_PORT`: The port of your database server.
* `DB_NAME`: The name of the database that PokéSAG wil use.
* `DB_USER`: The username that PokéSAG wil use.
* `DB_PASS`: The password that PokéSAG wil use.

Frequency and device configuration is done by manually editing the source file `pokesag.lua` / `pokesag-postgres.lua`.
These files have been pre-populated with some frequencies used in New Zealand.

## Installing Dependencies
This section assumes a Debian-based OS such as Ubuntu or Raspbian.

A number of common packages will be required:
```sh
apt-get install -y build-essential cmake git libpq-dev pkg-config luajit luarocks 
```

### Installing LuaRadio
Install the `rtl-sdr`, `libliquid-dev`, `libvolk1-dev`, and `libfftw3-dev` packages, and run the following commands.

```sh
git clone --depth 1 https://github.com/vsergeev/luaradio.git
cd luaradio/embed
make install-lmod
```

### Installing luapgsql (for PostgreSQL)
Install the `libpq-dev` package, and run the following command.

```sh
luarocks install luapgsql PQ_INCDIR=/usr/include/postgresql
```

### Installing lsqlite3 (for SQLite)
```sh
luarocks install lsqlite3
```

## Running PokéSAG
PokéSAG consists of two seperate components - a POCSAG reciever and a web interface. 

### Running the Reciever

Launch the receiver with the `./run.sh` or `./run-postgres.sh` script. This will receive pages and store them in a database.

### Running the Web App

* Change to the `web_app` directory.
* Install the required dependencies with `npm install`.
* Build the javascript with `npm run build`.
* Launch the web app with `npm run start` or `npm run start-postgres`.
* The web interface will now be available at http://localhost:8080/
