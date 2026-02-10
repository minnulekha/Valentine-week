const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });

// --- SETTINGS ---
const CONFIG = {
    gravity: 0.0025,
    jumpForce: 0.055, 
    speedStart: 0.007,
    speedMax: 0.025,
    colors: {
        road: '#2A0509',
        roadLine: 'rgba(255, 215, 0, 0.6)', 
        laneHighlight: 'rgba(255, 255, 255, 0.08)', 
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

let player = {
    lane: 1, x: 1, y: 0, vy: 0,
    isJumping: false,
    magnet: false, magnetTimer: 0,
    shield: false,
    runAnim: 0
};

const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

// --- INIT ---
function resize() {
    const dpr = Math.min(window.devicePixelRatio, 2); 
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
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

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') handleInput('left');
    if (e.key === 'ArrowRight') handleInput('right');
    if (e.key === ' ' || e.key === 'ArrowUp') handleInput('jump');
});

let touchX = 0, touchY = 0;
document.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
}, {passive: false});

document.addEventListener('touchend', e => {
    if (!state.running) return;
    let dx = e.changedTouches[0].clientX - touchX;
    let dy = e.changedTouches[0].clientY - touchY;
    
    if (Math.abs(dx) > 30) handleInput(dx > 0 ? 'right' : 'left');
    else if (dy < -30 || Math.abs(dx) < 10) handleInput('jump');
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
    loop();
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

function spawnObject() {
    const lane = Math.floor(Math.random() * 3);
    const r = Math.random();
    const diff = Math.min(state.score / 500, 0.4); 
    
    let type = 'good';
    let icon = ITEMS.good[Math.floor(Math.random() * ITEMS.good.length)];
    
    if (r < 0.6 - diff) type = 'good';
    else if (r < 0.85 - (diff/2)) { type = 'wall'; icon = ITEMS.wall; }
    else if (r < 0.95) { type = 'bad'; icon = ITEMS.bad[Math.floor(Math.random() * ITEMS.bad.length)]; }
    else { type = Math.random() > 0.5 ? 'magnet' : 'shield'; icon = type === 'magnet' ? ITEMS.magnet : ITEMS.shield; }

    state.objects.push({
        lane: lane, xPos: lane, z: 0.01,
        type: type, icon: icon, active: true
    });
}

function loop() {
    if (!state.running) return;

    let targetSpeed = CONFIG.speedStart + (state.score * 0.00005);
    state.speed = Math.min(targetSpeed, CONFIG.speedMax);

    player.x += (player.lane - player.x) * 0.2;
    if (player.isJumping) {
        player.y += player.vy;
        player.vy -= CONFIG.gravity;
        if (player.y <= 0) { player.y = 0; player.isJumping = false; player.vy = 0; }
    }

    if (player.magnet) {
        player.magnetTimer--;
        if (player.magnetTimer <= 0) {
            player.magnet = false;
            document.getElementById('magnetBadge').classList.add('hidden');
        }
    }

    if (state.frame++ % Math.floor(60 / (state.speed * 100)) === 0) spawnObject();

    state.objects.forEach(obj => {
        obj.z += state.speed;

        if (player.magnet && obj.type === 'good' && obj.z > 0.5) {
            obj.xPos += (player.x - obj.xPos) * 0.15;
        }

        if (obj.active && obj.z > 0.85 && obj.z < 0.95) {
            if (Math.abs(obj.xPos - player.x) < 0.4) {
                if (obj.type === 'wall' && player.y > 0.1) { }
                else if (player.y < 0.1 || obj.type !== 'wall') handleHit(obj);
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
        player.magnet = true; player.magnetTimer = 600;
        document.getElementById('magnetBadge').classList.remove('hidden');
        spawnParticles(player.x, 'cyan');
    } else if (obj.type === 'shield') {
        player.shield = true;
        document.getElementById('shieldBadge').classList.remove('hidden');
        spawnParticles(player.x, 'cyan');
    } else {
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

// --- RENDERER (WIDER & CLEARER) ---
function getScreenPos(laneX, z, yOffset = 0) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    const horizonY = h * 0.35;
    const groundHeight = h * 0.65;
    const scale = Math.pow(z, 2.5);
    
    const screenY = horizonY + (scale * groundHeight) - (yOffset * scale * 400);
    const centerX = w / 2;
    
    // WIDENED ROAD MATH
    // Road width at horizon (z=0) is now 10% of screen (was 2%)
    // Road width at bottom (z=1) is now 150% of screen (was 90%)
    const roadWidth = (w * 0.1) + (w * 1.5 * scale);
    
    // Spread lanes further apart
    const screenX = centerX + ((laneX - 1) * (roadWidth / 3.5)); // Divide by 3.5 instead of 2.5 for spread

    return { x: screenX, y: screenY, scale: scale, roadW: roadWidth };
}

function draw() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    // 1. Sky
    const hY = h * 0.35;
    const grad = ctx.createLinearGradient(0, 0, 0, hY);
    grad.addColorStop(0, CONFIG.colors.skyTop);
    grad.addColorStop(1, CONFIG.colors.skyBot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, hY);

    // 2. Road Background
    const roadGrad = ctx.createLinearGradient(0, hY, 0, h);
    roadGrad.addColorStop(0, '#1a0000');
    roadGrad.addColorStop(1, '#2d0505');
    
    // Calculate Road Boundaries (Wider)
    const pFarLeft = getScreenPos(-0.8, 0); 
    const pFarRight = getScreenPos(2.8, 0);
    const pNearLeft = getScreenPos(-0.8, 1);
    const pNearRight = getScreenPos(2.8, 1);

    ctx.fillStyle = roadGrad;
    ctx.beginPath();
    ctx.moveTo(pFarLeft.x, hY);
    ctx.lineTo(pFarRight.x, hY);
    ctx.lineTo(pNearRight.x, h);
    ctx.lineTo(pNearLeft.x, h);
    ctx.fill();

    // 3. Lane Markers (Clearer Paths)
    ctx.fillStyle = CONFIG.colors.laneHighlight;
    for(let i=0; i<3; i++) {
        // Draw a wide strip for each lane
        const p1 = getScreenPos(i - 0.3, 0);
        const p2 = getScreenPos(i + 0.3, 0);
        const p3 = getScreenPos(i + 0.3, 1);
        const p4 = getScreenPos(i - 0.3, 1);
        
        ctx.beginPath();
        ctx.moveTo(p1.x, hY);
        ctx.lineTo(p2.x, hY);
        ctx.lineTo(p3.x, h);
        ctx.lineTo(p4.x, h);
        ctx.fill();
    }

    // 4. Lane Dividers
    ctx.strokeStyle = CONFIG.colors.roadLine;
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Lines between lanes (at 0.5 and 1.5)
    const dividers = [-0.5, 0.5, 1.5, 2.5];
    dividers.forEach(d => {
        const top = getScreenPos(d, 0);
        const bot = getScreenPos(d, 1);
        ctx.moveTo(top.x, hY);
        ctx.lineTo(bot.x, h);
    });
    ctx.stroke();

    // 5. Player Marker
    const pCenter = getScreenPos(player.x, 0.9);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(pCenter.x, pCenter.y + 40, 60, 20, 0, 0, Math.PI*2);
    ctx.stroke();

    // 6. Objects
    state.objects.sort((a,b) => a.z - b.z);
    
    state.objects.forEach(obj => {
        if (!obj.active) return;
        const xPos = player.magnet && obj.type === 'good' ? obj.xPos : obj.lane;
        const p = getScreenPos(xPos, obj.z);
        const size = 60 * p.scale;

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + size/2, size/1.5, size/5, 0, 0, Math.PI*2);
        ctx.fill();

        ctx.font = `${size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF'; 
        ctx.fillText(obj.icon, p.x, p.y);
    });

    // 7. Player
    const pp = getScreenPos(player.x, 0.9, player.y);
    const pSize = 90;
    
    ctx.save();
    ctx.translate(pp.x, pp.y);
    const lean = (player.x - player.lane) * -0.2;
    ctx.rotate(lean);
    player.runAnim += 0.2;
    if (!player.isJumping) ctx.translate(0, Math.sin(player.runAnim) * 5);
    
    ctx.font = `${pSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏃', 0, 0);
    
    if (player.shield) {
        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI*2);
        ctx.stroke();
    }
    
    ctx.restore();

    // 8. Particles
    drawParticles();
}

function spawnParticles(laneX, type) {
    if (isMobile && state.particles.length > 20) return;
    
    const p = getScreenPos(laneX, 0.9);
    const color = type === 'gold' ? '#D4AF37' : (type === 'red' ? '#8B0000' : '#FFF');
    const count = isMobile ? 5 : 10;
    
    for(let i=0; i<count; i++) {
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
        p.life -= 0.08;
        if (p.life <= 0) state.particles.splice(i, 1);
        
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, isMobile ? 3 : 4, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);