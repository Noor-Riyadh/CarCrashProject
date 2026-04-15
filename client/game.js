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
