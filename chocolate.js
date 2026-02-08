/* =====================================================
   CHOCOLATE DAY - STABLE GAME LOGIC
   ===================================================== */

const photos = [
    'assets/choc1.jpeg', 'assets/choc2.jpeg', 'assets/choc3.jpeg',
    'assets/choc4.jpeg', 'assets/choc5.jpeg', 'assets/choc6.jpeg'
];

let gameCards = [...photos, ...photos];
let flippedCards = [];
let matchedPairs = 0;
let canFlip = false;

const grid = document.getElementById('gameGrid');
const pieces = document.querySelectorAll('.choc-piece');
const crunch = document.getElementById('crunchSound');

/* --- Modal Controls --- */
function closeStartModal() {
    document.getElementById('startModal').style.display = 'none';
    initGame(); // The game only starts when they are ready
}

function showWin() {
    document.getElementById('winModal').style.display = 'flex';
}

/* --- Game Initialization Logic --- */
function initGame() {
    // Clear the grid in case of restart
    grid.innerHTML = '';
    
    // Shuffle the cards
    gameCards.sort(() => Math.random() - 0.5);

    gameCards.forEach((imgSrc) => {
        const card = document.createElement('div');
        card.classList.add('choc-card');
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">🍫</div>
                <div class="card-back"><img src="${imgSrc}" onerror="this.src='https://via.placeholder.com/200?text=Sweet+Memory'"></div>
            </div>
        `;
        card.dataset.val = imgSrc;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });

    // Start-up sequence: Brief glimpse of all cards
    setTimeout(() => {
        document.querySelectorAll('.choc-card').forEach(c => c.classList.add('flipped'));
        setTimeout(() => {
            document.querySelectorAll('.choc-card').forEach(c => c.classList.remove('flipped'));
            canFlip = true;
        }, 1200);
    }, 600);
}

/* --- Core Gameplay --- */
function flipCard() {
    if (!canFlip || flippedCards.length >= 2 || this.classList.contains('flipped')) return;
    
    this.classList.add('flipped');
    flippedCards.push(this);
    
    if (flippedCards.length === 2) checkMatch();
}

function checkMatch() {
    canFlip = false;
    const [c1, c2] = flippedCards;

    if (c1.dataset.val === c2.dataset.val) {
        matchedPairs++;
        
        // Bite Sound & Animation
        if (crunch) {
            crunch.currentTime = 0;
            crunch.play().catch(() => {}); 
        }

        if(pieces[matchedPairs - 1]) {
            pieces[matchedPairs - 1].classList.add('eaten');
        }

        flippedCards = [];
        canFlip = true;
        
        if (matchedPairs === 6) {
            setTimeout(showWin, 1000);
        }
    } else {
        // Not a match: flip back
        setTimeout(() => {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
            flippedCards = [];
            canFlip = true;
        }, 1000);
    }
}

/* --- Visual Effects (Hearts & Cursor) --- */
setInterval(() => {
    const heart = document.createElement('div');
    heart.className = 'heart-particle';
    heart.innerHTML = '❤';
    heart.style.left = Math.random() * 100 + 'vw';
    const duration = Math.random() * 3 + 4;
    heart.style.animationDuration = duration + 's';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000);
}, 800);

document.addEventListener('mousemove', e => {
    const cursor = document.getElementById('heart-cursor');
    if(cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});