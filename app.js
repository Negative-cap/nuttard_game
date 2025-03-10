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

let gameInterval = null

let scoreKillArrayFromLocalStorage = JSON.parse(localStorage.getItem("scoreKillArray"))

if (scoreKillArrayFromLocalStorage) {
    scoreKillArray = scoreKillArrayFromLocalStorage
    highestScoreEl.textContent = Math.max.apply(null, scoreKillArray)
}


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

pauseGameBtn.addEventListener("click", pauseGame);

createEnemies()

let enemies = document.querySelectorAll(".enemy")

function createEnemies() {
    for (let i = 0; i < 10; i++) {
        let enemy = document.createElement("div");
        enemy.classList.add("enemy");
        enemy.addEventListener("click", function () {
            shootEnemy(enemy);
        }); 
        gameFrame.appendChild(enemy);
    }
}

function shootEnemy(enemy) {
    if (!enemy.classList.contains('dead')) {
        updateKills(score + 1);
        enemy.classList.add('dead');
        enemyDiesAudio.play()
        setTimeout(() => {
            enemy.classList.remove("dead");
        }, 1100);
    }
}

function enemyShootsMe(enemy) {
    if (isPaused) return;

    enemy.classList.add("shoot");
    let shotSound = new Audio('enemygun.mp3'); 
    shotSound.play();
    updateHealth(healthPoints - 10);

    let gameFrame = document.getElementById("gameFrame");
    gameFrame.classList.add("hit-effect");

    setTimeout(() => {
        gameFrame.classList.remove("hit-effect");
    }, 200);

    setTimeout(() => {
        enemy.classList.remove("shoot");
    }, 200);
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
    score = kills
    killsElem = document.getElementById("score")
    bigScore = document.getElementById("bigScore")

    killsElem.textContent = score
    bigScore.textContent = score
}

function startGame() {
    enemyGunshot.play(); 
    enemyGunshot.pause(); 
    enemyGunshot.currentTime = 0; 

    if (gameActive) return;

    gameActive = true;
    isPaused = false;

    pauseGameBtn.disabled = false;

    backgroundAudio.loop = true;
    backgroundAudio.play(); 

    enemyRevealTime = 1000;
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].classList.remove("dead");
    }

    gameInterval = setTimeout(() => {
        revealEnemies(enemies[Math.floor(Math.random() * enemies.length)]);
    }, 1500);

    gameOverEl.classList.add("shrink");
    updateKills(0);
    updateHealth(100);
    highestScoreEl.textContent = Math.max.apply(null, scoreKillArray);
}

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

function resumeGame() {
    gameInterval = setTimeout(() => {
        revealEnemies(enemies[Math.floor(Math.random() * enemies.length)]);
    }, enemyRevealTime);
}

function revealEnemies(enemy) {
    if (healthPoints > 0 && !isPaused) {
        enemy.classList.add("show");

        let shootTimeout = setTimeout(() => {
            if (!enemy.classList.contains("dead") && enemy.classList.contains("show") && !isPaused) {
                enemyShootsMe(enemy);
            }
        }, 800);
        activeTimeouts.push(shootTimeout); 

        let removeTimeout = setTimeout(() => {
            enemy.classList.remove("show");
            if (!isPaused) {
                gameInterval = setTimeout(() => {
                    revealEnemies(enemies[Math.floor(Math.random() * enemies.length)]);
                }, enemyRevealTime);
            }
        }, 1200);
        activeTimeouts.push(removeTimeout);
    }
}

startGameBtnEl.addEventListener("click", startGame)
document.addEventListener("keydown", function(event) {
    if (event.code === "Space") {
        pauseGame()
    }
});