let ConnectedSocket;
let responseBinds = {}

// Client Variables

let clientRoomId;
let clientUsername;

// Loading Functionality

let currentlyLoading = false;

function setLoading(reason, status) {
    if (!reason) reason = 'Loading';
    if (status == null) status = !currentlyLoading; currentlyLoading = status;
    document.getElementById('loading').className = status ? '' : 'hidden';
    document.querySelector('#loading h4').innerHTML = reason
};

// Start Functionality

const startArea = document.getElementById('start');

let currentPage = 'join';
function setPage(page) {
    if (!page) page = currentPage == 'join' ? 'host' : 'join';
    startArea.querySelector('button#join').className = page == 'join' ? 'selected' : '';
    startArea.querySelector('button#host').className = page == 'host' ? 'selected' : '';
    startArea.querySelector('#slidebar').className = page == 'host' ? 'selected' : '';
    startArea.querySelector('#joinFrame').className = page == 'join' ? 'showFrame' : '';
    startArea.querySelector('#hostFrame').className = page == 'host' ? 'showFrame' : '';
    document.querySelector('#start > div').className = page == 'join' ? 'showFrame' : '';
    currentPage = page;
};

startArea.querySelectorAll('nav button').forEach(element => {
    element.onclick = function () {
        if (currentPage == element.id) return;
        setPage(element.id);
    };
});

startArea.querySelector('#joinFrame button').onclick = function () {
    const username = document.querySelector('#joinFrame input:nth-child(1)').value;
    const roomcode = document.querySelector('#joinFrame input:nth-child(2)').value;
    if (!username || !roomcode || roomcode.length < 6) return;
    clientUsername = username;
    clientRoomId = roomcode;
    ConnectedSocket.send(JSON.stringify({
        headers: ['Join'],
        body: {
            username: username,
            room: roomcode
        }
    }));
};

startArea.querySelector('#hostFrame button').onclick = function () {
    const username = document.querySelector('#hostFrame input').value;
    if (!username) return;
    clientUsername = username;
    ConnectedSocket.send(JSON.stringify({
        headers: ['Host'],
        body: username
    }));
};

responseBinds.badStart = function(message) {
    clientRoomId = null;
    clientUsername = null;
    setLoading('', false);
    startArea.querySelector('#error').innerHTML = message;
};

responseBinds.start = function(lobbyData) {
    startArea.className = 'hidden';
    lobbyArea.className = '';
    setLoading('', false);
    updateLobby(lobbyData);
};

// Lobby Functionality

const lobbyArea = document.getElementById('lobby');

function updateLobby(lobbyData) {
    console.log(lobbyData);
    lobbyArea.querySelector('#code h3').innerHTML = lobbyData.ID;
    lobbyArea.querySelector('#host h3').innerHTML = lobbyData.Host;
    lobbyArea.querySelector('#players').querySelectorAll('h2').forEach(h2 => h2.remove());
    Object.values(lobbyData.Players).forEach(player => {
        let newH2 = document.createElement('h2');
        newH2.innerHTML = player;
        lobbyArea.querySelector('#players').appendChild(newH2);
    });
    lobbyArea.querySelector('#players h4').innerHTML = `Players (${lobbyData.Players.length}/9)`
}

responseBinds.updateLobby = updateLobby;

responseBinds.startGame = function(message) {


};

// Match Functionality

const matchArea = document.getElementById('game');

responseBinds.updateMatch = function(matchData) {

}

// Socket Connection

let socketUrl = `ws://${window.location.hostname}:8081`;
const maxSocketRetries = 10;
let socketRetries = 1;
function connectWebSocket() {
    setLoading('Connecting to Socket | Attempt: ' + socketRetries, true)
    const socket = new WebSocket(socketUrl);
    socket.onopen = function (event) {
        setLoading('', false)
        console.log(`Connected to the Server Successfully | Attempts: ${socketRetries}`);
        socketRetries = 0;
        ConnectedSocket = socket;
    };
    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        Object.entries(responseBinds).forEach(([key, value]) => {
            if (key != data.header) return;
            value(data.body)
        });
    };
    socket.onerror = function (error) {
        console.error('WebSocket Error:', error);
        socket.close();
    };
    socket.onclose = function (event) {
        if (socketRetries <= maxSocketRetries) {
            socketRetries++;
            console.log('Reattempting Connections...');
            setTimeout(connectWebSocket, 2000);
        } else {
            setLoading(`ERROR: Couldn't connect to the Socket in 10 tries, please Reload`, true)
            console.log('Max Retries Reached. Could not connect to the WebSocket Server.');
        }
    };
}

connectWebSocket();