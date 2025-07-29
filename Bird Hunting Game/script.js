class BirdHuntingGame {
    constructor() {
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 60;
        this.gameRunning = false;
        this.gamePaused = false;
        this.birdSpeed = 2000; // milliseconds
        this.birdTimer = null;
        this.gameTimer = null;
        this.birds = [];
        this.maxBirds = 3;
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.gameArea = document.getElementById('gameArea');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.timeElement = document.getElementById('time');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.playAgainBtn = document.getElementById('playAgainBtn');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        
        // Add click event to game area for bird hunting
        this.gameArea.addEventListener('click', (e) => this.handleBirdClick(e));
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        // Start spawning birds
        this.spawnBird();
        this.birdTimer = setInterval(() => {
            if (!this.gamePaused && this.birds.length < this.maxBirds) {
                this.spawnBird();
            }
        }, this.birdSpeed);
        
        // Start game timer
        this.gameTimer = setInterval(() => {
            if (!this.gamePaused) {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }
    
    pauseGame() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        this.pauseBtn.textContent = this.gamePaused ? 'Resume' : 'Pause';
        
        if (this.gamePaused) {
            this.pauseBtn.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
        } else {
            this.pauseBtn.style.background = 'linear-gradient(45deg, #f39c12, #e67e22)';
        }
    }
    
    resetGame() {
        this.endGame();
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 60;
        this.gameRunning = false;
        this.gamePaused = false;
        this.birds = [];
        this.updateDisplay();
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pause';
        this.pauseBtn.style.background = 'linear-gradient(45deg, #f39c12, #e67e22)';
        
        // Clear all birds
        const existingBirds = this.gameArea.querySelectorAll('.bird');
        existingBirds.forEach(bird => bird.remove());
    }
    
    spawnBird() {
        const bird = document.createElement('div');
        bird.className = 'bird';
        bird.innerHTML = '<div class="bird-body">🐦</div>';
        
        // Random position
        const maxX = this.gameArea.clientWidth - 60;
        const maxY = this.gameArea.clientHeight - 60;
        const x = Math.random() * maxX;
        const y = Math.random() * maxY;
        
        bird.style.left = x + 'px';
        bird.style.top = y + 'px';
        
        // Random movement direction
        const directionX = (Math.random() - 0.5) * 2;
        const directionY = (Math.random() - 0.5) * 2;
        const speed = 1 + Math.random() * 2;
        
        bird.dataset.directionX = directionX;
        bird.dataset.directionY = directionY;
        bird.dataset.speed = speed;
        
        this.gameArea.appendChild(bird);
        this.birds.push(bird);
        
        // Start bird movement
        this.moveBird(bird);
        
        // Auto-remove bird after some time if not clicked
        setTimeout(() => {
            if (bird.parentNode && !bird.classList.contains('hit')) {
                this.removeBird(bird);
                this.loseLife();
            }
        }, 3000 + Math.random() * 2000);
    }
    
    moveBird(bird) {
        if (!this.gameRunning || this.gamePaused || !bird.parentNode) return;
        
        const directionX = parseFloat(bird.dataset.directionX);
        const directionY = parseFloat(bird.dataset.directionY);
        const speed = parseFloat(bird.dataset.speed);
        
        let currentX = parseFloat(bird.style.left) || 0;
        let currentY = parseFloat(bird.style.top) || 0;
        
        currentX += directionX * speed;
        currentY += directionY * speed;
        
        // Bounce off walls
        const maxX = this.gameArea.clientWidth - 60;
        const maxY = this.gameArea.clientHeight - 60;
        
        if (currentX <= 0 || currentX >= maxX) {
            bird.dataset.directionX = -directionX;
            currentX = Math.max(0, Math.min(currentX, maxX));
        }
        
        if (currentY <= 0 || currentY >= maxY) {
            bird.dataset.directionY = -directionY;
            currentY = Math.max(0, Math.min(currentY, maxY));
        }
        
        bird.style.left = currentX + 'px';
        bird.style.top = currentY + 'px';
        
        // Continue movement
        requestAnimationFrame(() => this.moveBird(bird));
    }
    
    handleBirdClick(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const bird = e.target.closest('.bird');
        if (bird && !bird.classList.contains('hit')) {
            this.hitBird(bird);
        }
    }
    
    hitBird(bird) {
        bird.classList.add('hit');
        
        // Add score
        this.score += 10;
        this.updateDisplay();
        
        // Create particle effect
        this.createParticleEffect(bird);
        
        // Remove bird after animation
        setTimeout(() => {
            this.removeBird(bird);
        }, 300);
        
        // Increase difficulty
        if (this.score % 50 === 0) {
            this.increaseDifficulty();
        }
    }
    
    createParticleEffect(bird) {
        const rect = bird.getBoundingClientRect();
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = '✨';
            particle.style.fontSize = '1.5rem';
            particle.style.color = '#f39c12';
            
            const x = rect.left - gameAreaRect.left + rect.width / 2;
            const y = rect.top - gameAreaRect.top + rect.height / 2;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            this.gameArea.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 600);
        }
    }
    
    removeBird(bird) {
        const index = this.birds.indexOf(bird);
        if (index > -1) {
            this.birds.splice(index, 1);
        }
        if (bird.parentNode) {
            bird.remove();
        }
    }
    
    loseLife() {
        this.lives--;
        this.updateDisplay();
        
        if (this.lives <= 0) {
            this.endGame();
        }
    }
    
    increaseDifficulty() {
        this.birdSpeed = Math.max(500, this.birdSpeed - 100);
        if (this.birdTimer) {
            clearInterval(this.birdTimer);
            this.birdTimer = setInterval(() => {
                if (!this.gamePaused && this.birds.length < this.maxBirds) {
                    this.spawnBird();
                }
            }, this.birdSpeed);
        }
    }
    
    endGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        if (this.birdTimer) {
            clearInterval(this.birdTimer);
            this.birdTimer = null;
        }
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pause';
        this.pauseBtn.style.background = 'linear-gradient(45deg, #f39c12, #e67e22)';
        
        // Clear all birds
        this.birds.forEach(bird => {
            if (bird.parentNode) {
                bird.remove();
            }
        });
        this.birds = [];
        
        // Show game over screen
        this.showGameOver();
    }
    
    showGameOver() {
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.add('show');
    }
    
    playAgain() {
        this.gameOverElement.classList.remove('show');
        this.resetGame();
        this.startGame();
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.lives;
        this.timeElement.textContent = this.timeLeft;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BirdHuntingGame();
}); 