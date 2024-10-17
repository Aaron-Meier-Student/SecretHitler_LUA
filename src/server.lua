local MoonCake = require('mooncake')
local WebSocket = require('websocket')

local server = MoonCake:new()
server:static("public")
server:start(8080)

local WS = WebSocket.server.new():listen(8081)

local ConnectedClients = {}

WS:on('connect', function(client)
    print('Client Connected!')
    table.insert(ConnectedClients,client)
    client:send("Welcome")
end)

WS:on('data', function(client, message)
    print(message)
end)

WS:on('disconnect', function(client)
    print('Client disconnected!')
    for index, _client in pairs(ConnectedClients) do
        if _client ~= client then goto continue end
        table.remove(ConnectedClients,index)
        break
        ::continue::
    end
end)