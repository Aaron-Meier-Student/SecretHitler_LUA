const startMenu = document.getElementById("startMenu")
const loadingScreen = document.getElementById("loadingScreen")

const hostMenu = document.getElementById("hostFrame");
const joinMenu = document.getElementById("joinFrame");

Array.from(startMenu.getElementsByTagName('nav')[0].getElementsByTagName('button')).forEach(element => {
  element.onclick = function() {
    if (element.innerHTML == "JOIN") {
      startMenu.getElementsByTagName('nav')[0].querySelector('#join').className = 'selected'
      startMenu.getElementsByTagName('nav')[0].querySelector('#host').className = ''
      startMenu.getElementsByTagName('nav')[0].querySelector('#slidebar').className = ''
      startMenu.querySelector('#joinFrame').className = 'showFrame'
      startMenu.querySelector('#hostFrame').className = ''
      startMenu.className = 'showFrame'
    } else {
      startMenu.getElementsByTagName('nav')[0].querySelector('#join').className = ''
      startMenu.getElementsByTagName('nav')[0].querySelector('#host').className = 'selected'
      startMenu.getElementsByTagName('nav')[0].querySelector('#slidebar').className = 'selected'
      startMenu.querySelector('#joinFrame').className = ''
      startMenu.querySelector('#hostFrame').className = 'showFrame'
      startMenu.className = ''
    }
  }
});

function setLoading(time, status) {
  loadingScreen.getElementsByTagName('h4')[0].innerHTML = status
  loadingScreen.className = 'shown'
  setTimeout(() => {
    loadingScreen.className = 'hidden'
  }, time * 1000);
}

function host() {
  const username = hostMenu.getElementsByTagName('input')[0];

  if (username.value) {
  setLoading(2, 'Creating Room')
  startMenu.className = 'hidden'

    username.value = "";
  }
};

function join() {
  const username = joinMenu.getElementsByTagName('input')[0];
  const roomCode = joinMenu.getElementsByTagName('input')[1];

  if (username.value && roomCode.value && roomCode.value.length == 5) {
  setLoading(2, 'Joining Room')
  startMenu.className = 'hidden'

    username.value = "";
    roomCode.value = "";
  }
}

let socketUrl = `ws://${window.location.hostname}:8081`;
const maxSocketRetries = 10;
let socketRetries = 1;

function connectWebSocket() {
  const socket = new WebSocket(socketUrl);

  socket.onopen = function(event) {
    console.log(`Connected to the Server Successfully | Attempts: ${socketRetries}`);
    socketRetries = 0;
    socket.send('Thank you!')
  };

  socket.onmessage = function(event) {
    console.log(event);
  };
  
  socket.onerror = function(error) {
    console.error('WebSocket Error:', error);
    socket.close();
  };

  socket.onclose = function(event) {
    if (socketRetries <= maxSocketRetries) {
      socketRetries++;
      console.log('Reattempting Connections...');
      setTimeout(connectWebSocket, 2000);
    } else {
      console.log('Max Retries Reached. Could not connect to the WebSocket Server.');
    }
  };
}

connectWebSocket();


/*socket.on("join", (room) => {
  //alert(roomCode);
  console.log(room)
  room = JSON.parse(room);
  let playerText = [];
  for (let player in room.players) {
    playerText.push(player);
  }
  playerText.join(", ")
  document.getElementById("roomCode").innerHTML = `Room Code: ${room.roomCode}<br>Players: ${playerText}`;
});*/

