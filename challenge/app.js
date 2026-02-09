// Configuration V2
const CONFIG = {
    gravity: 0.5,
    thresholds: [5, 25, 75, 200, 400, 1000], // Faster progression (approx 50% reduction)
    assets: {
        bgDry: 'assets/dry_earth_background_1770494098480.png',
        bgLush: 'assets/lush_garden_background_1770494115381.png',
        tulsi: 'assets/tulsi_pot_1770494129520.png',
        tree: 'assets/mango_tree_1770494144009.png',
        rangoli: 'assets/rangoli_design_1770494159591.png',
        peacock: 'assets/peacock_bird_1770494172864.png'
    }
};

// Game State
const state = {
    clicks: 0,
    stage: 0,
    resources: { water: 0, life: 0 },
    particles: [],
    lastFrameTime: 0,
    entities: [],
    transitionProgress: 0,
    assets: {},
    loaded: false,
    audioInitialized: false
};

// Audio Engine (Web Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioSystem = {
    oscillators: [],
    gainNodes: [],
    masterGain: null,
    volumeState: 2, // 2: Normal, 1: Low, 0: Mute

    init: () => {
        if (state.audioInitialized) return;
        state.audioInitialized = true;
        audioCtx.resume();

        // Master Gain for Volume Control
        audioSystem.masterGain = audioCtx.createGain();
        audioSystem.masterGain.connect(audioCtx.destination);
        audioSystem.masterGain.gain.value = 1.0;

        // Create base drone (Sine wave, low frequency)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 110; // A2
        osc.connect(gain);
        gain.connect(audioSystem.masterGain); // Connect to master
        gain.gain.value = 0.05; // Relative mix volume
        osc.start();

        audioSystem.oscillators.push(osc);
        audioSystem.gainNodes.push(gain);
    },

    updateStage: (stage) => {
        if (!state.audioInitialized) return;

        // Add layers based on stage
        if (stage === 1 && audioSystem.oscillators.length < 2) {
            // Add a fifth (E3)
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.value = 164.81;
            osc.connect(gain);
            gain.connect(audioSystem.masterGain);
            gain.gain.value = 0.03;
            osc.start();
            audioSystem.oscillators.push(osc);
            audioSystem.gainNodes.push(gain);
        }

        if (stage === 3 && audioSystem.oscillators.length < 3) {
            // Add a high shimmering note
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = 440; // A4
            osc.connect(gain);
            gain.connect(audioSystem.masterGain);
            gain.gain.value = 0.01;
            osc.start();
            audioSystem.oscillators.push(osc);
            audioSystem.gainNodes.push(gain);
        }
    },

    cycleVolume: () => {
        if (!audioSystem.masterGain) return '🔊';

        audioSystem.volumeState = (audioSystem.volumeState + 1) % 3;

        // 0: Mute, 1: Low, 2: Normal
        // Cycle order: Normal (2) -> Low (1) -> Mute (0) -> Normal (2)

        let label = '';
        switch (audioSystem.volumeState) {
            case 2: // Normal
                audioSystem.masterGain.gain.setTargetAtTime(1.0, audioCtx.currentTime, 0.1);
                label = '🔊';
                break;
            case 1: // Low
                audioSystem.masterGain.gain.setTargetAtTime(0.2, audioCtx.currentTime, 0.1);
                label = '🔉';
                break;
            case 0: // Mute
                audioSystem.masterGain.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.1);
                label = '🔇';
                break;
        }
        return label;
    }
};

// Asset Loader
const assetLoader = {
    loadAll: async () => {
        const promises = Object.entries(CONFIG.assets).map(([key, src]) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve({ key, img });
                img.onerror = reject;
            });
        });

        try {
            const results = await Promise.all(promises);
            results.forEach(({ key, img }) => state.assets[key] = img);
            state.loaded = true;
            resize(); // Initial draw
        } catch (e) {
            console.error("Asset load failed", e);
        }
    }
};

// Canvas Setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);

// Input Handling
canvas.addEventListener('mousedown', (e) => handleInput(e.clientX, e.clientY));
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleInput(touch.clientX, touch.clientY);
}, { passive: false });

function handleInput(x, y) {
    if (!state.loaded) return;

    // Init audio on first interaction
    if (!state.audioInitialized) {
        audioSystem.init();
        createMuteButton();
    }

    state.clicks++;
    state.resources.water++;
    checkProgression();
    spawnWaterParticles(x, y);

    // UI hide
    const title = document.getElementById('title-overlay');
    if (title && title.style.opacity !== '0') {
        title.style.opacity = '0';
        setTimeout(() => title.remove(), 2000);
    }

    // Check click on objects for Modals interaction (Raycast simulation)
    // For now simplistic distance check
    checkObjectClick(x, y);
}

