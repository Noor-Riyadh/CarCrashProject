// Manar - Collision Detection and Score System

//first part for collosion 
function checkCollision(player, enemy) {
    return player.x < enemy.x + enemy.width &&
           player.x + player.width > enemy.x &&
           player.y < enemy.y + enemy.height &&
           player.y + player.height > enemy.y;
}
//if the car mave more than one collision okay 
function checkAllEnemies(enemies, player) {
    for (let i = 0; i < enemies.length; i++) {
        if (checkCollision(player, enemies[i])) {
            handleGameOver();
            break;  
        }
    }
}
//now this for game over from one collision

function handleGameOver() {
    if (!gameState.isOver) {
        gameState.isOver = true;
        gameState.screen = "GAMEOVER";
        console.log("Game Over!"); 
    }
}

//to show final score 

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
    let savedScore = localStorage.getItem("bestScore");
    if (savedScore) {
        gameState.bestScore = parseInt(savedScore);
    } else {
        gameState.bestScore = 0;
    }
}

 
