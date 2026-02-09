/* ================= VARIABLES ================= */
let selectedItem = null; // The item currently selected for editing
let activeDragItem = null; // The item currently being dragged
let isHugMode = false;
let hugPercent = 0;
let hugInterval = null;

// DOM Elements
const teddyCanvas = document.getElementById('teddyCanvas');
const editControls = document.getElementById('editControls');
const controlsPanel = document.getElementById('controlsPanel');
const sizeSlider = document.getElementById('sizeSlider');
const rotateSlider = document.getElementById('rotateSlider');
const nameInput = document.getElementById('nameInput');
/* ... (Keep existing variables: selectedItem, isHugMode, etc.) ... */

// ================= DONE & PREVIEW LOGIC =================

const finishBuildBtn = document.getElementById('finishBuildBtn');
const previewPopup = document.getElementById('previewPopup');
const teddySnapshot = document.getElementById('teddySnapshot');
const startHugBtn = document.getElementById('startHugBtn');
const editMoreBtn = document.getElementById('editMoreBtn');
const mainActionArea = document.getElementById('mainActionArea');
/* ================= GLOBAL CURSOR LOGIC ================= */
const cursor = document.getElementById('heart-cursor');

// 1. Move cursor anywhere on the page
document.addEventListener('mousemove', (e) => {
    // Check if cursor exists to avoid errors
    if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});

// 2. Add 'clicking' animation class
document.addEventListener('mousedown', () => {
    if(cursor) cursor.classList.add('clicking');
});

document.addEventListener('mouseup', () => {
    if(cursor) cursor.classList.remove('clicking');
});
// 1. Click "I'm Done"
finishBuildBtn.addEventListener('click', () => {
    deselectItem(); // Remove any selection borders first
    
    // Use html2canvas to screenshot the teddyCanvas
    html2canvas(document.getElementById('teddyCanvas'), {
        backgroundColor: null, // Transparent background if possible
        scale: 2 // High res
    }).then(canvas => {
        // Clear previous
        teddySnapshot.innerHTML = '';
        // Append new canvas (or convert to img)
        teddySnapshot.appendChild(canvas);
        
        // Show Popup
        previewPopup.classList.remove('hidden');
    });
});

// 2. Click "Keep Editing" (Close Popup)
editMoreBtn.addEventListener('click', () => {
    previewPopup.classList.add('hidden');
});

// 3. Click "Give Him a Hug" (Start Phase 2)
startHugBtn.addEventListener('click', () => {
    previewPopup.classList.add('hidden'); // Close popup
    startHugPhase(); // Trigger the hug mode transition
});


// ================= TRANSITION FUNCTION =================
function startHugPhase() {
    isHugMode = true;
    
    // Hide Workshop UI
    controlsPanel.style.display = 'none';
    editControls.style.display = 'none';
    mainActionArea.style.display = 'none'; // Hide the "Done" button
    
    // Show Hug UI
    hugControls.classList.remove('hidden');
    
    // Text Update
    document.getElementById('pageTitle').innerText = "A Warm Squeeze";
    document.getElementById('pageSub').innerText = "Hold tight to send your love.";
    
    // Canvas Setup
    teddyCanvas.style.cursor = 'pointer';
    teddyCanvas.addEventListener('mousedown', startHug);
    teddyCanvas.addEventListener('touchstart', startHug, { passive: false });
    window.addEventListener('mouseup', stopHug);
    window.addEventListener('touchend', stopHug);
}

// ... (Rest of existing drag/drop/hug logic remains the same) ...
// ================= 1. SPAWN ITEMS =================
document.querySelectorAll('.inv-item').forEach(item => {
    item.addEventListener('click', () => spawnItem(item.dataset.emoji));
});

document.getElementById('addNameBtn').addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name) {
        spawnItem(name, true);
        nameInput.value = '';
    }
});

