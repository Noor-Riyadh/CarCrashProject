// Rawan - Scrolling Road and Traffic Spawner

// 1. Position and Traffic Variables
let roadY = 0;
let trafficVehicles = []; // This will hold enemy cars
let spawnTimer = 0; // This will time the car appearances

/**
 * drawRoad: Draws the sand background and the scrolling road on top
 */
export function drawRoad(ctx, canvas) {
  const sandColor = "#F2D16B";
  const roadColor = "#333333";
  const roadWidth = 320;
  const roadX = (canvas.width - roadWidth) / 2;

  // A. Draw Sand (Base)
  ctx.fillStyle = sandColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // B. Draw Road
  ctx.fillStyle = roadColor;
  ctx.fillRect(roadX, 0, roadWidth, canvas.height);

  // C. Draw Scrolling Lane Lines
  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  ctx.setLineDash([30, 30]);
  ctx.lineDashOffset = -roadY;

  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
}

/**
 * updateRoad: Calculates movement
 */
export function updateRoad(speed, canvasHeight) {
  roadY += speed;
  if (roadY >= canvasHeight) {
    roadY = 0;
  }
}

/**
 * spawnTraffic: Creates new enemy cars
 */
export function spawnTraffic(canvas) {
  spawnTimer++;

  // Every 90 frames (~1.5 seconds), create a car
  if (spawnTimer >= 90) {
    const lanes = [60, 160, 260];
    const randomX = lanes[Math.floor(Math.random() * lanes.length)];

    trafficVehicles.push({
      x: randomX,
      y: -100,
      width: 50,
      height: 100,
    });
    spawnTimer = 0;
  }
}

/**
 * drawTraffic: Draws the enemy cars
 */
export function drawTraffic(ctx) {
  ctx.fillStyle = "#ff4757"; // Red cars
  trafficVehicles.forEach((car) => {
    ctx.fillRect(car.x, car.y, car.width, car.height);
  });
}

/**
 * updateTraffic: Moves cars down and removes them when off-screen
 */
export function updateTraffic(speed, canvasHeight) {
  for (let i = trafficVehicles.length - 1; i >= 0; i--) {
    trafficVehicles[i].y += speed;

    if (trafficVehicles[i].y > canvasHeight) {
      trafficVehicles.splice(i, 1);
    }
  }
}
/**
 * resetRoad: Clears all traffic and resets the timer for a new game
 */
export function resetRoad() {
  trafficVehicles = [];
  spawnTimer = 0;
  roadY = 0;
}
