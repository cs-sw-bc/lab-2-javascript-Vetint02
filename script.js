// script.js — add simple interactivity and console logging for main elements
document.addEventListener('DOMContentLoaded', () => {
  const title = document.querySelector('h1');
  const app = document.getElementById('app');

  function log(...args) { console.log('[App]', ...args); }

  // Title interactions
  title.addEventListener('click', () => {
    document.body.classList.toggle('accent-mode');
    log('Title clicked — toggled accent-mode:', document.body.classList.contains('accent-mode'));
  });
  title.addEventListener('dblclick', () => log('Title double-clicked'));
  title.addEventListener('mouseenter', () => log('Pointer entered title'));
  title.addEventListener('mouseleave', () => log('Pointer left title'));

  // Create control buttons (Start/Reset)
  const controls = document.createElement('div');
  controls.className = 'app-controls';

  const startBtn = document.createElement('button');
  startBtn.type = 'button';
  startBtn.textContent = 'Start (S)';
  startBtn.dataset.action = 'start';
  startBtn.className = 'start-btn';

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.textContent = 'Reset (R)';
  resetBtn.dataset.action = 'reset';
  resetBtn.className = 'reset-btn';

  controls.appendChild(startBtn);
  controls.appendChild(resetBtn);
  app.appendChild(controls);

  // Create app display area with canvas
  const display = document.createElement('div');
  display.className = 'app-display';
  
  const gameTitle = document.createElement('h2');
  gameTitle.textContent = 'Snake Game';
  display.appendChild(gameTitle);
  
  const canvas = document.createElement('canvas');
  canvas.className = 'game-canvas';
  canvas.width = 400;
  canvas.height = 400;
  display.appendChild(canvas);
  
  const scoreDisplay = document.createElement('div');
  scoreDisplay.className = 'score-display';
  scoreDisplay.textContent = 'Score: 0';
  display.appendChild(scoreDisplay);
  
  const status = document.createElement('p');
  status.className = 'app-status';
  status.textContent = 'Press Start to begin. Use arrow keys to move.';
  display.appendChild(status);
  
  app.appendChild(display);

  const ctx = canvas.getContext('2d');
  const gridSize = 20;
  const tileCount = canvas.width / gridSize;

  let isRunning = false;
  let snake = [{ x: 10, y: 10 }];
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let food = { x: 15, y: 15 };
  let score = 0;
  let gameLoop = null;

  function generateFood() {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
    // Ensure food doesn't spawn on snake
    while (snake.some(seg => seg.x === food.x && seg.y === food.y)) {
      food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
    }
    log('Food spawned at', food);
  }

  function draw() {
    // Clear canvas
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e0e7ff';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(canvas.width, i * gridSize);
      ctx.stroke();
    }

    // Draw snake
    snake.forEach((seg, idx) => {
      ctx.fillStyle = idx === 0 ? '#10b981' : '#6ee7b7';
      ctx.fillRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });

    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(food.x * gridSize + 1, food.y * gridSize + 1, gridSize - 2, gridSize - 2);
  }

  function update() {
    direction = nextDirection;
    const head = snake[0];
    const newHead = {
      x: (head.x + direction.x + tileCount) % tileCount,
      y: (head.y + direction.y + tileCount) % tileCount
    };

    // Check collision with self
    if (snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      log('Game Over! Hit self. Final score:', score);
      resetApp();
      return;
    }

    snake.unshift(newHead);

    // Check if ate food
    if (newHead.x === food.x && newHead.y === food.y) {
      score += 10;
      scoreDisplay.textContent = `Score: ${score}`;
      log('Food eaten! Score:', score);
      generateFood();
    } else {
      snake.pop();
    }
  }

  function startApp() {
    isRunning = true;
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    scoreDisplay.textContent = 'Score: 0';
    status.textContent = 'Game running! Use arrow keys to move.';
    startBtn.disabled = true;
    generateFood();
    log('Snake game started');

    gameLoop = setInterval(() => {
      update();
      draw();
    }, 100);
  }

  function resetApp() {
    isRunning = false;
    clearInterval(gameLoop);
    gameLoop = null;
    status.textContent = 'Game Over. Press Start to play again.';
    startBtn.disabled = false;
    log('Snake game reset');
    draw();
  }

  // Control button click handling
  controls.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (action === 'start') startApp();
    if (action === 'reset') resetApp();
  });

  // Arrow key controls
  document.addEventListener('keydown', (e) => {
    if (!isRunning) return;
    const key = e.key;
    if (key === 'ArrowUp' && direction.y === 0) { nextDirection = { x: 0, y: -1 }; e.preventDefault(); log('Arrow Up pressed'); }
    if (key === 'ArrowDown' && direction.y === 0) { nextDirection = { x: 0, y: 1 }; e.preventDefault(); log('Arrow Down pressed'); }
    if (key === 'ArrowLeft' && direction.x === 0) { nextDirection = { x: -1, y: 0 }; e.preventDefault(); log('Arrow Left pressed'); }
    if (key === 'ArrowRight' && direction.x === 0) { nextDirection = { x: 1, y: 0 }; e.preventDefault(); log('Arrow Right pressed'); }
  });

  // Initial draw
  draw();

  // Log clicks anywhere inside #app
  app.addEventListener('click', (e) => {
    log('App clicked at', { x: e.clientX, y: e.clientY, target: e.target.nodeName });
  });

  // Keyboard shortcuts: 's' to start, 'r' to reset — only when focus is not in an input
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return; // ignore when typing
    if (!isRunning && (e.key === 's' || e.key === 'S')) { startApp(); log("Key 's' pressed — start game"); }
    if (isRunning && (e.key === 'r' || e.key === 'R')) { resetApp(); log("Key 'r' pressed — reset game"); }
  });

  log('Interactivity initialized');
});
