local MoonCake = require('mooncake') -- EXPRESS for LUA
local json = require('json')

local WebSocket = require('./modules/socket')
local rooms = require('./modules/rooms')

local MoonCakeServer = MoonCake:new()
MoonCakeServer:static("public", {root = '/'})
MoonCakeServer:start(8080)

WebSocket:init()

WebSocket:bind({'Host'}, function(client, data)
    print(data)
    local room = rooms.new(data,client)
    client:send(json.stringify({
        header = "start",
        body = {
            Host = room.Host,
            ID = room.ID,
            Players = room.Players
        }
    }))
end)

WebSocket:bind({'Join'}, function(client, data)
    print(data.room, data.username)
    if not data then return end
    local room = rooms.getRoom(data.room)
    if not room then
        client:send(json.stringify({
            header = 'badStart',
            body = "ERROR: Room Doesn't Exist!"
        }))
        return
    end
    if room.Players[data.username] then
        client:send(json.stringify({
            header = 'badStart',
            body = "ERROR: Username Taken!"
        }))
        return
    end
    room:AddPlayer(data.username, client)
    
    local parsedPlayers = {}
    for player,_ in pairs(room.Players) do
        table.insert(parsedPlayers,player)
    end
    client:send(json.stringify({
        header = "start",
        body = {
            Host = room.Host,
            ID = room.ID,
            Players = parsedPlayers
        }
    }))
end)