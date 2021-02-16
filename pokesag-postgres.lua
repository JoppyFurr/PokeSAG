#!/usr/bin/luajit

------------------
--  Environment --
------------------
local username = os.getenv("DB_USER")
local password = os.getenv("DB_PASS")
local path = os.getenv("DB_PATH")

----------------
--  Database  --
----------------
local postgres = require ('pgsql')


-- Note: Each radio block runs in its own process, so we can't share a single
--       database connection. For now, re-open/close the database for each new
--       page. To improve this perhaps have each instance of the DBSink block
--       store its own database connection.
--       Note: This will mean we need a destructor for the DBSink block.

-- Create the table if it doesn't already exist
function create_database ()
    local db = postgres.connectdb (
        'postgresql://' .. username .. ':' .. password .. '@' .. path)

        if db:status() == postgres.CONNECTION_OK then
            print ('Connected to database.')
        else
            print ('Error connecting to database.')
            print (db:errorMessage())
            return false
        end
    
    
        print ('Attempting to create table...')
        local rc = db:exec [[
            CREATE TABLE IF NOT EXISTS pages (
                rx_date     timestamp   not null,
                source      text        not null,
                recipient   text        not null,
                content     text        not null);
        ]]
    
        if rc:status() == postgres.PGRES_COMMAND_OK then
            print ('...table okay.')
        else
            print ('Error creating table.')
            print (rc:errorMessage ())
            return false
        end
    
        print ('Attempting to create search index column...')
        local rc = db:exec [[
            ALTER TABLE pages
            ADD COLUMN IF NOT EXISTS tsx tsvector
            GENERATED ALWAYS AS (to_tsvector('simple', content)) STORED;
        ]]
    
        if rc:status() == postgres.PGRES_COMMAND_OK then
            print ('...search index column okay.')
        else
            print ('Error creating search index column.')
            print (rc:errorMessage ())
            return false
        end
    
        print ('Attempting to create search index...')
        local rc = db:exec [[
            CREATE INDEX IF NOT EXISTS search_idx ON pages USING GIN (tsx);
        ]]
    
        if rc:status() == postgres.PGRES_COMMAND_OK then
            print ('...search index okay.')
        else
            print ('Error creating search index.')
            print (rc:errorMessage ())
            return false
        end
    
        db:finish ()
        return true
end

-- Use a prepared statement to store a page in the database
function store_page (date, source, address, content)
    local db = postgres.connectdb(
        'postgresql://' .. username .. ':' .. password .. '@' .. path)

    local rc = db:prepare ('add-page',
        [[
            insert into pages (
                rx_date,
                source,
                recipient,
                content)
            values ($1, $2, $3, $4);
        ]]
    )
    if rc:status() ~= postgres.PGRES_COMMAND_OK then
        print ("Create prepared statement: " .. rc:errorMessage ())
    end

    rc = db:execPrepared ('add-page', date, source, address, content)
    if rc:status() ~= postgres.PGRES_COMMAND_OK then
        print ("Exec prepared statement: " .. rc:errorMessage ())
    end

    db:finish ()
end


------------
--  Sink  --
------------
local radio = require ('radio')
local DBSink = radio.block.factory ('DBSink')

function DBSink:instantiate (name)
    -- Type signature
    self:add_type_signature ( { radio.block.Input ('in', function (type) return type.to_json ~= nil end) }, {} )

    self.name = name
end

function clean_string (s_dirty)
    local s_clean = ''

    for i = 1, #s_dirty do
        local c = s_dirty:sub (i, i)
        if c:byte () >= 32 and c:byte () < 127 then
            s_clean = s_clean .. c
        end
    end

    return s_clean
end

function DBSink:process (x)
    local date = os.date ('%F %T')

    for i = 0, x.length-1 do

        -- First, check for an alphanumeric page
        if x.data[i].alphanumeric ~= nil then
            local content = clean_string (x.data[i].alphanumeric)
            -- print ('[' .. date .. '] ' .. self.name .. ': ' .. content)
            store_page (date, self.name, tostring(x.data[i].address), content)

        -- Failing that, fall back to a numeric page
        elseif x.data[i].numeric ~= nil then
            local content = clean_string (x.data[i].numeric)
            -- print ('[' .. date .. '] ' .. self.name .. ': ' .. content)
            store_page (date, self.name, tostring(x.data[i].address), content)

        end
    end
end


----------------
--  Receiver  --
----------------
local PokeSAG = radio.CompositeBlock ()

-- Receiver frequency: 157.900 MHz
local source = radio.RtlSdrSource (157900000, 1000000)

-- Telecom: 157.925 MHz
local telecom925_tuner   = radio.TunerBlock (-25000, 12e3, 80)
local telecom925_decoder = radio.POCSAGReceiver (1200)
local telecom925_sink    = DBSink ('Telecom 925')
PokeSAG:connect (source, telecom925_tuner, telecom925_decoder, telecom925_sink)

-- Telecom: 157.950 MHz
local telecom950_tuner   = radio.TunerBlock (-50000, 12e3, 80)
local telecom950_decoder = radio.POCSAGReceiver (1200)
local telecom950_sink    = DBSink ('Telecom 950')
PokeSAG:connect (source, telecom950_tuner, telecom950_decoder, telecom950_sink)

-- Hospital: 157.975 MHz
local hospital_tuner     = radio.TunerBlock (-75000, 12e3, 80)
local hospital_decoder   = radio.POCSAGReceiver (512)
local hospital_sink      = DBSink ('Ambulance')
PokeSAG:connect (source, hospital_tuner, hospital_decoder, hospital_sink)

if create_database () then
    print ('Starting PokeSAG.')
    PokeSAG:run ()
else
    print ('Unable to access database.')
end
