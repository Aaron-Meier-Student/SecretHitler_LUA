local WebSocket = require('websocket')
local json = require('json')


function tablesMatch(t1, t2)
    if #t1 ~= #t2 then
        return false
    end
    local countMap = {}
    for _, item in ipairs(t1) do
        countMap[item] = (countMap[item] or 0) + 1
    end
    for _, item in ipairs(t2) do
        if not countMap[item] or countMap[item] == 0 then
            return false
        end
        countMap[item] = countMap[item] - 1
    end
    return true
end

local MainWebSocket
local Connections = {}

local binds = {}

local socket = {}

function socket:bind(headers, func)
    table.insert(binds,{
        headers = headers,
        func = func
    })
end

function socket:init()
    MainWebSocket = WebSocket.server.new():listen(8081)

    MainWebSocket:on('connect', function(client)
        print('Client Connected!')
        table.insert(Connections, client)
    end)

    MainWebSocket:on('data', function(client, message)
        local data = json.parse(message)
        if not data then return end
        for _,bind in pairs(binds) do
            if not tablesMatch(bind.headers, data.headers) then goto continue1 end
            bind.func(client, data.body)
            ::continue1::
        end
    end)

    MainWebSocket:on('disconnect', function(client)
        print('Client disconnected!')
        for index, _client in pairs(Connections) do
            if _client ~= client then goto continue2 end
            table.remove(Connections, index)
            break
            ::continue2::
        end
    end)
end

return socket
