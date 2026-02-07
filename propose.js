/* =====================================================
   PROPOSE DAY – CLEAN FINAL LOGIC (Stable Version)
===================================================== */

const memoryData = [
    { t: "The First Text", m: "That night you texted me 'not sleeping?'... I didn't know it was the start of everything.", i: "assets/pro1.jpeg" },
    { t: "The 10s Call", m: "Our first call lasted 10 seconds, but somehow it felt special.", i: "assets/pro2.jpeg" },
    { t: "Late Night Talks", m: "Somewhere between those calls, you became my home.", i: "assets/pro3.jpeg" },
    { t: "The Support", m: "You stayed when things were heavy. You became my strength.", i: "assets/pro4.jpeg" },
    { t: "The Miles", m: "Distance taught us that our love is stronger than geography.", i: "assets/pro5.jpeg" },
    { t: "The Future", m: "I want every chapter of my life to have you in it.", i: "assets/pro6.jpeg" }
];

/* =========================
   CREATE MEMORY CARDS
========================= */

const grid = document.getElementById('memoryGrid');
let flippedCards = 0;

memoryData.forEach(data => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
        <div class="card-inner">
            <div class="card-front">
                <img src="${data.i}">
                <p class="card-title">${data.t}</p>
            </div>
            <div class="card-back">
                <p>${data.m}</p>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        if (!card.classList.contains('flipped')) {
            card.classList.add('flipped');
            flippedCards++;

            if (flippedCards === 6) {
                setTimeout(openProposal, 1000);
            }
        }
    });

    grid.appendChild(card);
});


/* =========================
   OPEN PROPOSAL MODAL
========================= */

function openProposal() {
    const modal = document.getElementById('proposalModal');
    const ringBox = document.getElementById('ringBox');

    modal.style.display = 'flex';

    setTimeout(() => {
        ringBox.classList.add('open');
    }, 600);
}


/* =========================
   YES / NO BUTTON LOGIC
   (CLEAN + MOBILE FRIENDLY)
========================= */

const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const btnGroup = document.getElementById('btnGroup');

yesBtn.addEventListener('click', showSuccess);

/* NO → swap positions only */
noBtn.addEventListener('click', () => {
    btnGroup.classList.toggle('swap');
});


function showSuccess() {
    document.getElementById('proposalModal').style.display = 'none';
    document.getElementById('successSection').style.display = 'flex';
}


/* =========================
   GOLD HEART CURSOR
========================= */

const cursor = document.getElementById('heart-cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});


/* =========================
   FALLING HEARTS ANIMATION
========================= */

setInterval(() => {
    const heart = document.createElement('div');
    heart.className = 'falling-heart';
    heart.innerHTML = '❤';

    heart.style.left = Math.random() * 100 + 'vw';

    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 6000);
}, 500);
/* =========================
   FALLING HEARTS ANIMATION
========================= */

setInterval(() => {
    const heart = document.createElement('div');
    heart.className = 'falling-heart';
    heart.innerHTML = '❤';

    // Random horizontal position
    heart.style.left = Math.random() * 100 + 'vw';
    
    // Random size for variety
    const size = Math.random() * 15 + 10 + 'px';
    heart.style.fontSize = size;

    // Random duration between 3s and 6s for natural flow
    const duration = Math.random() * 3 + 3 + 's';
    heart.style.animationDuration = duration;

    // Random opacity to make it look cinematic
    heart.style.opacity = Math.random() * 0.5 + 0.5;

    document.body.appendChild(heart);

    // Remove from DOM after animation ends to keep the site fast
    setTimeout(() => {
        heart.remove();
    }, 6000);
}, 500);