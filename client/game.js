import {
  drawRoad,
  updateRoad,
  spawnTraffic,
  drawTraffic,
  updateTraffic,
  resetRoad,
  trafficVehicles,
} from "./road.js";

// ── Multiplayer ──
let socket = null;
let opponentPlayer = null;
let myPlayerId = null;
let isMultiplayer = false;

// ── Game State ──
const gameState = {
  screen: "MENU", // which screen is showing right now
  speed: 3, // how fast everything moves
  score: 0, // current score
  bestScore: 0, // highest score ever
  isPaused: false, // is game paused?
  isOver: false, // did player crash?
};

// ── Player ──
const player = {
  x: 175,
  y: 550,
  width: 50,
  height: 100,
  speed: 5,
};

// ── Assets ──
const assets = {};
function loadAssets() {
  assets.playerCar = new Image();
  assets.playerCar.src = "./assets/player_car.png";
  assets.enemyCar = new Image();
  assets.enemyCar.src = "./assets/enemy_car.png";
}

// ── Canvas ──
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ── Score ──
function increaseScore() {
  gameState.score += Math.floor(gameState.speed * 0.5);
  if (gameState.score % 200 === 0 && gameState.score > 0) {
    gameState.speed += 0.3;
  }
}

function saveBestScore() {
  if (gameState.score > gameState.bestScore) {
    gameState.bestScore = gameState.score;
    localStorage.setItem("bestScore", gameState.bestScore);
  }
}

function loadBestScore() {
  gameState.bestScore = parseInt(localStorage.getItem("bestScore")) || 0;
}

// ── Collision ──
function checkCollision(player, enemy) {
  const padding = 15;
  return (
    player.x + padding < enemy.x + enemy.width - padding &&
    player.x + player.width - padding > enemy.x + padding &&
    player.y + padding < enemy.y + enemy.height - padding &&
    player.y + player.height - padding > enemy.y + padding
  );
}

function checkAllEnemies(enemies, player) {
  for (let i = 0; i < enemies.length; i++) {
    if (checkCollision(player, enemies[i])) {
      handleGameOver();
      break;
    }
  }
}

function handleGameOver() {
  if (!gameState.isOver) {
    gameState.isOver = true;
    gameState.screen = "GAMEOVER";
    saveBestScore();
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "gameOver" }));
    }
  }
}
function checkOpponentCollision() {
  if (!isMultiplayer || !opponentPlayer) return;
  const opponentHitbox = {
    x: opponentPlayer.x,
    y: opponentPlayer.y,
    width: player.width,
    height: player.height,
  };
  for (let i = 0; i < trafficVehicles.length; i++) {
    if (checkCollision(opponentHitbox, trafficVehicles[i])) {
      opponentPlayer.crashed = true;
      break;
    } else {
      opponentPlayer.crashed = false;
    }
  }
}

// ── Draw ──
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (gameState.screen === "MENU") drawMenu();
  if (gameState.screen === "PLAYING") drawGame();
  if (gameState.screen === "GAMEOVER") drawGameOver();
}

function drawMenu() {
  ctx.fillStyle = "#0D0D1A";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#FF4444";
  ctx.font = "bold 40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("CAR CRASH", canvas.width / 2, 200);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "20px Arial";
  ctx.fillText("TRAFFIC RACER 2D", canvas.width / 2, 240);

  ctx.fillStyle = "#FFD700";
  ctx.font = "18px Arial";
  ctx.fillText("BEST: " + gameState.bestScore, canvas.width / 2, 300);

  // ctx.drawImage(assets.playerCar, 175, 350, 50, 100);
  ctx.drawImage(assets.playerCar, 175, 310, 50, 100);

  // PLAY button
  ctx.fillStyle = "#2E75B6";
  ctx.beginPath();
  ctx.roundRect(130, 430, 140, 50, 10);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 20px Arial";
  ctx.fillText("PLAY", canvas.width / 2, 463);

  // MULTIPLAYER button
  ctx.fillStyle = "#1E6B3C";
  ctx.beginPath();
  ctx.roundRect(130, 495, 140, 45, 10);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 16px Arial";
  ctx.fillText("MULTIPLAYER", canvas.width / 2, 523);
}

