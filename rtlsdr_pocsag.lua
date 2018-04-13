#!/usr/bin/luajit
local radio = require ('radio')

------------
--  Sink  --
------------
local DBSink = radio.block.factory ('DBSink')
function DBSink:instantiate (name)
    -- Type signature
    self:add_type_signature ( { radio.block.Input ("in", function (type) return type.to_json ~= nil end) }, {} )

    self.name = name
end

function DBSink:process (x)
    for i = 0, x.length-1 do
        if x.data[i].alphanumeric ~= nil then
            local str = x.data[i].alphanumeric:gsub ('%c','')
            print (os.date ("[%F %T] ") .. self.name .. ': ' .. str)
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
local hospital_decoder   = radio.POCSAGReceiver (1200)
local hospital_sink      = DBSink ('Hospital')
PokeSAG:connect (source, hospital_tuner, hospital_decoder, hospital_sink)


PokeSAG:run ()
