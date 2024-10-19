local json = require("json")

local existingIDs = {}
local existingRooms = {}

local rooms = {}
local roomFunctions = {}
roomFunctions.__index = roomFunctions

function roomFunctions:Start(user)
    if user ~= self.Host then return end

end

function roomFunctions:AddPlayer(username, client)
    if self.Started then return end
    self.Players[username] = client
    local parsedPlayers = {}
    for player,_ in pairs(self.Players) do
        table.insert(parsedPlayers,player)
    end
    self:broadcast('updateLobby',{
        Host = self.Host,
        ID = self.ID,
        Players = parsedPlayers
    })
end

function roomFunctions:broadcast(header, message)
    self.HostClient:send(json.stringify({
        header = header,
        body = message
    }))
    for _,client in pairs(self.Players) do
        client:send(json.stringify({
            header = header,
            body = message
        }))
    end
end

function rooms.new(host, client)
    math.randomseed(os.clock())
    local randomID
    while not randomID do
        local pickedID = math.random(100000,999999)
        if existingRooms[pickedID] then goto continue end
        randomID = tostring(pickedID)
        ::continue::
    end
    local room = {
        ID = randomID,
        Host = host,
        HostClient = client,
        Players = {},
        Started = false,
        MatchData = {
            LastChancellor = nil,
            LastPresident = nil,
            CurrentChancellor = nil,
            CurrentPresident = nil,
            ActivePlayer = nil,
        }
    }
    room = setmetatable(room,roomFunctions)
    existingRooms[randomID] = room
    return room
end

function rooms.getRoom(roomID)
    return existingRooms[roomID]
end

return rooms