function drawGame() {
  drawRoad(ctx, canvas);
  drawTraffic(ctx, assets.enemyCar);

  ctx.drawImage(
    assets.playerCar,
    player.x,
    player.y,
    player.width,
    player.height,
  );

  // HUD
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, 30);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.fillText("SCORE: " + gameState.score, 10, 20);
  ctx.fillStyle = "#FFD700";
  ctx.textAlign = "right";
  ctx.fillText("BEST: " + gameState.bestScore, canvas.width - 10, 20);

  // Pause button
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.roundRect(canvas.width / 2 - 20, 5, 40, 22, 5);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("||", canvas.width / 2, 21);

  // Draw opponent
  if (isMultiplayer && opponentPlayer) {
    ctx.globalAlpha = opponentPlayer.crashed ? 0.3 : 0.8;
    ctx.drawImage(
      assets.enemyCar,
      opponentPlayer.x,
      opponentPlayer.y,
      player.width,
      player.height,
    );
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = opponentPlayer.crashed ? "#FF4444" : "#00FF88";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      opponentPlayer.crashed
        ? "P2: CRASHED"
        : "P2: " + (opponentPlayer.score || 0),
      opponentPlayer.x + 25,
      opponentPlayer.y - 5,
    );
  }
  // Paused overlay
  if (gameState.isPaused) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
  }
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#FF3333";
  ctx.font = "bold 52px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, 120);

  ctx.fillStyle = "#444444";
  ctx.fillRect(60, 135, canvas.width - 120, 2);

  ctx.fillStyle = "#1A1A1A";
  ctx.beginPath();
  ctx.roundRect(50, 150, canvas.width - 100, 100, 12);
  ctx.fill();
  ctx.fillStyle = "#AAAAAA";
  ctx.font = "16px Arial";
  ctx.fillText("YOUR SCORE", canvas.width / 2, 180);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 48px Arial";
  ctx.fillText(gameState.score, canvas.width / 2, 235);

  if (gameState.score >= gameState.bestScore && gameState.score > 0) {
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 + 30, 240, 90, 24, 6);
    ctx.fill();
    ctx.fillStyle = "#333300";
    ctx.font = "bold 12px Arial";
    ctx.fillText("NEW BEST!", canvas.width / 2 + 75, 257);
  }

  ctx.fillStyle = "#1A1A1A";
  ctx.beginPath();
  ctx.roundRect(50, 270, canvas.width - 100, 70, 12);
  ctx.fill();
  ctx.fillStyle = "#AAAAAA";
  ctx.font = "16px Arial";
  ctx.fillText("BEST SCORE", canvas.width / 2, 295);
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 28px Arial";
  ctx.fillText(gameState.bestScore, canvas.width / 2, 328);

  ctx.fillStyle = "#2E75B6";
  ctx.beginPath();
  ctx.roundRect(80, 370, canvas.width - 160, 50, 10);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 22px Arial";
  ctx.fillText("RESTART", canvas.width / 2, 403);

  ctx.fillStyle = "#444444";
  ctx.beginPath();
  ctx.roundRect(80, 435, canvas.width - 160, 45, 10);
  ctx.fill();
  ctx.fillStyle = "#CCCCCC";
  ctx.font = "18px Arial";
  ctx.fillText("MAIN MENU", canvas.width / 2, 463);
}

function update() {
  if (gameState.isPaused) return;
  if (gameState.screen === "PLAYING") {
    updateRoad(gameState.speed, canvas.height);
    spawnTraffic(canvas);
    updateTraffic(gameState.speed, canvas.height);
    increaseScore();
    checkAllEnemies(trafficVehicles, player);
    checkOpponentCollision();
    sendPositionToServer();
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ── Keyboard ──
document.addEventListener("keydown", function (e) {
  if (gameState.screen !== "PLAYING") return;
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
    player.x -= player.speed;
    if (player.x < 100) player.x = 100;
  }
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    player.x += player.speed;
    if (player.x > 220) player.x = 220;
  }
});

