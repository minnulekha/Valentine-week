const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- GAME SETTINGS ---
const CONFIG = {
    laneCount: 3,
    gravity: 0.002,     // Physics gravity
    jumpForce: 0.048,   // Jump Height
    speedStart: 0.006,  // Initial Speed
    speedMax: 0.02,     // Cap for maximum difficulty
    colors: {
        road: '#2A0509',
        roadLine: 'rgba(212, 175, 55, 0.3)',
        skyTop: '#1a0505',
        skyBot: '#4a080d'
    }
};

// --- ASSETS ---
const ITEMS = {
    good: ['💍', '💌', '🤞', '✨'],
    bad: ['💔', '🥀', '🚫'],
    wall: '🚧',
    magnet: '🧲',
    shield: '🛡️'
};

// --- STATE ---
let state = {
    running: false,
    score: 0,
    lives: 3,
    speed: CONFIG.speedStart,
    frame: 0,
    objects: [],
    particles: []
};

// Player Object
let player = {
    lane: 1, // 0=Left, 1=Center, 2=Right
    x: 1,    // Smooth X position
    y: 0,    // Height (0=Ground)
    vy: 0,   // Vertical Velocity
    isJumping: false,
    magnet: false,
    magnetTimer: 0,
    shield: false,
    runAnim: 0
};

// --- INITIALIZATION ---
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- CONTROLS ---
function handleInput(action) {
    if (!state.running) return;
    
    if (action === 'left') player.lane = Math.max(0, player.lane - 1);
    if (action === 'right') player.lane = Math.min(2, player.lane + 1);
    
    if (action === 'jump' && !player.isJumping) {
        player.isJumping = true;
        player.vy = CONFIG.jumpForce;
    }
}

// Keyboard
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') handleInput('left');
    if (e.key === 'ArrowRight') handleInput('right');
    if (e.key === ' ' || e.key === 'ArrowUp') handleInput('jump');
});

// Touch
let touchX = 0;
let touchY = 0;
document.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
}, {passive: false});

document.addEventListener('touchend', e => {
    if (!state.running) return;
    let dx = e.changedTouches[0].clientX - touchX;
    let dy = e.changedTouches[0].clientY - touchY;
    
    if (Math.abs(dx) > 40) handleInput(dx > 0 ? 'right' : 'left');
    else if (Math.abs(dy) < 10 || dy < -30) handleInput('jump');
}, {passive: false});

// --- GAME LOGIC ---
function startGame() {
    state.running = true;
    state.score = 0;
    state.lives = 3;
    state.speed = CONFIG.speedStart;
    state.objects = [];
    state.particles = [];
    
    player.lane = 1;
    player.x = 1;
    player.y = 0;
    player.vy = 0;
    player.magnet = false;
    player.shield = false;

    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('magnetBadge').classList.add('hidden');
    document.getElementById('shieldBadge').classList.add('hidden');
    
    updateHUD();
    requestAnimationFrame(loop);
}

