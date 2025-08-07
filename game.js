document.addEventListener('DOMContentLoaded', () => {
    console.log("game.js loaded after DOM content");

    // 캔버스 요소와 2D 컨텍스트 가져오기
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // 게임 상태 변수
    let isGameOver = false;

    // 플레이어 객체 생성
    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height / 2 - 25,
        width: 50,
        height: 50,
        speed: 5,
        color: 'white'
    };

    // 키 입력 상태를 저장할 객체
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

    // 적(enemy) 관련 설정
    let enemies = [];
    const enemySpeed = 2;
    const spawnInterval = 1000; // 1초마다 적 생성

    function spawnEnemy() {
        if (isGameOver) return;
        const size = 30;
        let x, y;
        const edge = Math.floor(Math.random() * 4);

        if (edge === 0) { // Top
            x = Math.random() * canvas.width;
            y = 0 - size;
        } else if (edge === 1) { // Right
            x = canvas.width;
            y = Math.random() * canvas.height;
        } else if (edge === 2) { // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height;
        } else { // Left
            x = 0 - size;
            y = Math.random() * canvas.height;
        }

        enemies.push({ x, y, width: size, height: size, color: 'red' });
    }

    let spawnTimer = setInterval(spawnEnemy, spawnInterval);

    function resetGame() {
        isGameOver = false;
        player.x = canvas.width / 2 - 25;
        player.y = canvas.height / 2 - 25;
        enemies = [];
        if (spawnTimer) clearInterval(spawnTimer);
        spawnTimer = setInterval(spawnEnemy, spawnInterval);
        gameLoop();
    }

    // 게임 상태 업데이트 함수
    function update() {
        if (isGameOver) return;

        // 플레이어 이동
        if (keysPressed['w'] || keysPressed['ArrowUp']) player.y -= player.speed;
        if (keysPressed['s'] || keysPressed['ArrowDown']) player.y += player.speed;
        if (keysPressed['a'] || keysPressed['ArrowLeft']) player.x -= player.speed;
        if (keysPressed['d'] || keysPressed['ArrowRight']) player.x += player.speed;

        // 플레이어 경계 처리
        if (player.x < 0) player.x = 0;
        if (player.y < 0) player.y = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
        if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

        // 적 이동 및 충돌 감지
        enemies.forEach(enemy => {
            const dx = player.x + player.width / 2 - (enemy.x + enemy.width / 2);
            const dy = player.y + player.height / 2 - (enemy.y + enemy.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                const velocityX = (dx / distance) * enemySpeed;
                const velocityY = (dy / distance) * enemySpeed;
                enemy.x += velocityX;
                enemy.y += velocityY;
            }

            // 충돌 감지 (AABB)
            if (player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y) {
                isGameOver = true;
            }
        });
    }

    // 화면을 그리는 함수
    function draw() {
        // 캔버스 클리어
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 플레이어 그리기
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // 적 그리기
        enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });

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

    // 메인 게임 루프
    function gameLoop() {
        update();
        draw();
        if (!isGameOver) {
            requestAnimationFrame(gameLoop);
        }
    }

    // 게임 루프 시작
    gameLoop();
});
