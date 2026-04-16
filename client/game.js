// ==============================
// GAME STATE
// ==============================
const gameState = {
  screen: "MENU", // MENU, PLAYING, GAMEOVER
  speed: 3, // road scroll speed
  score: 0, // current score
  bestScore: 0, // best score from localStorage
  isPaused: false, // pause toggle
};

// ==============================
// PLAYER CAR
// ==============================
const player = {
  x: 175, // starting x position (center lane)
  y: 550, // starting y position (bottom area)
  width: 50,
  height: 100,
  speed: 5, // how fast player moves left/right
};

// ==============================
// ASSETS (images)
// ==============================
const assets = {};

function loadAssets() {
  assets.playerCar = new Image();
  assets.playerCar.src = "../assets/player_car.png";

  assets.enemyCar = new Image();
  assets.enemyCar.src = "../assets/enemy_car.png";
}

// ==============================
// CANVAS SETUP
// ==============================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ==============================
// LOAD BEST SCORE
// ==============================
function loadBestScore() {
  gameState.bestScore = parseInt(localStorage.getItem("bestScore")) || 0;
}

// ==============================
// DRAW FUNCTION (what you see)
// ==============================
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

// ==============================
// DRAW MENU SCREEN
// ==============================
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

  // Draw player car in menu
  ctx.drawImage(assets.playerCar, 175, 350, 50, 100);

  // PLAY button
  ctx.fillStyle = "#2E75B6";
  ctx.fillRect(150, 480, 100, 45);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 20px Arial";
  ctx.fillText("PLAY", canvas.width / 2, 510);
}

// ==============================
// DRAW GAME SCREEN
// ==============================
function drawGame() {
  // Draw player car (red box for now)
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw HUD
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, 30);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.fillText("SCORE: " + gameState.score, 10, 20);

  ctx.fillStyle = "#FFD700";
  ctx.textAlign = "right";
  ctx.fillText("BEST: " + gameState.bestScore, canvas.width - 10, 20);
}

// ==============================
// DRAW GAME OVER SCREEN
// ==============================
function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#FF3333";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, 150);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "28px Arial";
  ctx.fillText("SCORE: " + gameState.score, canvas.width / 2, 230);

  ctx.fillStyle = "#FFD700";
  ctx.font = "22px Arial";
  ctx.fillText("BEST: " + gameState.bestScore, canvas.width / 2, 275);

  // RESTART button
  ctx.fillStyle = "#2E75B6";
  ctx.fillRect(130, 320, 140, 45);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 18px Arial";
  ctx.fillText("RESTART", canvas.width / 2, 350);
}

// ==============================
// UPDATE FUNCTION (game logic)
// ==============================
function update() {
  if (gameState.isPaused) return;

  if (gameState.screen === "PLAYING") {
    gameState.score += 1;
  }
}

// ==============================
// MAIN GAME LOOP
// ==============================
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ==============================
// KEYBOARD CONTROLS
// ==============================
document.addEventListener("keydown", function (e) {
  if (gameState.screen !== "PLAYING") return;

  if (e.key === "ArrowLeft") {
    player.x -= player.speed;
    if (player.x < 80) player.x = 80; // left boundary
  }
  if (e.key === "ArrowRight") {
    player.x += player.speed;
    if (player.x > 300) player.x = 300; // right boundary
  }
});

// ==============================
// MOUSE CLICK (for buttons)
// ==============================
canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // PLAY button click
  if (gameState.screen === "MENU") {
    if (clickX > 150 && clickX < 250 && clickY > 480 && clickY < 525) {
      gameState.screen = "PLAYING";
    }
  }

  // RESTART button click
  if (gameState.screen === "GAMEOVER") {
    if (clickX > 130 && clickX < 270 && clickY > 320 && clickY < 365) {
      gameState.score = 0;
      player.x = 175;
      player.y = 550;
      gameState.screen = "PLAYING";
    }
  }
});

// ==============================
// START THE GAME
// ==============================
loadBestScore();
loadAssets();
gameLoop();
