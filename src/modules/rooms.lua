local existingIDs = {}

local rooms = {}
local roomFunctions = {}
roomFunctions.__index = roomFunctions

function roomFunctions:Start(user)
    if user ~= self.Host then return end

end

function roomFunctions:AddPlayer(user)
    if self.Started then return end
end

function rooms.new(host)
    math.randomseed(os.clock())
    local randomID
    while not randomID do
        local pickedID = math.random(100000,999999)
        if existingIDs[pickedID] then goto continue end
        existingIDs[pickedID] = true
        randomID = pickedID
        ::continue::
    end
    local room = {
        ID = randomID,
        Host = host,
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
    return room
end

return rooms