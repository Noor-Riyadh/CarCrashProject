import {
  drawRoad,
  updateRoad,
  spawnTraffic,
  drawTraffic,
  updateTraffic,
  resetRoad,
  trafficVehicles
} from "./road.js";

const gameState = {
  screen: "MENU", 
  speed: 3,
  score: 0, 
  bestScore: 0, 
  isPaused: false, 
  isOver: false
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
  assets.playerCar.src = "./assets/player_car.png";

  assets.enemyCar = new Image();
  assets.enemyCar.src = "./assets/enemy_car.png";
}


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");



function increaseScore() {
  gameState.score += Math.floor(gameState.speed * 0.5);
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
  return (
    player.x < enemy.x + enemy.width &&
    player.x + player.width > enemy.x &&
    player.y < enemy.y + enemy.height &&
    player.y + player.height > enemy.y
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

//this for end the game 
function handleGameOver() {
  if (!gameState.isOver) {
    gameState.isOver = true;
    gameState.screen = "GAMEOVER";
    saveBestScore();
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
}

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

  ctx.fillStyle = "#2E75B6";
  ctx.fillRect(130, 320, 140, 45);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 18px Arial";
  ctx.fillText("RESTART", canvas.width / 2, 350);
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
  }
}


function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}


document.addEventListener("keydown", function (e) {
  if (gameState.screen !== "PLAYING") return;

  if (e.key === "ArrowLeft") {
    player.x -= player.speed;
    if (player.x <100)player.x = 100;
  }
  if (e.key === "ArrowRight") {
    player.x += player.speed;
    if (player.x > 220) player.x = 220; 
  }
});


canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  if (gameState.screen === "MENU") {
    if (clickX > 150 && clickX < 250 && clickY > 480 && clickY < 525) {
      gameState.screen = "PLAYING";
    }
  }

  if (gameState.screen === "GAMEOVER") {
    if (clickX > 130 && clickX < 270 && clickY > 320 && clickY < 365) {
      gameState.score = 0;
      player.x = 175;
      player.y = 550;
      resetRoad();
      // gameState.screen = "PLAYING";
      gameState.isOver = false;

      gameState.screen = "PLAYING";

    }
  }
});


loadBestScore();
loadAssets();
gameLoop();
