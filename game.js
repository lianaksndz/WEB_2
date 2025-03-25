let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let startButton = document.getElementById('startButton');
let endButton = document.getElementById('endButton');
let scoreDisplay = document.getElementById('score');
let resultDisplay = document.getElementById('result');
let moveLeftButton = document.getElementById('moveLeft');
let moveRightButton = document.getElementById('moveRight');

let catImage = new Image();
catImage.src = 'tom.png'; // Зображення персонажа

let cheeseImage = new Image();
cheeseImage.src = 'chees.png'; // Зображення перешкод

let player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 15
};

let obstacles = [];
let score = 0;
let gameInterval;
let isGameRunning = false;

// Функція для створення перешкод
function createObstacle() {
    let x = Math.random() * (canvas.width - 50);
    let speed = Math.random() * 3 + 2;
    obstacles.push({ x, y: -50, width: 50, height: 50, speed });
}

// Оновлення гри
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Малюємо персонажа
    ctx.drawImage(catImage, player.x, player.y, player.width, player.height);

    // Малюємо перешкоди (сир)
    obstacles.forEach(obstacle => {
        ctx.drawImage(cheeseImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        obstacle.y += obstacle.speed;

        if (obstacle.y > canvas.height) {
            score++;
            obstacles.splice(obstacles.indexOf(obstacle), 1);
        }

        // Перевірка зіткнення
        if (obstacle.y + obstacle.height > player.y &&
            obstacle.x < player.x + player.width &&
            obstacle.x + obstacle.width > player.x) {
            endGame();
        }
    });

    scoreDisplay.textContent = score;
}

// Початок гри
function startGame() {
    score = 0;
    obstacles = [];
    gameInterval = setInterval(updateGame, 1000 / 60);
    setInterval(createObstacle, 2000);
    isGameRunning = true;
    startButton.style.display = 'none';
    endButton.style.display = 'inline-block';
}

// Завершення гри
function endGame() {
    clearInterval(gameInterval);
    isGameRunning = false;
    startButton.style.display = 'inline-block';
    endButton.style.display = 'none';
    resultDisplay.textContent = `Гра завершена! Ваш рахунок: ${score}`;
    saveResult();
}

// Збереження результатів через сервер
async function saveResult() {
    const result = {
        name: prompt("Введіть ваше ім'я:") || 'Анонім',
        date: new Date().toISOString().split('T')[0],
        score: score
    };

    try {
        const response = await fetch('http://localhost:3000/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
        });
        console.log("✅ Результат збережено!", await response.json());
    } catch (error) {
        console.error("🚨 Помилка збереження:", error);
    }
}

// Управління з клавіатури
document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;
    if (e.key === 'ArrowLeft' && player.x > 0) player.x -= player.speed;
    if (e.key === 'ArrowRight' && player.x < canvas.width - player.width) player.x += player.speed;
});

// Кнопки на екрані
moveLeftButton.addEventListener('click', () => {
    if (player.x > 0) player.x -= player.speed;
});

moveRightButton.addEventListener('click', () => {
    if (player.x < canvas.width - player.width) player.x += player.speed;
});

// Початок гри
startButton.addEventListener('click', startGame);
endButton.addEventListener('click', endGame);


// Додаємо нові перешкоди кожні 2 секунди
setInterval(createObstacle, 2000);
