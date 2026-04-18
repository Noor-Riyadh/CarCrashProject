const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080 });

let players = {};
let playerCount = 0;

server.on("connection", function (socket) {
  // Assign player ID
  playerCount++;
  const playerId = "player" + playerCount;
  players[playerId] = socket;
  console.log(playerId + " connected!");

  // Tell this player their ID
  socket.send(
    JSON.stringify({
      type: "connected",
      id: playerId,
    }),
  );

  // Tell all players how many are connected
  broadcast({ type: "playerCount", count: Object.keys(players).length });

  // When this player sends a message
  socket.on("message", function (data) {
    const message = JSON.parse(data);

    // Player sent their position
    if (message.type === "move") {
      Object.keys(players).forEach(function (id) {
        if (id !== playerId && players[id].readyState === WebSocket.OPEN) {
          players[id].send(
            JSON.stringify({
              type: "opponentMove",
              x: message.x,
              y: message.y,
              score: message.score,
            }),
          );
        }
      });
    }

    // Player got game over
    if (message.type === "gameOver") {
      Object.keys(players).forEach(function (id) {
        if (id !== playerId && players[id].readyState === WebSocket.OPEN) {
          players[id].send(
            JSON.stringify({
              type: "opponentGameOver",
            }),
          );
        }
      });
    }
  });

  // When player disconnects
  socket.on("close", function () {
    console.log(playerId + " disconnected!");
    delete players[playerId];
    broadcast({
      type: "playerCount",
      count: Object.keys(players).length,
    });
  });
});

function broadcast(data) {
  Object.keys(players).forEach(function (id) {
    if (players[id].readyState === WebSocket.OPEN) {
      players[id].send(JSON.stringify(data));
    }
  });
}

console.log("Multiplayer server running on port 8080!");
