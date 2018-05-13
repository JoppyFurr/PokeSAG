#!/usr/bin/luajit

----------------
--  Database  --
----------------
local sqlite3 = require ('lsqlite3')


-- Note: Each radio block runs in its own process, so we can't share a single
--       database connection. For now, re-open/close the database for each new
--       page. To improve this perhaps have each instance of the DBSink block
--       store its own database connection.
--       Note: This will mean we need a destructor for the DBSink block.

-- Create the table if it doesn't already exist
function create_database ()
    local db = sqlite3.open('pages.sqlite3', sqlite3.OPEN_CREATE + sqlite3.OPEN_READWRITE)

    db:exec [[
        create table pages (
            rx_date     date    not null,
            source      string  not null,
            recipient   string  not null,
            content     string  not null);
    ]]

    db:close ()
end

-- Use a prepared statement to store a page in the database
function store_page (date, source, address, content)
    local db = sqlite3.open('pages.sqlite3', sqlite3.OPEN_CREATE + sqlite3.OPEN_READWRITE + sqlite3.OPEN_FULLMUTEX)

    local statement = db:prepare [[
        insert into pages (
            rx_date,
            source,
            recipient,
            content)
        values (
            :p_date,
            :p_source,
            :p_recipient,
            :p_content);
    ]]

    if statement ~= nil then
        statement:bind_names ( { p_date = date,
                                 p_source = source,
                                 p_recipient = address,
                                 p_content = content } )
        statement:step ()
        statement:finalize ()
    else
        print ('Error: Failed to create prepared statement')
    end

    db:close ()
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

function DBSink:process (x)
    local date = os.date ('%F %T')

    for i = 0, x.length-1 do

        -- First, check for an alphanumeric page
        if x.data[i].alphanumeric ~= nil then
            local content = x.data[i].alphanumeric:gsub ('%c','')
            print ('[' .. date .. '] ' .. self.name .. ': ' .. content)
            store_page (date, self.name, x.data[i].address, content)

        -- Failing that, fall back to a numeric page
        elseif x.data[i].numeric ~= nil then
            local content = x.data[i].numeric:gsub ('%c','')
            print ('[' .. date .. '] ' .. self.name .. ': ' .. content)
            store_page (date, self.name, x.data[i].address, content)

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

create_database ()
PokeSAG:run ()
