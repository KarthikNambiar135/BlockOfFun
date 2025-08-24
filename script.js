// Game Library JavaScript
class GameLibrary {
    constructor() {
        this.currentGame = 'menu';
        this.scores = this.loadScores();
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupGameCards();
        this.initTicTacToe();
        this.initSnake();
        this.initPingPong();
        this.initCrossTheRoad();
        this.initFlappyBird();
        this.initHangman();
    }

    // Navigation System
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const game = btn.dataset.game;
                this.switchGame(game);
            });
        });
    }

    setupGameCards() {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.addEventListener('click', () => {
                const game = card.dataset.game;
                this.switchGame(game);
            });
        });
    }

    switchGame(game) {
        // Hide all game sections
        document.querySelectorAll('.game-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected game section
        document.getElementById(game).classList.add('active');

        // Add active class to corresponding nav button
        document.querySelector(`[data-game="${game}"]`).classList.add('active');

        this.currentGame = game;
    }

    // Score Management
    loadScores() {
        const saved = localStorage.getItem('gameScores');
        return saved ? JSON.parse(saved) : {
            tictactoe: { x: 0, o: 0 },
            snake: { score: 0, highScore: 0 },
            pingpong: { p1: 0, p2: 0 },
            crosstheroad: { score: 0, highScore: 0 },
            flappybird: { score: 0, highScore: 0 },
            hangman: { wins: 0, losses: 0 }
        };
    }

    saveScores() {
        localStorage.setItem('gameScores', JSON.stringify(this.scores));
    }

    updateScoreDisplay() {
        // Update all score displays
        document.getElementById('score-x').textContent = this.scores.tictactoe.x;
        document.getElementById('score-o').textContent = this.scores.tictactoe.o;
        document.getElementById('snake-score').textContent = this.scores.snake.score;
        document.getElementById('snake-highscore').textContent = this.scores.snake.highScore;
        document.getElementById('p1-score').textContent = this.scores.pingpong.p1;
        document.getElementById('p2-score').textContent = this.scores.pingpong.p2;
        document.getElementById('road-score').textContent = this.scores.crosstheroad.score;
        document.getElementById('road-highscore').textContent = this.scores.crosstheroad.highScore;
        document.getElementById('flappy-score').textContent = this.scores.flappybird.score;
        document.getElementById('flappy-highscore').textContent = this.scores.flappybird.highScore;
        document.getElementById('hangman-wins').textContent = this.scores.hangman.wins;
        document.getElementById('hangman-losses').textContent = this.scores.hangman.losses;
    }

    // Tic Tac Toe Game
    initTicTacToe() {
        this.tictactoe = {
            board: ['', '', '', '', '', '', '', '', ''],
            currentPlayer: 'X',
            gameActive: true
        };

        const cells = document.querySelectorAll('#tictactoe-board .cell');
        cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleTicTacToeMove(cell));
        });

        document.getElementById('tictactoe-reset').addEventListener('click', () => {
            this.resetTicTacToe();
        });

        this.updateScoreDisplay();
    }

    handleTicTacToeMove(cell) {
        const index = parseInt(cell.dataset.index);
        
        if (this.tictactoe.board[index] === '' && this.tictactoe.gameActive) {
            this.tictactoe.board[index] = this.tictactoe.currentPlayer;
            cell.textContent = this.tictactoe.currentPlayer;
            cell.classList.add(this.tictactoe.currentPlayer.toLowerCase());

            if (this.checkTicTacToeWin()) {
                this.handleTicTacToeWin();
            } else if (this.tictactoe.board.every(cell => cell !== '')) {
                this.handleTicTacToeDraw();
            } else {
                this.tictactoe.currentPlayer = this.tictactoe.currentPlayer === 'X' ? 'O' : 'X';
                document.getElementById('tictactoe-status').textContent = `Player ${this.tictactoe.currentPlayer}'s turn`;
            }
        }
    }

    checkTicTacToeWin() {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        return winConditions.some(condition => {
            const [a, b, c] = condition;
            return this.tictactoe.board[a] && 
                   this.tictactoe.board[a] === this.tictactoe.board[b] && 
                   this.tictactoe.board[a] === this.tictactoe.board[c];
        });
    }

    handleTicTacToeWin() {
        this.tictactoe.gameActive = false;
        this.scores.tictactoe[this.tictactoe.currentPlayer.toLowerCase()]++;
        this.saveScores();
        this.updateScoreDisplay();
        document.getElementById('tictactoe-status').textContent = `Player ${this.tictactoe.currentPlayer} wins!`;
    }

    handleTicTacToeDraw() {
        this.tictactoe.gameActive = false;
        document.getElementById('tictactoe-status').textContent = "It's a draw!";
    }

    resetTicTacToe() {
        this.tictactoe.board = ['', '', '', '', '', '', '', '', ''];
        this.tictactoe.currentPlayer = 'X';
        this.tictactoe.gameActive = true;
        
        document.querySelectorAll('#tictactoe-board .cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });
        
        document.getElementById('tictactoe-status').textContent = "Player X's turn";
    }

    // Snake Game
    initSnake() {
        this.snake = {
            canvas: document.getElementById('snake-canvas'),
            ctx: document.getElementById('snake-canvas').getContext('2d'),
            snake: [{x: 10, y: 10}],
            food: {x: 15, y: 15},
            dx: 0,
            dy: 0,
            score: 0,
            gameRunning: false,
            gameLoop: null
        };

        document.getElementById('snake-start').addEventListener('click', () => {
            this.startSnake();
        });

        document.getElementById('snake-reset').addEventListener('click', () => {
            this.resetSnake();
        });

        document.addEventListener('keydown', (e) => {
            if (this.currentGame === 'snake') {
                this.handleSnakeKeyPress(e);
            }
        });

        this.drawSnake();
    }

    startSnake() {
        if (!this.snake.gameRunning) {
            this.snake.gameRunning = true;
            this.snake.score = 0;
            this.scores.snake.score = 0;
            // Set initial direction to move right
            this.snake.dx = 1;
            this.snake.dy = 0;
            this.updateScoreDisplay();
            this.snake.gameLoop = setInterval(() => this.updateSnake(), 150);
        }
    }

    handleSnakeKeyPress(e) {
        if (!this.snake.gameRunning) return;

        // Prevent page scrolling
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }

        switch(e.key) {
            case 'ArrowUp':
                if (this.snake.dy !== 1) { this.snake.dx = 0; this.snake.dy = -1; }
                break;
            case 'ArrowDown':
                if (this.snake.dy !== -1) { this.snake.dx = 0; this.snake.dy = 1; }
                break;
            case 'ArrowLeft':
                if (this.snake.dx !== 1) { this.snake.dx = -1; this.snake.dy = 0; }
                break;
            case 'ArrowRight':
                if (this.snake.dx !== -1) { this.snake.dx = 1; this.snake.dy = 0; }
                break;
        }
    }

    updateSnake() {
        const head = {x: this.snake.snake[0].x + this.snake.dx, y: this.snake.snake[0].y + this.snake.dy};

        // Check collision with walls
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
            this.gameOverSnake();
            return;
        }

        // Check collision with self
        if (this.snake.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOverSnake();
            return;
        }

        this.snake.snake.unshift(head);

        // Check if food is eaten
        if (head.x === this.snake.food.x && head.y === this.snake.food.y) {
            this.snake.score++;
            this.scores.snake.score = this.snake.score;
            this.generateSnakeFood();
            this.updateScoreDisplay();
        } else {
            this.snake.snake.pop();
        }

        this.drawSnake();
    }

    generateSnakeFood() {
        do {
            this.snake.food = {
                x: Math.floor(Math.random() * 20),
                y: Math.floor(Math.random() * 20)
            };
        } while (this.snake.snake.some(segment => segment.x === this.snake.food.x && segment.y === this.snake.food.y));
    }

    drawSnake() {
        this.snake.ctx.fillStyle = '#000';
        this.snake.ctx.fillRect(0, 0, 400, 400);

        // Draw snake
        this.snake.ctx.fillStyle = '#ffd700';
        this.snake.snake.forEach(segment => {
            this.snake.ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
        });

        // Draw food
        this.snake.ctx.fillStyle = '#fff';
        this.snake.ctx.fillRect(this.snake.food.x * 20, this.snake.food.y * 20, 20, 20);
    }

    gameOverSnake() {
        this.snake.gameRunning = false;
        clearInterval(this.snake.gameLoop);
        
        if (this.snake.score > this.scores.snake.highScore) {
            this.scores.snake.highScore = this.snake.score;
            this.saveScores();
            this.updateScoreDisplay();
        }
    }

    resetSnake() {
        this.snake.snake = [{x: 10, y: 10}];
        this.snake.dx = 0;
        this.snake.dy = 0;
        this.snake.score = 0;
        this.scores.snake.score = 0;
        this.generateSnakeFood();
        this.updateScoreDisplay();
        this.drawSnake();
    }

    // Ping Pong Game
    initPingPong() {
        this.pingpong = {
            canvas: document.getElementById('pingpong-canvas'),
            ctx: document.getElementById('pingpong-canvas').getContext('2d'),
            paddle1: {y: 150, height: 100, speed: 0},
            paddle2: {y: 150, height: 100, speed: 0},
            ball: {x: 300, y: 200, dx: 5, dy: 3, size: 10},
            score1: 0,
            score2: 0,
            gameRunning: false,
            gameLoop: null
        };

        document.getElementById('pingpong-start').addEventListener('click', () => {
            this.startPingPong();
        });

        document.getElementById('pingpong-reset').addEventListener('click', () => {
            this.resetPingPong();
        });

        document.addEventListener('keydown', (e) => {
            if (this.currentGame === 'pingpong') {
                this.handlePingPongKeyPress(e);
            }
        });

        document.addEventListener('keyup', (e) => {
            if (this.currentGame === 'pingpong') {
                this.handlePingPongKeyUp(e);
            }
        });

        this.drawPingPong();
    }

    startPingPong() {
        if (!this.pingpong.gameRunning) {
            this.pingpong.gameRunning = true;
            this.pingpong.gameLoop = setInterval(() => this.updatePingPong(), 16);
        }
    }

    handlePingPongKeyPress(e) {
        if (!this.pingpong.gameRunning) return;

        // Prevent page scrolling for arrow keys
        if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
        }

        switch(e.key) {
            case 'w':
            case 'W':
                this.pingpong.paddle1.speed = -8;
                break;
            case 's':
            case 'S':
                this.pingpong.paddle1.speed = 8;
                break;
            case 'ArrowUp':
                this.pingpong.paddle2.speed = -8;
                break;
            case 'ArrowDown':
                this.pingpong.paddle2.speed = 8;
                break;
        }
    }

    handlePingPongKeyUp(e) {
        switch(e.key) {
            case 'w':
            case 'W':
            case 's':
            case 'S':
                this.pingpong.paddle1.speed = 0;
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                this.pingpong.paddle2.speed = 0;
                break;
        }
    }

    updatePingPong() {
        // Update paddle positions
        this.pingpong.paddle1.y += this.pingpong.paddle1.speed;
        this.pingpong.paddle2.y += this.pingpong.paddle2.speed;

        // Keep paddles in bounds
        this.pingpong.paddle1.y = Math.max(0, Math.min(300, this.pingpong.paddle1.y));
        this.pingpong.paddle2.y = Math.max(0, Math.min(300, this.pingpong.paddle2.y));

        // Update ball position
        this.pingpong.ball.x += this.pingpong.ball.dx;
        this.pingpong.ball.y += this.pingpong.ball.dy;

        // Ball collision with top and bottom
        if (this.pingpong.ball.y <= 0 || this.pingpong.ball.y >= 390) {
            this.pingpong.ball.dy *= -1;
        }

        // Ball collision with paddles
        if (this.pingpong.ball.x <= 20 && 
            this.pingpong.ball.y >= this.pingpong.paddle1.y && 
            this.pingpong.ball.y <= this.pingpong.paddle1.y + this.pingpong.paddle1.height) {
            this.pingpong.ball.dx *= -1;
        }

        if (this.pingpong.ball.x >= 570 && 
            this.pingpong.ball.y >= this.pingpong.paddle2.y && 
            this.pingpong.ball.y <= this.pingpong.paddle2.y + this.pingpong.paddle2.height) {
            this.pingpong.ball.dx *= -1;
        }

        // Score points
        if (this.pingpong.ball.x <= 0) {
            this.pingpong.score2++;
            this.scores.pingpong.p2 = this.pingpong.score2;
            this.resetPingPongBall();
            this.updateScoreDisplay();
        } else if (this.pingpong.ball.x >= 590) {
            this.pingpong.score1++;
            this.scores.pingpong.p1 = this.pingpong.score1;
            this.resetPingPongBall();
            this.updateScoreDisplay();
        }

        this.drawPingPong();
    }

    resetPingPongBall() {
        this.pingpong.ball.x = 300;
        this.pingpong.ball.y = 200;
        this.pingpong.ball.dx = Math.random() > 0.5 ? 5 : -5;
        this.pingpong.ball.dy = Math.random() > 0.5 ? 3 : -3;
    }

    drawPingPong() {
        this.pingpong.ctx.fillStyle = '#000';
        this.pingpong.ctx.fillRect(0, 0, 600, 400);

        // Draw paddles
        this.pingpong.ctx.fillStyle = '#ffd700';
        this.pingpong.ctx.fillRect(10, this.pingpong.paddle1.y, 10, this.pingpong.paddle1.height);
        this.pingpong.ctx.fillRect(580, this.pingpong.paddle2.y, 10, this.pingpong.paddle2.height);

        // Draw ball
        this.pingpong.ctx.fillStyle = '#fff';
        this.pingpong.ctx.fillRect(this.pingpong.ball.x, this.pingpong.ball.y, this.pingpong.ball.size, this.pingpong.ball.size);

        // Draw center line
        this.pingpong.ctx.strokeStyle = '#333';
        this.pingpong.ctx.setLineDash([5, 5]);
        this.pingpong.ctx.beginPath();
        this.pingpong.ctx.moveTo(300, 0);
        this.pingpong.ctx.lineTo(300, 400);
        this.pingpong.ctx.stroke();
    }

    resetPingPong() {
        this.pingpong.score1 = 0;
        this.pingpong.score2 = 0;
        this.scores.pingpong.p1 = 0;
        this.scores.pingpong.p2 = 0;
        this.resetPingPongBall();
        this.updateScoreDisplay();
        this.drawPingPong();
    }

    // Cross the Road Game
    initCrossTheRoad() {
        this.crosstheroad = {
            canvas: document.getElementById('road-canvas'),
            ctx: document.getElementById('road-canvas').getContext('2d'),
            player: {x: 200, y: 550, width: 20, height: 20},
            cars: [],
            score: 0,
            gameRunning: false,
            gameLoop: null,
            carSpawnTimer: 0
        };

        document.getElementById('road-start').addEventListener('click', () => {
            this.startCrossTheRoad();
        });

        document.getElementById('road-reset').addEventListener('click', () => {
            this.resetCrossTheRoad();
        });

        document.addEventListener('keydown', (e) => {
            if (this.currentGame === 'crosstheroad') {
                this.handleCrossTheRoadKeyPress(e);
            }
        });

        this.drawCrossTheRoad();
    }

    startCrossTheRoad() {
        if (!this.crosstheroad.gameRunning) {
            this.crosstheroad.gameRunning = true;
            this.crosstheroad.score = 0;
            this.scores.crosstheroad.score = 0;
            this.updateScoreDisplay();
            this.crosstheroad.gameLoop = setInterval(() => this.updateCrossTheRoad(), 16);
        }
    }

    handleCrossTheRoadKeyPress(e) {
        if (!this.crosstheroad.gameRunning) return;

        // Prevent page scrolling for arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }

        switch(e.key) {
            case 'ArrowUp':
                this.crosstheroad.player.y = Math.max(0, this.crosstheroad.player.y - 20);
                break;
            case 'ArrowDown':
                this.crosstheroad.player.y = Math.min(580, this.crosstheroad.player.y + 20);
                break;
            case 'ArrowLeft':
                this.crosstheroad.player.x = Math.max(0, this.crosstheroad.player.x - 20);
                break;
            case 'ArrowRight':
                this.crosstheroad.player.x = Math.min(380, this.crosstheroad.player.x + 20);
                break;
        }
    }

    updateCrossTheRoad() {
        // Spawn cars
        this.crosstheroad.carSpawnTimer++;
        if (this.crosstheroad.carSpawnTimer > 60) {
            this.crosstheroad.cars.push({
                x: Math.random() > 0.5 ? -50 : 450,
                y: Math.floor(Math.random() * 6) * 100,
                width: 50,
                height: 30,
                speed: Math.random() > 0.5 ? 3 : -3
            });
            this.crosstheroad.carSpawnTimer = 0;
        }

        // Update car positions
        this.crosstheroad.cars.forEach((car, index) => {
            car.x += car.speed;
            
            // Remove cars that are off screen
            if (car.x < -100 || car.x > 500) {
                this.crosstheroad.cars.splice(index, 1);
            }

            // Check collision with player
            if (this.checkCollision(this.crosstheroad.player, car)) {
                this.gameOverCrossTheRoad();
            }
        });

        // Check if player reached the top
        if (this.crosstheroad.player.y <= 0) {
            this.crosstheroad.score++;
            this.scores.crosstheroad.score = this.crosstheroad.score;
            this.crosstheroad.player.y = 550;
            this.updateScoreDisplay();
        }

        this.drawCrossTheRoad();
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    drawCrossTheRoad() {
        this.crosstheroad.ctx.fillStyle = '#000';
        this.crosstheroad.ctx.fillRect(0, 0, 400, 600);

        // Draw road lines
        this.crosstheroad.ctx.strokeStyle = '#ffd700';
        this.crosstheroad.ctx.setLineDash([20, 20]);
        for (let i = 0; i < 6; i++) {
            this.crosstheroad.ctx.beginPath();
            this.crosstheroad.ctx.moveTo(0, i * 100 + 50);
            this.crosstheroad.ctx.lineTo(400, i * 100 + 50);
            this.crosstheroad.ctx.stroke();
        }

        // Draw player
        this.crosstheroad.ctx.fillStyle = '#ffd700';
        this.crosstheroad.ctx.fillRect(this.crosstheroad.player.x, this.crosstheroad.player.y, 
                                      this.crosstheroad.player.width, this.crosstheroad.player.height);

        // Draw cars
        this.crosstheroad.ctx.fillStyle = '#fff';
        this.crosstheroad.cars.forEach(car => {
            this.crosstheroad.ctx.fillRect(car.x, car.y, car.width, car.height);
        });
    }

    gameOverCrossTheRoad() {
        this.crosstheroad.gameRunning = false;
        clearInterval(this.crosstheroad.gameLoop);
        
        if (this.crosstheroad.score > this.scores.crosstheroad.highScore) {
            this.scores.crosstheroad.highScore = this.crosstheroad.score;
            this.saveScores();
            this.updateScoreDisplay();
        }
    }

    resetCrossTheRoad() {
        this.crosstheroad.player.x = 200;
        this.crosstheroad.player.y = 550;
        this.crosstheroad.cars = [];
        this.crosstheroad.score = 0;
        this.scores.crosstheroad.score = 0;
        this.updateScoreDisplay();
        this.drawCrossTheRoad();
    }

    // Flappy Bird Game
    initFlappyBird() {
        this.flappybird = {
            canvas: document.getElementById('flappy-canvas'),
            ctx: document.getElementById('flappy-canvas').getContext('2d'),
            bird: {x: 50, y: 300, velocity: 0, size: 20},
            pipes: [],
            score: 0,
            gameRunning: false,
            gameLoop: null,
            pipeSpawnTimer: 0
        };

        document.getElementById('flappy-start').addEventListener('click', () => {
            this.startFlappyBird();
        });

        document.getElementById('flappy-reset').addEventListener('click', () => {
            this.resetFlappyBird();
        });

        document.addEventListener('keydown', (e) => {
            if (this.currentGame === 'flappybird' && e.code === 'Space') {
                e.preventDefault(); // Prevent page scrolling
                this.flapBird();
            }
        });

        this.flappybird.canvas.addEventListener('click', () => {
            if (this.currentGame === 'flappybird') {
                this.flapBird();
            }
        });

        this.drawFlappyBird();
    }

    startFlappyBird() {
        if (!this.flappybird.gameRunning) {
            this.flappybird.gameRunning = true;
            this.flappybird.score = 0;
            this.scores.flappybird.score = 0;
            this.updateScoreDisplay();
            this.flappybird.gameLoop = setInterval(() => this.updateFlappyBird(), 16);
        }
    }

    flapBird() {
        if (this.flappybird.gameRunning) {
            this.flappybird.bird.velocity = -8;
        }
    }

    updateFlappyBird() {
        // Update bird
        this.flappybird.bird.velocity += 0.5;
        this.flappybird.bird.y += this.flappybird.bird.velocity;

        // Spawn pipes
        this.flappybird.pipeSpawnTimer++;
        if (this.flappybird.pipeSpawnTimer > 120) {
            const gapY = Math.random() * 400 + 100;
            this.flappybird.pipes.push({
                x: 400,
                gapY: gapY,
                gapSize: 100,
                passed: false
            });
            this.flappybird.pipeSpawnTimer = 0;
        }

        // Update pipes
        this.flappybird.pipes.forEach((pipe, index) => {
            pipe.x -= 3;

            // Check if bird passed pipe
            if (!pipe.passed && pipe.x < this.flappybird.bird.x) {
                pipe.passed = true;
                this.flappybird.score++;
                this.scores.flappybird.score = this.flappybird.score;
                this.updateScoreDisplay();
            }

            // Check collision
            if (this.flappybird.bird.x + this.flappybird.bird.size > pipe.x && 
                this.flappybird.bird.x < pipe.x + 50) {
                if (this.flappybird.bird.y < pipe.gapY || 
                    this.flappybird.bird.y + this.flappybird.bird.size > pipe.gapY + pipe.gapSize) {
                    this.gameOverFlappyBird();
                }
            }

            // Remove pipes off screen
            if (pipe.x < -50) {
                this.flappybird.pipes.splice(index, 1);
            }
        });

        // Check boundaries
        if (this.flappybird.bird.y < 0 || this.flappybird.bird.y > 580) {
            this.gameOverFlappyBird();
        }

        this.drawFlappyBird();
    }

    drawFlappyBird() {
        this.flappybird.ctx.fillStyle = '#000';
        this.flappybird.ctx.fillRect(0, 0, 400, 600);

        // Draw bird
        this.flappybird.ctx.fillStyle = '#ffd700';
        this.flappybird.ctx.fillRect(this.flappybird.bird.x, this.flappybird.bird.y, 
                                    this.flappybird.bird.size, this.flappybird.bird.size);

        // Draw pipes
        this.flappybird.ctx.fillStyle = '#fff';
        this.flappybird.pipes.forEach(pipe => {
            this.flappybird.ctx.fillRect(pipe.x, 0, 50, pipe.gapY);
            this.flappybird.ctx.fillRect(pipe.x, pipe.gapY + pipe.gapSize, 50, 600 - pipe.gapY - pipe.gapSize);
        });
    }

    gameOverFlappyBird() {
        this.flappybird.gameRunning = false;
        clearInterval(this.flappybird.gameLoop);
        
        if (this.flappybird.score > this.scores.flappybird.highScore) {
            this.scores.flappybird.highScore = this.flappybird.score;
            this.saveScores();
            this.updateScoreDisplay();
        }
    }

    resetFlappyBird() {
        this.flappybird.bird.y = 300;
        this.flappybird.bird.velocity = 0;
        this.flappybird.pipes = [];
        this.flappybird.score = 0;
        this.scores.flappybird.score = 0;
        this.updateScoreDisplay();
        this.drawFlappyBird();
    }

    // Hangman Game
    initHangman() {
        this.hangman = {
            canvas: document.getElementById('hangman-canvas'),
            ctx: document.getElementById('hangman-canvas').getContext('2d'),
            words: ['JAVASCRIPT', 'PROGRAMMING', 'COMPUTER', 'ALGORITHM', 'FUNCTION', 'VARIABLE', 'DATABASE', 'NETWORK', 'SECURITY', 'INTERFACE'],
            currentWord: '',
            guessedLetters: new Set(),
            wrongGuesses: 0,
            maxWrongGuesses: 6,
            gameActive: false
        };

        document.getElementById('hangman-new').addEventListener('click', () => {
            this.newHangmanWord();
        });

        document.getElementById('hangman-reset').addEventListener('click', () => {
            this.resetHangman();
        });

        this.createHangmanKeyboard();
        this.newHangmanWord();
        this.updateScoreDisplay();
    }

    createHangmanKeyboard() {
        const keyboard = document.getElementById('hangman-keyboard');
        keyboard.innerHTML = '';
        
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        letters.forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter;
            button.addEventListener('click', () => this.guessLetter(letter));
            keyboard.appendChild(button);
        });
    }

    newHangmanWord() {
        this.hangman.currentWord = this.hangman.words[Math.floor(Math.random() * this.hangman.words.length)];
        this.hangman.guessedLetters.clear();
        this.hangman.wrongGuesses = 0;
        this.hangman.gameActive = true;
        
        // Reset keyboard
        document.querySelectorAll('#hangman-keyboard button').forEach(btn => {
            btn.className = '';
        });
        
        this.updateHangmanDisplay();
        this.drawHangman();
    }

    guessLetter(letter) {
        if (!this.hangman.gameActive || this.hangman.guessedLetters.has(letter)) return;

        this.hangman.guessedLetters.add(letter);
        const button = Array.from(document.querySelectorAll('#hangman-keyboard button'))
                           .find(btn => btn.textContent === letter);

        if (this.hangman.currentWord.includes(letter)) {
            button.classList.add('correct');
        } else {
            button.classList.add('wrong');
            this.hangman.wrongGuesses++;
        }

        button.classList.add('used');

        if (this.hangman.wrongGuesses >= this.hangman.maxWrongGuesses) {
            this.gameOverHangman(false);
        } else if (this.checkHangmanWin()) {
            this.gameOverHangman(true);
        }

        this.updateHangmanDisplay();
        this.drawHangman();
    }

    checkHangmanWin() {
        return this.hangman.currentWord.split('').every(letter => 
            this.hangman.guessedLetters.has(letter)
        );
    }

    updateHangmanDisplay() {
        const wordDisplay = document.getElementById('hangman-word');
        const display = this.hangman.currentWord.split('').map(letter => 
            this.hangman.guessedLetters.has(letter) ? letter : '_'
        ).join(' ');
        
        wordDisplay.textContent = display;
        
        const status = document.getElementById('hangman-status');
        if (this.hangman.gameActive) {
            status.textContent = `Wrong guesses: ${this.hangman.wrongGuesses}/${this.hangman.maxWrongGuesses}`;
        }
    }

    drawHangman() {
        this.hangman.ctx.fillStyle = '#000';
        this.hangman.ctx.fillRect(0, 0, 300, 300);
        
        this.hangman.ctx.strokeStyle = '#ffd700';
        this.hangman.ctx.lineWidth = 3;

        // Draw gallows
        this.hangman.ctx.beginPath();
        this.hangman.ctx.moveTo(50, 250);
        this.hangman.ctx.lineTo(150, 250);
        this.hangman.ctx.lineTo(150, 50);
        this.hangman.ctx.lineTo(250, 50);
        this.hangman.ctx.lineTo(250, 70);
        this.hangman.ctx.stroke();

        // Draw hangman based on wrong guesses
        if (this.hangman.wrongGuesses >= 1) {
            // Head
            this.hangman.ctx.beginPath();
            this.hangman.ctx.arc(250, 90, 20, 0, 2 * Math.PI);
            this.hangman.ctx.stroke();
        }
        
        if (this.hangman.wrongGuesses >= 2) {
            // Body
            this.hangman.ctx.beginPath();
            this.hangman.ctx.moveTo(250, 110);
            this.hangman.ctx.lineTo(250, 170);
            this.hangman.ctx.stroke();
        }
        
        if (this.hangman.wrongGuesses >= 3) {
            // Left arm
            this.hangman.ctx.beginPath();
            this.hangman.ctx.moveTo(250, 130);
            this.hangman.ctx.lineTo(220, 150);
            this.hangman.ctx.stroke();
        }
        
        if (this.hangman.wrongGuesses >= 4) {
            // Right arm
            this.hangman.ctx.beginPath();
            this.hangman.ctx.moveTo(250, 130);
            this.hangman.ctx.lineTo(280, 150);
            this.hangman.ctx.stroke();
        }
        
        if (this.hangman.wrongGuesses >= 5) {
            // Left leg
            this.hangman.ctx.beginPath();
            this.hangman.ctx.moveTo(250, 170);
            this.hangman.ctx.lineTo(220, 200);
            this.hangman.ctx.stroke();
        }
        
        if (this.hangman.wrongGuesses >= 6) {
            // Right leg
            this.hangman.ctx.beginPath();
            this.hangman.ctx.moveTo(250, 170);
            this.hangman.ctx.lineTo(280, 200);
            this.hangman.ctx.stroke();
        }
    }

    gameOverHangman(won) {
        this.hangman.gameActive = false;
        
        if (won) {
            this.scores.hangman.wins++;
            document.getElementById('hangman-status').textContent = 'Congratulations! You won!';
        } else {
            this.scores.hangman.losses++;
            document.getElementById('hangman-status').textContent = `Game Over! The word was: ${this.hangman.currentWord}`;
        }
        
        this.saveScores();
        this.updateScoreDisplay();
    }

    resetHangman() {
        this.scores.hangman.wins = 0;
        this.scores.hangman.losses = 0;
        this.saveScores();
        this.updateScoreDisplay();
        this.newHangmanWord();
    }
}

// Initialize the game library when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GameLibrary();
});
