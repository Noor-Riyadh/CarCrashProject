let roadY = 0;
let trafficVehicles = []; 
let spawnTimer = 0; 


export function drawRoad(ctx, canvas) {
  const sandColor = "#F2D16B";
  const roadColor = "#333333";
  const roadWidth = 320;
  const roadX = (canvas.width - roadWidth) / 2;

  ctx.fillStyle = sandColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = roadColor;
  ctx.fillRect(roadX, 0, roadWidth, canvas.height);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  ctx.setLineDash([30, 30]);
  ctx.lineDashOffset = -roadY;

  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
}


export function updateRoad(speed, canvasHeight) {
  roadY += speed;
  if (roadY >= canvasHeight) {
    roadY = 0;
  }
}

export function spawnTraffic(canvas) {
  spawnTimer++;

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

export function drawTraffic(ctx, enemyCarImage) {
    trafficVehicles.forEach((car) => {
        ctx.drawImage(enemyCarImage, car.x, car.y, car.width, car.height);
    });
}


export function updateTraffic(speed, canvasHeight) {
  for (let i = trafficVehicles.length - 1; i >= 0; i--) {
    trafficVehicles[i].y += speed;

    if (trafficVehicles[i].y > canvasHeight) {
      trafficVehicles.splice(i, 1);
    }
  }
}

export function resetRoad() {
  trafficVehicles = [];
  spawnTimer = 0;
  roadY = 0;
}