function createMuteButton() {
    const btn = document.createElement('button');
    btn.innerHTML = '🔊';
    btn.style.position = 'absolute';
    btn.style.top = '20px';
    btn.style.right = '20px';
    btn.style.fontSize = '24px';
    btn.style.background = 'none';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.pointerEvents = 'auto'; // Enable clicks
    btn.onclick = (e) => {
        e.stopPropagation();
        const icon = audioSystem.cycleVolume();
        btn.innerHTML = icon;
    };
    document.getElementById('ui-layer').appendChild(btn);
}

function checkObjectClick(x, y) {
    const cx = canvas.width / 2;
    const groundY = canvas.height * 0.85;

    // Tulsi (Center Bottom)
    // Drawn at: groundY - pH + 120. pH varies ~240-400.
    // Approximate center: cx, groundY - 50
    if (state.stage >= 1 && Math.abs(x - cx) < 100 && Math.abs(y - (groundY - 50)) < 150) {
        showModal('Tulsi (Holy Basil)', 'Considered a goddess in plant form, Tulsi is worshipped in many Indian homes for purification and divine protection.');
        return;
    }

    // Mango Tree (Top Center)
    // Drawn at: cx - tW/2, -100. tW varies ~400-800.
    // Huge canopy at top.
    if (state.stage >= 3 && Math.abs(x - cx) < 300 && y < 300) {
        showModal('Mango Tree', 'The King of Fruits. Mango leaves are used in auspicious ceremonies, and the tree represents prosperity and fertility.');
        return;
    }

    // Rangoli (Floor Center)
    // Drawn at: cx - 150, groundY - 50. Size 300x180.
    if (state.stage >= 4 && Math.abs(x - cx) < 150 && Math.abs(y - (groundY + 40)) < 80) {
        showModal('Rangoli / Kolam', 'Geometric patterns drawn on the threshold to welcome Goddess Lakshmi and bring good luck. Made with rice flour or chalk.');
        return;
    }

    // Peacock (Moving Entity)
    // Size ~240px. Centered around e.x, e.y.
    // Drawn at e.x, e.y - size + 50
    state.entities.forEach(e => {
        if (e.type === 'peacock') {
            // Simple bounding box around the bird
            if (Math.abs(x - (e.x + 50)) < 100 && Math.abs(y - (e.y - 100)) < 100) {
                showModal('Peacock (Mayura)', 'The national bird of India, representing grace, pride, and beauty. Associated with Lord Kartikeya and Goddess Saraswati.');
            }
        }
    });
}

function showModal(title, text) {
    // Create or reuse modal
    let modal = document.getElementById('info-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'info-modal';
        modal.style.position = 'absolute';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.background = 'white';
        modal.style.padding = '20px';
        modal.style.borderRadius = '10px';
        modal.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
        modal.style.maxWidth = '300px';
        modal.style.textAlign = 'center';
        modal.style.pointerEvents = 'auto'; // Enable clicks
        modal.onclick = (e) => e.stopPropagation(); // Prevent closing immediately

        // Close button
        const close = document.createElement('button');
        close.innerText = 'Close';
        close.onclick = () => modal.remove();

        const h2 = document.createElement('h2');
        const p = document.createElement('p');
        modal.appendChild(h2);
        modal.appendChild(p);
        modal.appendChild(close);
        document.getElementById('ui-layer').appendChild(modal);
    }

    modal.querySelector('h2').innerText = title;
    modal.querySelector('p').innerText = text;
}

// Game Logic
function checkProgression() {
    if (state.stage < CONFIG.thresholds.length - 1 && state.clicks >= CONFIG.thresholds[state.stage]) {
        state.stage++;
        state.transitionProgress = 0;
        spawnLevelUpEffect();
        audioSystem.updateStage(state.stage); // Update Audio

        if (state.stage === 3) spawnPeacock();
    }

    // Random Events
    if (state.stage >= 2 && Math.random() < 0.005) triggerGrandmotherBlessing();
    if (state.stage >= 3 && Math.random() < 0.002) triggerMonsoon();
}

// Spawners (Keep existing particle logic but refine visuals if needed)
function spawnWaterParticles(x, y) {
    for (let i = 0; i < 5 + Math.random() * 5; i++) {
        state.particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1.0, color: '#4fc3f7', type: 'water'
        });
    }
}

