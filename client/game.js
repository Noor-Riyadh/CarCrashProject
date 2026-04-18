// Multiplayer
let socket = null;
let opponentPlayer = null;
let myPlayerId = null;
let isMultiplayer = false;

import {
  drawRoad,
  updateRoad,
  spawnTraffic,
  drawTraffic,
  updateTraffic,
  resetRoad,
  trafficVehicles,
} from "./road.js";

const gameState = {
  screen: "MENU",
  speed: 3,
  score: 0,
  bestScore: 0,
  isPaused: false,
  isOver: false,
};

const player = {
  x: 175,
  y: 550,
  width: 50,
  height: 100,
  speed: 5,
};

const assets = {};

function loadAssets() {
  assets.playerCar = new Image();
  assets.playerCar.src = "../assets/player_car.png";

  assets.enemyCar = new Image();
  assets.enemyCar.src = "../assets/enemy_car.png";
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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

    // Tell opponent you lost
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "gameOver",
        }),
      );
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState.screen === "MENU") {
    drawMenu();
  }

  if (gameState.screen === "PLAYING") {
    drawGame();
  }

  if (gameState.screen === "GAMEOVER") {
    drawGameOver();
  }
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

  ctx.drawImage(assets.playerCar, 175, 350, 50, 100);

  ctx.fillStyle = "#2E75B6";
  ctx.fillRect(150, 480, 100, 45);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 20px Arial";
  ctx.fillText("PLAY", canvas.width / 2, 510);

  // MULTIPLAYER button
  ctx.fillStyle = "#1E6B3C";
  ctx.beginPath();
  ctx.roundRect(130, 545, 140, 45, 10);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 16px Arial";
  ctx.fillText("MULTIPLAYER", canvas.width / 2, 573);
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

  // Draw opponent car if in multiplayer
  if (isMultiplayer && opponentPlayer) {
    // Draw opponent in blue color
    ctx.globalAlpha = 0.8;
    ctx.drawImage(
      assets.enemyCar,
      opponentPlayer.x,
      opponentPlayer.y,
      player.width,
      player.height,
    );
    ctx.globalAlpha = 1.0;

    // Show opponent score
    ctx.fillStyle = "#00FF88";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "P2: " + (opponentPlayer.score || 0),
      opponentPlayer.x + 25,
      opponentPlayer.y - 5,
    );
  }
}

function drawGameOver() {
  // Dark overlay with road visible behind
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // GAME OVER title
  ctx.fillStyle = "#FF3333";
  ctx.font = "bold 52px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, 120);

  // Divider line
  ctx.fillStyle = "#444444";
  ctx.fillRect(60, 135, canvas.width - 120, 2);

  // YOUR SCORE card (dark box)
  ctx.fillStyle = "#1A1A1A";
  ctx.beginPath();
  ctx.roundRect(50, 150, canvas.width - 100, 100, 12);
  ctx.fill();

  // YOUR SCORE label
  ctx.fillStyle = "#AAAAAA";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("YOUR SCORE", canvas.width / 2, 180);

  // Score number
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 48px Arial";
  ctx.fillText(gameState.score, canvas.width / 2, 235);

  // NEW BEST badge (only show if score equals bestScore)
  if (gameState.score >= gameState.bestScore && gameState.score > 0) {
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 + 30, 240, 90, 24, 6);
    ctx.fill();
    ctx.fillStyle = "#333300";
    ctx.font = "bold 12px Arial";
    ctx.fillText("NEW BEST!", canvas.width / 2 + 75, 257);
  }

  // BEST SCORE card (dark box)
  ctx.fillStyle = "#1A1A1A";
  ctx.beginPath();
  ctx.roundRect(50, 270, canvas.width - 100, 70, 12);
  ctx.fill();

  // BEST SCORE label
  ctx.fillStyle = "#AAAAAA";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("BEST SCORE", canvas.width / 2, 295);

  // Best score number
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 28px Arial";
  ctx.fillText(gameState.bestScore, canvas.width / 2, 328);

  // RESTART button
  ctx.fillStyle = "#2E75B6";
  ctx.beginPath();
  ctx.roundRect(80, 370, canvas.width - 160, 50, 10);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 22px Arial";
  ctx.fillText("RESTART", canvas.width / 2, 403);

  // MAIN MENU button
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

    // gameState.score += 1; I think that we need to deleted

    // I'm  adding this for increase score
    increaseScore();
    checkAllEnemies(trafficVehicles, player);

    if (gameState.screen === "PLAYING") {
      updateRoad(gameState.speed, canvas.height);
      spawnTraffic(canvas);
      updateTraffic(gameState.speed, canvas.height);
      increaseScore();
      checkAllEnemies(trafficVehicles, player);
      sendPositionToServer(); // ← ADD THIS LINE
    }
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

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

canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // MENU screen - PLAY button
  if (gameState.screen === "MENU") {
    if (clickX > 150 && clickX < 250 && clickY > 480 && clickY < 525) {
      gameState.screen = "PLAYING";
    }
  }

  // GAMEOVER screen - RESTART and MAIN MENU buttons
  if (gameState.screen === "GAMEOVER") {
    // RESTART button
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

    // MAIN MENU button
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

  // Pause button click
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

  // MULTIPLAYER button
  if (clickX > 130 && clickX < 270 && clickY > 545 && clickY < 590) {
    connectToServer();
    gameState.screen = "PLAYING";
  }
});

// Touch tap for buttons (menu and game over)
canvas.addEventListener(
  "touchstart",
  function (e) {
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const touchX = (e.touches[0].clientX - rect.left) * scaleX;
    const touchY = (e.touches[0].clientY - rect.top) * scaleY;

    // MENU - PLAY button
    if (gameState.screen === "MENU") {
      if (touchX > 150 && touchX < 250 && touchY > 480 && touchY < 525) {
        gameState.screen = "PLAYING";
      }
    }

    // PLAYING - move car + pause button
    if (gameState.screen === "PLAYING") {
      // Pause button
      if (
        touchX > canvas.width / 2 - 20 &&
        touchX < canvas.width / 2 + 20 &&
        touchY > 5 &&
        touchY < 27
      ) {
        gameState.isPaused = !gameState.isPaused;
        return;
      }
      // Move car
      if (touchX < canvas.width / 2) {
        player.x -= player.speed * 3;
        if (player.x < 100) player.x = 100;
      } else {
        player.x += player.speed * 3;
        if (player.x > 220) player.x = 220;
      }
    }

    // GAMEOVER buttons
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

// Cross Playtorm
function connectToServer() {
  socket = new WebSocket("wss://YOUR-RAILWAY-URL.up.railway.app");

  socket.onopen = function () {
    console.log("Connected to server!");
    isMultiplayer = true;
  };

  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);

    if (data.type === "connected") {
      myPlayerId = data.id;
    }

    if (data.type === "opponentMove") {
      opponentPlayer = {
        x: data.x,
        y: data.y,
        score: data.score,
      };
    }

    // Opponent lost — remove them from screen
    if (data.type === "opponentGameOver") {
      opponentPlayer = null;
      console.log("Opponent lost! You keep playing!");
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
loadBestScore();
loadAssets();
gameLoop();
