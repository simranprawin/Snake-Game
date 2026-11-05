
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const bestDisplay = document.getElementById("bestScore");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const statusText = document.getElementById("status");

const box = 20;
const tileCount = canvas.width / box;

let snake;
let food;
let direction;
let nextDirection;

let score = 0;
let bestScore = Number(localStorage.getItem("snakeBest")) || 0;

let gameLoop = null;
let gameRunning = false;
let gamePaused = false;

bestDisplay.textContent = bestScore;

function drawBoard() {
    ctx.fillStyle = "#172d24";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#294536";
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= canvas.width; i += box) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

function createFood() {
    let newFood;

    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (
        snake.some(part =>
            part.x === newFood.x && part.y === newFood.y
        )
    );

    return newFood;
}

function drawFood() {
    const x = food.x * box;
    const y = food.y * box;

    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.arc(x + 10, y + 11, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#70db70";
    ctx.fillRect(x + 10, y + 1, 3, 6);
}

function drawSnake() {
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#8cff66" : "#39b54a";

        ctx.fillRect(
            part.x * box + 1,
            part.y * box + 1,
            box - 2,
            box - 2
        );

        if (index === 0) {
            ctx.fillStyle = "#173d20";

            ctx.fillRect(part.x * box + 5, part.y * box + 5, 3, 3);
            ctx.fillRect(part.x * box + 12, part.y * box + 5, 3, 3);
        }
    });
}

function drawGame() {
    drawBoard();
    drawFood();
    drawSnake();
}

function startGame() {
    clearInterval(gameLoop);

    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = "right";
    nextDirection = "right";

    score = 0;
    scoreDisplay.textContent = score;

    food = createFood();

    gameRunning = true;
    gamePaused = false;

    overlay.style.display = "none";
    pauseBtn.textContent = "⏸ PAUSE";
    statusText.textContent = "Game running! Good luck!";

    drawGame();

    gameLoop = setInterval(updateGame, 130);
}

function updateGame() {
    direction = nextDirection;

    const head = { ...snake[0] };

    if (direction === "up") head.y--;
    if (direction === "down") head.y++;
    if (direction === "left") head.x--;
    if (direction === "right") head.x++;

    const eating = head.x === food.x && head.y === food.y;

    // Check wall collision
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= tileCount ||
        head.y >= tileCount
    ) {
        endGame();
        return;
    }

    // Check self collision
    const bodyToCheck = eating ? snake : snake.slice(0, -1);

    if (bodyToCheck.some(part =>
        part.x === head.x && part.y === head.y
    )) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (eating) {
        score += 10;
        scoreDisplay.textContent = score;

        if (score > bestScore) {
            bestScore = score;
            bestDisplay.textContent = bestScore;
            localStorage.setItem("snakeBest", bestScore);
        }

        food = createFood();
    } else {
        snake.pop();
    }

    drawGame();
}

function endGame() {
    clearInterval(gameLoop);

    gameRunning = false;
    gamePaused = false;

    overlay.style.display = "flex";
    overlayTitle.textContent = "💀 Game Over!";
    overlayText.textContent = "Your final score: " + score;

    startBtn.textContent = "PLAY AGAIN";
    pauseBtn.textContent = "⏸ PAUSE";
    statusText.textContent = "Game over! Try again.";
}

function togglePause() {
    if (!gameRunning) return;

    if (!gamePaused) {
        clearInterval(gameLoop);
        gamePaused = true;

        overlay.style.display = "flex";
        overlayTitle.textContent = "⏸ Game Paused";
        overlayText.textContent = "Take a little break!";
        startBtn.textContent = "RESUME";
        pauseBtn.textContent = "▶ RESUME";

        statusText.textContent = "Game paused";
    } else {
        gamePaused = false;

        overlay.style.display = "none";
        pauseBtn.textContent = "⏸ PAUSE";

        statusText.textContent = "Game running!";

        gameLoop = setInterval(updateGame, 130);
    }
}

function changeDirection(newDirection) {
    if (!gameRunning || gamePaused) return;

    const opposite = {
        up: "down",
        down: "up",
        left: "right",
        right: "left"
    };

    if (newDirection !== opposite[direction]) {
        nextDirection = newDirection;
    }
}

// Keyboard controls
document.addEventListener("keydown", (event) => {
    const keys = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right"
    };

    const newDirection = keys[event.key] ||
        keys[event.key.toLowerCase()];

    if (newDirection) {
        event.preventDefault();
        changeDirection(newDirection);
    }

    if (event.code === "Space") {
        event.preventDefault();
        togglePause();
    }
});

// Mobile buttons
document.querySelectorAll(".control").forEach(button => {
    button.addEventListener("click", () => {
        changeDirection(button.dataset.direction);
    });
});

startBtn.addEventListener("click", () => {
    if (gamePaused) {
        togglePause();
    } else {
        startGame();
    }
});

pauseBtn.addEventListener("click", togglePause);

restartBtn.addEventListener("click", startGame);

// Initial screen
drawBoard();
