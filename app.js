let gameFrame = document.getElementById("gameFrame")
let startGameBtnEl = document.getElementById("startGameBtnEl")
let healthBar = document.getElementById("healthBar")
let gameOverEl = document.getElementById("gameOver")

let highestScoreEl = document.getElementById("highestScore")
let scoreKillArray = []

let enemyGunshot = new Audio('enemygun.mp3')
let backgroundAudio = new Audio("videoplayback.weba")
let enemyDiesAudio = new Audio("enemydies.mp3")

let killsElem
let bigScore

let healthPoints = 100
let score = 0
let enemyRevealTime = 1000

let pauseGameBtn = document.getElementById("pauseGameBtn")
let isPaused = false
let gameActive = false
let activeTimeouts = []; 

let alivePic = "./Untitled293_20250309155121-removebg-preview.png"
let shootPic = "./Untitled293_20250309151742-removebg-preview.png"
let deadPic = "./Untitled293_20250309154812-removebg-preview.png"

let gameInterval = null

let scoreKillArrayFromLocalStorage = JSON.parse(localStorage.getItem("scoreKillArray"))

if (scoreKillArrayFromLocalStorage) {
    scoreKillArray = scoreKillArrayFromLocalStorage
    highestScoreEl.textContent = Math.max.apply(null, scoreKillArray)
}

createEnemies()

let enemies = document.querySelectorAll(".enemy")

function createEnemies() {
    let enemyCount = window.innerWidth > 900 ? 10 : 5
    // for (let i = 0; i < enemyCount; i++) {
    //     let enemy = document.createElement("img")
    //     enemy.src = alivePic
    //     enemy.classList.add("enemy");
    //     enemy.addEventListener("click", function () {
    //         shootEnemy(enemy);
    //     }); 
    //     gameFrame.appendChild(enemy);
    // }

    let gameFrameWidth = gameFrame.clientWidth; // Get total game width
    let enemyWidth = gameFrameWidth / enemyCount; // Calculate width per enemy

    for (let i = 0; i < enemyCount; i++) {
        let enemy = document.createElement("img");
        enemy.src = alivePic;
        enemy.classList.add("enemy");

        // Evenly space enemies across the gameFrame
        enemy.style.left = `${i * enemyWidth}px`;

        enemy.addEventListener("click", function () {
            shootEnemy(enemy);
        });

        gameFrame.appendChild(enemy);
    }
}

function shootEnemy(enemy) {
    if (!enemy.classList.contains("dead")) { 
        updateKills(score + 1);
        enemy.classList.add("dead");
        enemy.src = deadPic;
        enemyDiesAudio.play();

        enemy.style.pointerEvents = "none"; 

        setTimeout(() => {
            enemy.classList.remove("dead"); 
            enemy.src = alivePic;
        }, 2000);
    }
}


function enemyShootsMe(enemy) {
    if (isPaused || enemy.classList.contains("dead") || !enemy.classList.contains("show")) return; 

    enemy.classList.add("shoot");
    enemy.src = shootPic;
    let shotSound = new Audio("enemygun.mp3");
    shotSound.play();
    updateHealth(healthPoints - 10);

    let gameFrame = document.getElementById("gameFrame");
    gameFrame.classList.add("hit-effect");

    setTimeout(() => {
        gameFrame.classList.remove("hit-effect");
    }, 200);

    setTimeout(() => {
        enemy.classList.remove("shoot");

        if (!enemy.classList.contains("dead")) {
            enemy.src = alivePic;
        }
    }, 300);
}





function updateHealth(points) {
    healthPoints = points
    let healthBar = document.getElementById("healthBar")

    healthBar.style.width = points + "%"

    if (healthPoints < 1) {
        endGame()
    }
}

function updateKills(kills) {
    score = kills;
    killsElem = document.getElementById("score");
    bigScore = document.getElementById("bigScore");

    killsElem.textContent = score;
    bigScore.textContent = score;

    
    if (score % 5 === 0 && score > 0) {
        enemyRevealTime -= 100; 
        
        if (enemyRevealTime < 400) { 
            enemyRevealTime = 400;
        }
        console.log(`New enemy speed: ${enemyRevealTime}ms`);
    }
}




// Function to start Game
function startGame() {
    if (gameActive) return; 

    gameActive = true;
    isPaused = false;
    pauseGameBtn.disabled = false;

    backgroundAudio.loop = true;
    backgroundAudio.play(); 

    enemyRevealTime = 1000;
    
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].classList.remove("dead");
        enemies[i].src = alivePic;
        enemies[i].style.pointerEvents = "auto";
    }

    gameOverEl.classList.add("shrink");
    updateKills(0);
    updateHealth(100);
    highestScoreEl.textContent = Math.max.apply(null, scoreKillArray);

    // ✅ Faster first enemy reveal
    setTimeout(() => {
        revealEnemies(enemies[Math.floor(Math.random() * enemies.length)]);
    }, 500); 
}




// Function to end Game when player HP is drained
function endGame() {

    if (!gameActive) return; 

    gameActive = false; 
    clearTimeout(gameInterval);

    backgroundAudio.pause();
    backgroundAudio.currentTime = 0;

    gameOverEl.classList.remove("shrink");

    bigScore = document.getElementById("bigScore");
    bigScore.textContent = killsElem.textContent;

    scoreKillArray.push(killsElem.textContent);
    localStorage.setItem("scoreKillArray", JSON.stringify(scoreKillArray));
    highestScoreEl.textContent = Math.max.apply(null, scoreKillArray);

    pauseGameBtn.disabled = true;
}

// Function to Pause Game
function pauseGame() {
    if (!gameActive) return;

    if (!isPaused) {
        clearTimeout(gameInterval);
        backgroundAudio.pause();
        isPaused = true;
        pauseGameBtn.innerHTML = `<span class="material-symbols-outlined">play_circle</span>`
    } else {
        isPaused = false;
        backgroundAudio.play();
        pauseGameBtn.innerHTML = `<span class="material-symbols-outlined">pause_circle</span>`;
        resumeGame();
    }
}

// Function to resume Game when paused 
function resumeGame() {
    gameInterval = setTimeout(() => {
        revealEnemies(enemies[Math.floor(Math.random() * enemies.length)]);
    }, enemyRevealTime);
}

// Funtion to make enemies pop out
function revealEnemies() {
    if (healthPoints > 0 && !isPaused) {
        let aliveEnemies = Array.from(enemies).filter(enemy => !enemy.classList.contains("dead") && !enemy.classList.contains("show"));

        if (aliveEnemies.length === 0) return

        let enemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        enemy.classList.add("show");

        enemy.src = alivePic;
        enemy.style.pointerEvents = "auto"; 

        let shootDelay = window.innerWidth > 900 ? 800 : 600; 
        let disappearDelay = 1000; 

        let shootTimeout = setTimeout(() => {
            if (!enemy.classList.contains("dead") && enemy.classList.contains("show") && !isPaused) {
                enemyShootsMe(enemy);
            }
        }, shootDelay);
        activeTimeouts.push(shootTimeout);

        let removeTimeout = setTimeout(() => {
            enemy.classList.remove("show");

            if (!isPaused && gameActive) {
                revealEnemies(); 
            }
        }, disappearDelay);
        activeTimeouts.push(removeTimeout);
    }
}





// Start Game EventListener
startGameBtnEl.addEventListener("click", startGame)

// Pause/Play EventListener "SpaceBar"
document.addEventListener("keydown", function(event) {
    if (event.code === "Space") {
        pauseGame()
    }
});

pauseGameBtn.addEventListener("click", pauseGame);