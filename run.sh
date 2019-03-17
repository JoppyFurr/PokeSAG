#!/bin/sh

# Make sure we've got the LuaRocks path set up
eval $(luarocks path --bin)

# Start PokéSAG
#./pokesag.lua

export DB_USER="username"
export DB_PASS="password"
export DB_PATH="server:port/path"

./pokesag-postgres.lua