function spawnItem(content, isName = false) {
    if (isHugMode) return;

    const el = document.createElement('div');
    el.innerText = content;
    el.className = 'placed-item';
    if (isName) el.classList.add('name-tag-style');

    // Default transform data
    el.dataset.scale = 1;
    el.dataset.rotate = 0;

    // Center spawn
    el.style.left = '160px'; 
    el.style.top = '190px';
    el.style.transform = `translate(-50%, -50%) scale(1) rotate(0deg)`;

    // Attach Events
    addInteraction(el);
    teddyCanvas.appendChild(el);
    
    // Auto-select new item
    selectItem(el);
}

// ================= 2. SELECT & EDIT LOGIC =================
function selectItem(el) {
    if (isHugMode) return;

    // Deselect previous
    if (selectedItem) selectedItem.classList.remove('selected');
    
    selectedItem = el;
    selectedItem.classList.add('selected');

    // Show Edit Controls
    editControls.classList.remove('hidden');
    controlsPanel.classList.add('hidden'); // Hide inventory to save space

    // Sync Sliders
    sizeSlider.value = selectedItem.dataset.scale;
    rotateSlider.value = selectedItem.dataset.rotate;
}

function deselectItem() {
    if (selectedItem) {
        selectedItem.classList.remove('selected');
        selectedItem = null;
    }
    editControls.classList.add('hidden');
    controlsPanel.classList.remove('hidden');
}

// Slider Events
sizeSlider.addEventListener('input', (e) => {
    if (selectedItem) {
        const s = e.target.value;
        const r = selectedItem.dataset.rotate;
        selectedItem.dataset.scale = s;
        updateTransform(selectedItem, s, r);
    }
});

rotateSlider.addEventListener('input', (e) => {
    if (selectedItem) {
        const r = e.target.value;
        const s = selectedItem.dataset.scale;
        selectedItem.dataset.rotate = r;
        updateTransform(selectedItem, s, r);
    }
});

