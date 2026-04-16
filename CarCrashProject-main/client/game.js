// 1. Import Rawan's road functions
import { drawRoad, updateRoad } from "./road.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let speed = 5;

function gameLoop() {
  // 2. Call Rawan's road logic
  updateRoad(speed, canvas.height); // Update the position
  drawRoad(ctx, canvas); // Draw the environment

  // 3. Keep the loop running
  requestAnimationFrame(gameLoop);
}

// 4. Start the game
gameLoop();
// Rawan's UI Logic: Restarting the Game
const restartBtn = document.getElementById("restart-button");
const gameOverScreen = document.getElementById("game-over-screen");
const playScreen = document.getElementById("start-screen");

restartBtn.addEventListener("click", () => {
  // 1. Reset the road data (from road.js)
  import("./road.js").then((module) => module.resetRoad());

  // 2. Hide Game Over, Show Menu (or start play immediately)
  gameOverScreen.style.display = "none";
  playScreen.style.display = "block";

  // 3. Reset Score (Manar's area, but good for UI to know)
  document.getElementById("final-score-display").innerText = "0";
});

const gameState = {
  screen: "MENU", // Transitions: MENU, PLAYING, GAMEOVER
  speed: 3, // Initial scroll speed
  score: 0, // Current session score
  bestScore: 0, // From localStorage
  isPaused: false, // Toggle for pause functionality
};
const assets = {};
function loadAssets() {
  assets.playerCar = new Image();
  assets.playerCar.src = "../assets/player_car.png"; // Path to Hala's file

  assets.road = new Image();
  assets.road.src = "../assets/road_tile.png"; // Path to Hala's file
}
// Testing the server connection , we will remove it
const testConnection = new WebSocket("ws://localhost:8080");

testConnection.onopen = () => {
  console.log("SUCCESS: The game is connected to Noor's server!");
};

testConnection.onerror = (error) => {
  console.error("FAILURE: Could not connect to the server. Is it running?");
};
