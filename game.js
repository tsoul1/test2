document.addEventListener('DOMContentLoaded', () => {
    console.log("game.js loaded after DOM content");

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let isGameOver = false;
    let score = 0;
    let scoreTimer = 0;

    const playerImage = new Image();
    playerImage.src = 'https://opengameart.org/sites/default/files/styles/medium/public/ship_0.png';

    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height / 2 - 25,
        width: 50,
        height: 50,
        speed: 5,
        hp: 100,
        maxHp: 100
    };

    const keysPressed = {};

    document.addEventListener('keydown', (e) => {
        keysPressed[e.key] = true;
        if (isGameOver && e.key === 'r') {
            resetGame();
        }
    });

    document.addEventListener('keyup', (e) => {
        keysPressed[e.key] = false;
    });

    let enemies = [];
    const enemySpeed = 2;
    const spawnInterval = 1000;

    let bullets = [];
    const bulletSpeed = 7;
    const attackSpeed = 1000;

    function fireBullet() {
        if (isGameOver || enemies.length === 0) return;
        let nearestEnemy = null;
        let minDistance = Infinity;
        enemies.forEach(enemy => {
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        });

        if (nearestEnemy) {
            const dx = nearestEnemy.x + nearestEnemy.width / 2 - (player.x + player.width / 2);
            const dy = nearestEnemy.y + nearestEnemy.height / 2 - (player.y + player.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            const velocityX = (dx / distance) * bulletSpeed;
            const velocityY = (dy / distance) * bulletSpeed;
            bullets.push({
                x: player.x + player.width / 2 - 5,
                y: player.y + player.height / 2 - 5,
                width: 10,
                height: 10,
                color: 'yellow',
                velocityX,
                velocityY
            });
        }
    }

    let spawnTimer = setInterval(spawnEnemy, spawnInterval);
    let attackTimer = setInterval(fireBullet, attackSpeed);

    function spawnEnemy() {
        if (isGameOver) return;
        const size = 30;
        let x, y;
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) { x = Math.random() * canvas.width; y = 0 - size; }
        else if (edge === 1) { x = canvas.width; y = Math.random() * canvas.height; }
        else if (edge === 2) { x = Math.random() * canvas.width; y = canvas.height; }
        else { x = 0 - size; y = Math.random() * canvas.height; }
        enemies.push({ x, y, width: size, height: size, color: 'red', hp: 1 });
    }

    function resetGame() {
        isGameOver = false;
        player.hp = player.maxHp;
        score = 0;
        scoreTimer = 0;
        enemies = [];
        bullets = [];
        if (spawnTimer) clearInterval(spawnTimer);
        if (attackTimer) clearInterval(attackTimer);
        spawnTimer = setInterval(spawnEnemy, spawnInterval);
        attackTimer = setInterval(fireBullet, attackSpeed);
        gameLoop();
    }

    function update(timestamp) {
        if (isGameOver) return;

        if (!scoreTimer) scoreTimer = timestamp;
        if (timestamp - scoreTimer > 100) {
            score += 1;
            scoreTimer = timestamp;
        }

        if (keysPressed['w'] || keysPressed['ArrowUp']) player.y -= player.speed;
        if (keysPressed['s'] || keysPressed['ArrowDown']) player.y += player.speed;
        if (keysPressed['a'] || keysPressed['ArrowLeft']) player.x -= player.speed;
        if (keysPressed['d'] || keysPressed['ArrowRight']) player.x += player.speed;

        if (player.x < 0) player.x = 0;
        if (player.y < 0) player.y = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
        if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

        // Update and check collisions
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            bullet.x += bullet.velocityX;
            bullet.y += bullet.velocityY;

            // Remove bullets that are off-screen
            if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
                bullets.splice(i, 1);
                continue;
            }

            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {

                    enemy.hp -= 1;
                    bullets.splice(i, 1); // Remove bullet on hit

                    if (enemy.hp <= 0) {
                        enemies.splice(j, 1);
                        score += 10;
                    }
                    break;
                }
            }
        }

        enemies.forEach((enemy, index) => {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
                enemy.x += (dx / distance) * enemySpeed;
                enemy.y += (dy / distance) * enemySpeed;
            }

            if (player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y) {
                player.hp -= 1;
                enemies.splice(index, 1);
                if (player.hp <= 0) {
                    isGameOver = true;
                }
            }
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        bullets.forEach(b => { ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.width, b.height); });

        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

        enemies.forEach(e => { ctx.fillStyle = e.color; ctx.fillRect(e.x, e.y, e.width, e.height); });

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`HP: ${player.hp} / ${player.maxHp}`, 10, 30);
        ctx.textAlign = "center";
        ctx.fillText(`Score: ${score}`, canvas.width / 2, 30);

        if (isGameOver) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.font = "50px Arial";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
            ctx.font = "20px Arial";
            ctx.fillText("Press 'r' to Restart", canvas.width / 2, canvas.height / 2 + 40);
        }
    }

    function gameLoop(timestamp) {
        update(timestamp);
        draw();
        if (!isGameOver) {
            requestAnimationFrame(gameLoop);
        }
    }

    playerImage.onload = () => {
        gameLoop(0);
    };
});