function updateTransform(el, scale, rotate) {
    // Keep centering translate, apply scale & rotate
    el.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`;
}

// Delete & Done Buttons
document.getElementById('deleteItemBtn').addEventListener('click', () => {
    if (selectedItem) {
        selectedItem.remove();
        deselectItem();
    }
});

document.getElementById('closeControlsBtn').addEventListener('click', deselectItem);

// Click background to deselect
teddyCanvas.addEventListener('click', (e) => {
    if (e.target === teddyCanvas || e.target.classList.contains('base-teddy')) {
        deselectItem();
    }
});

// ================= 3. DRAG LOGIC (Free Move) =================
function addInteraction(el) {
    el.addEventListener('mousedown', dragStart);
    el.addEventListener('touchstart', dragStart, { passive: false });
    
    // Tap to select logic handled via dragStart + click distinction
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectItem(el);
    });
}

let dragOffsetX = 0;
let dragOffsetY = 0;

function dragStart(e) {
    if (isHugMode) return;
    // Don't prevent default immediately to allow click events to bubble if it's just a tap
    // But for dragging we need to stop propagation usually
    
    activeDragItem = e.target;
    selectItem(activeDragItem); // Select item on drag start

    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    const rect = activeDragItem.getBoundingClientRect();
    const containerRect = teddyCanvas.getBoundingClientRect();

    // Calculate offset from center of item (since we use translate -50%)
    // Actually simpler: Calculate where mouse is relative to item center
    // Item center X = rect.left + rect.width/2
    
    dragOffsetX = clientX - (rect.left + rect.width/2);
    dragOffsetY = clientY - (rect.top + rect.height/2);

    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchmove', dragMove, { passive: false });
    document.addEventListener('touchend', dragEnd);
}

function dragMove(e) {
    if (!activeDragItem) return;
    if (e.type === 'touchmove') e.preventDefault();

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    
    const containerRect = teddyCanvas.getBoundingClientRect();

    // Calculate new position relative to container
    let newLeft = clientX - containerRect.left - dragOffsetX;
    let newTop = clientY - containerRect.top - dragOffsetY;

    // Apply
    activeDragItem.style.left = newLeft + 'px';
    activeDragItem.style.top = newTop + 'px';
}

function dragEnd() {
    activeDragItem = null;
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchmove', dragMove);
    document.removeEventListener('touchend', dragEnd);
}

// ================= 4. HUG PHASE & CURSOR =================
const nextBtn = document.getElementById('nextBtn');
const hugControls = document.getElementById('hugControls');

nextBtn.addEventListener('click', () => {
    isHugMode = true;
    deselectItem();
    controlsPanel.style.display = 'none';
    editControls.style.display = 'none';
    nextBtn.style.display = 'none';
    hugControls.classList.remove('hidden');
    
    document.getElementById('pageTitle').innerText = "A Warm Squeeze";
    document.getElementById('pageSub').innerText = "Hold tight to send your love.";
    
    teddyCanvas.style.cursor = 'pointer';
    teddyCanvas.addEventListener('mousedown', startHug);
    teddyCanvas.addEventListener('touchstart', startHug, { passive: false });
    window.addEventListener('mouseup', stopHug);
    window.addEventListener('touchend', stopHug);
});

// Cursor
document.addEventListener('mousemove', (e) => {
    const cursor = document.getElementById('heart-cursor');
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Hug Logic
function startHug(e) {
    if(e.type === 'touchstart') e.preventDefault();
    teddyCanvas.classList.add('teddy-squeezing');
    
    if (!hugInterval) {
        hugInterval = setInterval(() => {
            hugPercent += 1.5;
            if(hugPercent > 100) hugPercent = 100;
            document.getElementById('hugProgress').style.width = hugPercent + '%';
            
            spawnBurstHeart(e);
            
            if(hugPercent >= 100) {
                stopHug();
                setTimeout(() => document.getElementById('finalPopup').classList.remove('hidden'), 300);
            }
        }, 40);
    }
}

function stopHug() {
    teddyCanvas.classList.remove('teddy-squeezing');
    clearInterval(hugInterval);
    hugInterval = null;
}

function spawnBurstHeart(e) {
    // Logic to spawn hearts (same as previous code)
    const h = document.createElement('div');
    h.innerText = '❤️';
    h.style.position = 'fixed';
    
    let cx = e.touches ? e.touches[0].clientX : e.clientX;
    let cy = e.touches ? e.touches[0].clientY : e.clientY;
    
    if(!cx) { // fallback
        const rect = teddyCanvas.getBoundingClientRect();
        cx = rect.left + rect.width/2;
        cy = rect.top + rect.height/2;
    }

    h.style.left = cx + 'px';
    h.style.top = cy + 'px';
    h.style.pointerEvents = 'none';
    h.style.fontSize = Math.random()*20+10+'px';
    h.style.zIndex = 5000;
    document.body.appendChild(h);

    const dx = (Math.random()-0.5)*200;
    const dy = (Math.random()-0.5)*200 - 50;

    h.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
    ], { duration: 800, easing: 'ease-out' });
    
    setTimeout(() => h.remove(), 800);
}

// Falling Hearts BG
setInterval(() => {
    const h = document.createElement('div');
    h.innerText = ['❤️','🧸','✨'][Math.floor(Math.random()*3)];
    h.style.position = 'fixed';
    h.style.left = Math.random()*100 + 'vw';
    h.style.top = '-50px';
    h.style.opacity = Math.random();
    h.style.fontSize = '20px';
    h.style.animation = `fall ${Math.random()*3+2}s linear`;
    document.getElementById('falling-hearts-container').appendChild(h);
    setTimeout(() => h.remove(), 5000);
}, 500);

const style = document.createElement('style');
style.innerHTML = `@keyframes fall { to { transform: translateY(110vh) rotate(360deg); } }`;
document.head.appendChild(style);
