#!/bin/sh

# Make sure we've got the LuaRocks path set up
eval $(luarocks path --bin)

# Start PokéSAG

export DB_HOST="localhost"
export DB_NAME="pokesag"
export DB_USER="username"
export DB_PASS="password"
export DB_PORT="5432"

./pokesag-postgres.lua