// ── Click ──
canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  if (gameState.screen === "MENU") {
    // PLAY button
    if (clickX > 130 && clickX < 270 && clickY > 430 && clickY < 480) {
      gameState.screen = "PLAYING";
    }
    // MULTIPLAYER button
    if (clickX > 130 && clickX < 270 && clickY > 495 && clickY < 540) {
      connectToServer();
      gameState.screen = "PLAYING";
    }
  }

  if (gameState.screen === "GAMEOVER") {
    if (
      clickX > 80 &&
      clickX < canvas.width - 80 &&
      clickY > 370 &&
      clickY < 420
    ) {
      gameState.speed = 3;
      gameState.score = 0;
      gameState.isOver = false;
      player.x = 175;
      player.y = 550;
      resetRoad();
      gameState.screen = "PLAYING";
    }
    if (
      clickX > 80 &&
      clickX < canvas.width - 80 &&
      clickY > 435 &&
      clickY < 480
    ) {
      gameState.speed = 3;
      gameState.score = 0;
      gameState.isOver = false;
      player.x = 175;
      player.y = 550;
      resetRoad();
      gameState.screen = "MENU";
    }
  }

  if (gameState.screen === "PLAYING") {
    if (
      clickX > canvas.width / 2 - 20 &&
      clickX < canvas.width / 2 + 20 &&
      clickY > 5 &&
      clickY < 27
    ) {
      gameState.isPaused = !gameState.isPaused;
    }
  }
});

// ── Touch ──
canvas.addEventListener(
  "touchstart",
  function (e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touchX = (e.touches[0].clientX - rect.left) * scaleX;
    const touchY = (e.touches[0].clientY - rect.top) * scaleY;

    if (gameState.screen === "MENU") {
      if (touchX > 130 && touchX < 270 && touchY > 430 && touchY < 480) {
        gameState.screen = "PLAYING";
      }
      if (touchX > 130 && touchX < 270 && touchY > 495 && touchY < 540) {
        connectToServer();
        gameState.screen = "PLAYING";
      }
    }

    if (gameState.screen === "PLAYING") {
      if (
        touchX > canvas.width / 2 - 20 &&
        touchX < canvas.width / 2 + 20 &&
        touchY > 5 &&
        touchY < 27
      ) {
        gameState.isPaused = !gameState.isPaused;
        return;
      }
      if (touchX < canvas.width / 2) {
        player.x -= player.speed * 3;
        if (player.x < 100) player.x = 100;
      } else {
        player.x += player.speed * 3;
        if (player.x > 220) player.x = 220;
      }
    }

    if (gameState.screen === "GAMEOVER") {
      if (
        touchX > 80 &&
        touchX < canvas.width - 80 &&
        touchY > 370 &&
        touchY < 420
      ) {
        gameState.speed = 3;
        gameState.score = 0;
        gameState.isOver = false;
        player.x = 175;
        player.y = 550;
        resetRoad();
        gameState.screen = "PLAYING";
      }
      if (
        touchX > 80 &&
        touchX < canvas.width - 80 &&
        touchY > 435 &&
        touchY < 480
      ) {
        gameState.speed = 3;
        gameState.score = 0;
        gameState.isOver = false;
        player.x = 175;
        player.y = 550;
        resetRoad();
        gameState.screen = "MENU";
      }
    }
  },
  { passive: false },
);

// ── Multiplayer ──
function connectToServer() {
  socket = new WebSocket("wss://carcrashproject-production.up.railway.app");

  socket.onopen = function () {
    console.log("Connected to server!");
    isMultiplayer = true;
  };
  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);

    if (data.type === "connected") {
      myPlayerId = data.id;
      if (data.id === "player1") {
        player.x = 230;
      } else if (data.id === "player2") {
        player.x = 120;
      }
    }

    if (data.type === "opponentMove") {
      opponentPlayer = { x: data.x, y: data.y, score: data.score };
    }

    if (data.type === "opponentGameOver") {
      opponentPlayer = null;
      isMultiplayer = false;
      console.log("Opponent lost!");
    }

    if (data.type === "playerCount") {
      console.log("Players: " + data.count);
    }
  };

  socket.onclose = function () {
    isMultiplayer = false;
    opponentPlayer = null;
    console.log("Disconnected from server");
  };
}

function sendPositionToServer() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "move",
        x: player.x,
        y: player.y,
        score: gameState.score,
      }),
    );
  }
}

// ── Start ──
loadBestScore();
loadAssets();
// This says: "Wait until BOTH images finish loading, THEN start the game loop." This is why the game works on Netlify — images load from internet so they need time.
Promise.all([
  new Promise((resolve) => {
    assets.playerCar.onload = resolve;
  }),
  new Promise((resolve) => {
    assets.enemyCar.onload = resolve;
  }),
]).then(() => {
  gameLoop();
});
