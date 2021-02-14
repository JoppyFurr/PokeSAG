#!/bin/sh

# Make sure we've got the LuaRocks path set up
eval $(luarocks path --bin)

# Start PokéSAG
./pokesag.lua