function gameOver() {
    state.running = false;
    document.getElementById('finalScore').innerText = state.score;
    let best = localStorage.getItem('promiseHighScore') || 0;
    if(state.score > best) {
        best = state.score;
        localStorage.setItem('promiseHighScore', best);
    }
    document.getElementById('highScore').innerText = best;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

// === DIFFICULTY SCALING LOGIC ===
function spawnObject() {
    const lane = Math.floor(Math.random() * 3);
    const r = Math.random();
    
    // Difficulty Factor (0.0 to 0.5) based on score
    // As score goes up, difficulty factor increases, making good items rarer
    const difficulty = Math.min(state.score / 500, 0.4); 
    
    let type = 'good';
    let icon = ITEMS.good[Math.floor(Math.random() * ITEMS.good.length)];
    
    // Probabilities change with score
    // Base Good chance: 60% -> drops to 20% at high score
    if (r < 0.6 - difficulty) {
        type = 'good';
    } 
    // Wall chance: 20% -> increases
    else if (r < 0.85 - (difficulty/2)) {
        type = 'wall';
        icon = ITEMS.wall;
    } 
    // Bad Promise chance increases
    else if (r < 0.95) {
        type = 'bad';
        icon = ITEMS.bad[Math.floor(Math.random() * ITEMS.bad.length)];
    } 
    // Powerups (rare)
    else {
        type = Math.random() > 0.5 ? 'magnet' : 'shield';
        icon = type === 'magnet' ? ITEMS.magnet : ITEMS.shield;
    }

    state.objects.push({
        lane: lane,
        xPos: lane, 
        z: 0.01, 
        type: type,
        icon: icon,
        active: true
    });
}

function loop() {
    if (!state.running) return;

    // 1. DYNAMIC SPEED (Increases with Score)
    // Base speed + (score * small factor), capped at speedMax
    let targetSpeed = CONFIG.speedStart + (state.score * 0.00005);
    state.speed = Math.min(targetSpeed, CONFIG.speedMax);

    // 2. PLAYER PHYSICS
    player.x += (player.lane - player.x) * 0.2; // Smooth Slide

    if (player.isJumping) {
        player.y += player.vy;
        player.vy -= CONFIG.gravity;

        if (player.y <= 0) {
            player.y = 0;
            player.isJumping = false;
            player.vy = 0;
        }
    }

    // Powerup Timers
    if (player.magnet) {
        player.magnetTimer--;
        if (player.magnetTimer <= 0) {
            player.magnet = false;
            document.getElementById('magnetBadge').classList.add('hidden');
        }
    }

    // 3. SPAWNER
    // Spawn frequency increases with speed
    // Higher speed = smaller divisor = more frequent spawns
    if (state.frame++ % Math.floor(60 / (state.speed * 100)) === 0) {
        spawnObject();
    }

    // 4. OBJECT LOGIC
    state.objects.forEach(obj => {
        obj.z += state.speed;

        // Magnet Pull
        if (player.magnet && obj.type === 'good' && obj.z > 0.5) {
            obj.xPos += (player.x - obj.xPos) * 0.15;
        }

        // Collision Zone
        if (obj.active && obj.z > 0.85 && obj.z < 0.95) {
            const laneDiff = Math.abs(obj.xPos - player.x);
            
            if (laneDiff < 0.4) {
                // If it's a wall, you can jump over it
                if (obj.type === 'wall' && player.y > 0.1) {
                    // Safe jump
                } else if (player.y < 0.1 || obj.type !== 'wall') {
                    handleHit(obj);
                }
            }
        }
    });

    state.objects = state.objects.filter(o => o.z < 1.2 && o.active);
    draw();
    requestAnimationFrame(loop);
}

function handleHit(obj) {
    obj.active = false;
    
    if (obj.type === 'good') {
        state.score += 10;
        spawnParticles(player.x, 'gold');
    } else if (obj.type === 'magnet') {
        player.magnet = true;
        player.magnetTimer = 600; 
        document.getElementById('magnetBadge').classList.remove('hidden');
        spawnParticles(player.x, 'blue');
    } else if (obj.type === 'shield') {
        player.shield = true;
        document.getElementById('shieldBadge').classList.remove('hidden');
        spawnParticles(player.x, 'cyan');
    } else {
        // Bad or Wall
        if (player.shield) {
            player.shield = false;
            document.getElementById('shieldBadge').classList.add('hidden');
            spawnParticles(player.x, 'white');
        } else {
            state.lives--;
            spawnParticles(player.x, 'red');
            if (state.lives <= 0) gameOver();
        }
    }
    updateHUD();
}

function updateHUD() {
    document.getElementById('scoreVal').innerText = state.score;
    document.getElementById('livesContainer').innerText = '❤️ '.repeat(state.lives);
}

// --- RENDER ENGINE ---
function getScreenPos(laneX, z, yOffset = 0) {
    const horizonY = canvas.height * 0.35;
    const groundHeight = canvas.height * 0.65;
    const scale = Math.pow(z, 2.5); 
    
    const screenY = horizonY + (scale * groundHeight) - (yOffset * scale * 400);
    const centerX = canvas.width / 2;
    
    const roadWidth = (canvas.width * 0.02) + (canvas.width * 0.9 * scale);
    const laneOffset = laneX - 1; 
    const screenX = centerX + (laneOffset * (roadWidth / 2.5));

    return { x: screenX, y: screenY, scale: scale };
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky
    const hY = canvas.height * 0.35;
    const grad = ctx.createLinearGradient(0, 0, 0, hY);
    grad.addColorStop(0, CONFIG.colors.skyTop);
    grad.addColorStop(1, CONFIG.colors.skyBot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, hY);

    // Road Lines
    ctx.strokeStyle = CONFIG.colors.roadLine;
    ctx.lineWidth = 2;
    for (let i = 0; i <= 3; i++) {
        const topX = (canvas.width/2) + (i - 1.5) * (canvas.width * 0.02);
        const botX = (canvas.width/2) + (i - 1.5) * (canvas.width * 0.5);
        ctx.beginPath();
        ctx.moveTo(topX, hY);
        ctx.lineTo(botX, canvas.height);
        ctx.stroke();
    }

    // Lane Highlight (Where player is)
    const pCenter = getScreenPos(player.x, 0.9);
    ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
    ctx.beginPath();
    ctx.ellipse(pCenter.x, pCenter.y + 40, 60, 20, 0, 0, Math.PI*2);
    ctx.fill();

    // Objects
    state.objects.sort((a,b) => a.z - b.z);
    state.objects.forEach(obj => {
        if (!obj.active) return;
        const xPos = player.magnet && obj.type === 'good' ? obj.xPos : obj.lane;
        const p = getScreenPos(xPos, obj.z);
        const size = 60 * p.scale;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + size/2, size/1.5, size/5, 0, 0, Math.PI*2);
        ctx.fill();

        // Icon
        ctx.font = `${size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (obj.type === 'good' || obj.type === 'magnet') {
            ctx.shadowColor = CONFIG.colors.gold;
            ctx.shadowBlur = 20 * p.scale;
        }
        ctx.fillText(obj.icon, p.x, p.y);
        ctx.shadowBlur = 0;
    });

    // Player
    const pp = getScreenPos(player.x, 0.9, player.y);
    const pSize = 90;

    ctx.font = `${pSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(pp.x, pp.y);
    const lean = (player.x - player.lane) * -0.2;
    ctx.rotate(lean);
    player.runAnim += 0.2;
    if (!player.isJumping) ctx.translate(0, Math.sin(player.runAnim) * 5);

    // Shield Aura
    if (player.shield) {
        ctx.shadowColor = 'cyan';
        ctx.shadowBlur = 20;
    }

    ctx.fillText('🏃', 0, 0); 
    ctx.restore();
    ctx.shadowBlur = 0;

    // Particles
    drawParticles();
}

function spawnParticles(laneX, type) {
    const p = getScreenPos(laneX, 0.9);
    const color = type === 'gold' ? '#D4AF37' : (type === 'red' ? '#8B0000' : '#FFF');
    for(let i=0; i<8; i++) {
        state.particles.push({
            x: p.x, y: p.y,
            vx: (Math.random()-0.5)*10,
            vy: (Math.random()-0.5)*10,
            life: 1, color: color
        });
    }
}

function drawParticles() {
    state.particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) state.particles.splice(i, 1);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);