function spawnLevelUpEffect() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    for (let i = 0; i < 50; i++) {
        state.particles.push({
            x: cx, y: cy,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            life: 2.0, color: '#FFD700', type: 'sparkle'
        });
    }
}

function spawnPeacock() {
    state.entities.push({
        type: 'peacock',
        x: -200,
        y: canvas.height - canvas.height * 0.2, // Walk on bottom area
        vx: 1.5, // Faster walk
        scale: 0.8
    });
}

function triggerGrandmotherBlessing() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            spawnWaterParticles(cx + (Math.random() - 0.5) * 50, cy);
            state.clicks++;
        }, i * 100);
    }
}

function triggerMonsoon() {
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const x = Math.random() * canvas.width;
            state.particles.push({
                x: x, y: -10,
                vx: 0, vy: 10 + Math.random() * 5,
                life: 1.0, color: '#aaddff', type: 'rain'
            });
            state.clicks += 0.2;
        }, i * 50);
    }
}

function update(deltaTime) {
    if (state.transitionProgress < 1) {
        state.transitionProgress += deltaTime * 0.5;
        if (state.transitionProgress > 1) state.transitionProgress = 1;
    }

    // Update Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= deltaTime * (p.type === 'rain' ? 0.8 : 2);

        if (p.type === 'water') p.vy += CONFIG.gravity;

        if (p.type === 'rain' && p.y > canvas.height) { // Floor collision
            p.life = 0;
            spawnWaterParticles(p.x, canvas.height - 20);
        }

        if (p.life <= 0) state.particles.splice(i, 1);
    }

    // Update Entities
    state.entities.forEach(e => {
        if (e.type === 'peacock') {
            e.x += e.vx;
            if (e.x > canvas.width + 200) e.x = -200;
        }
    });
}

// Rendering V2 (Image Based)
function draw() {
    if (!state.loaded) {
        ctx.fillStyle = '#dcbfa6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillText("Loading Assets...", canvas.width / 2 - 50, canvas.height / 2);
        return;
    }

    // 1. Background Blending
    // We draw Dry earth first
    ctx.globalAlpha = 1.0;
    drawImageCover(state.assets.bgDry);

    // Then blend Lush garden on top based on stage
    const targetOpacity = Math.min(1.0, (state.stage / 5));
    if (state.stage > 0) {
        ctx.globalAlpha = targetOpacity;
        drawImageCover(state.assets.bgLush);
    }
    ctx.globalAlpha = 1.0; // Reset

    // 2. Objects
    const groundY = canvas.height * 0.85;
    const cx = canvas.width / 2;

    // Rangoli (Stage 4+)
    if (state.stage >= 4) {
        const rSize = 300;
        ctx.drawImage(state.assets.rangoli, cx - rSize / 2, groundY - 50, rSize, rSize * 0.6); // Flattened perspective
    }

    // Tree (Stage 3+) - TOP CENTER
    // We want it to be large and looming in the back/top
    if (state.stage >= 3) {
        const tScale = Math.min(1.0, 0.5 + (state.stage - 3) * 0.2);
        const tW = 800 * tScale;
        const tH = 800 * tScale;
        // Positioned at top center (y=0 or somewhat offset)
        ctx.drawImage(state.assets.tree, cx - tW / 2, -100, tW, tH);
    }

    // Tulsi (Always there, maybe gets greener/bigger)
    const pScale = 0.6 + (state.stage * 0.1); // Grows slightly
    const pW = 400 * pScale;
    const pH = 400 * pScale;
    ctx.drawImage(state.assets.tulsi, cx - pW / 2, groundY - pH + 135, pW, pH);

    // Entities
    state.entities.forEach(e => {
        if (e.type === 'peacock') {
            const size = 300 * (e.scale || 1);
            ctx.drawImage(state.assets.peacock, e.x, e.y - size + 50, size, size);
        }
    });

    // Particles (Top layer)
    drawParticles();
}

// Helper to cover screen with image (CSS background-size: cover equivalent)
function drawImageCover(img) {
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
}

function drawParticles() {
    state.particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.type === 'water' ? 3 : 2, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;
}

// Loop
function loop(timestamp) {
    const deltaTime = (timestamp - state.lastFrameTime) / 1000;
    state.lastFrameTime = timestamp;
    update(deltaTime);
    draw();
    requestAnimationFrame(loop);
}

// Boot
assetLoader.loadAll();
requestAnimationFrame(loop);
