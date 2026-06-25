/* =============================================================================
   modules/animations.js
   All animation logic for the app:
     - Timing helpers (speed, duration, easing)
     - Confetti effects
     - Grid swipe transitions
     - Background particle loop
     - View crossfade  (crossfadeViews)
     - Sub-panel fade transition  (switchPanelAnimated)
     - Competitive answer progress bar  (triggerTransition)
     - Settings group accordion  (applyGroupCollapse)
   ============================================================================= */

let backgroundCycleInterval = null;

/* --- TIMING HELPERS --- */

/**
 * Returns a speed multiplier derived from the animSpeed setting.
 * Higher animSpeed → shorter durations (faster animations).
 */
function getAnimationSpeed() {
    const speedSetting = Number(AppState.settings.animSpeed);
    if (!Number.isFinite(speedSetting) || speedSetting <= 0) return 1;
    return speedSetting;
}

function getAnimDurMult() {
    return 1;
}

function getAnimEasing() {
    return 'ease';
}

/** Scales a base duration (ms) by the current animation speed setting. */
function getScaledDuration(baseMs) {
    return baseMs / getAnimationSpeed();
}

function getViewFadeDuration() {
    return 420 / getAnimationSpeed();
}

function getViewResizeDuration() {
    return 600 / getAnimationSpeed();
}

/* --- CONFETTI --- */

function triggerConfetti(type = 'implode', overrideSpeed = null, overrideSize = null, customColors = null) {
    const defaultColors = ['#f8e3cc', '#e2e8f0', '#fff5b1', '#e3f4f6', '#d0f0fd', '#ff9a9e', '#a18cd1', '#2ecc71', '#4a90e2'];
    const colors   = customColors || defaultColors;
    const speed    = overrideSpeed  !== null ? overrideSpeed  : 1;
    const baseSize = overrideSize   !== null ? overrideSize   : 1;

    const rect         = UI.controlsRow.getBoundingClientRect();
    const isRowVisible = rect.width > 0 && rect.height > 0;
    const startX = isRowVisible ? rect.left + rect.width  / 2 : window.innerWidth  / 2;
    const startY = isRowVisible ? rect.top  + rect.height / 2 : window.innerHeight / 2;

    for (let i = 0; i < 80; i++) {
        const el = document.createElement('div');
        el.classList.add('confetti');
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        const size = (Math.random() * 6 + 4) * baseSize;
        el.style.width  = `${size}px`;
        el.style.height = `${size}px`;

        let animationName = '';

        if (type === 'burst') {
            el.style.left = `${startX}px`;
            el.style.top  = `${startY}px`;
            const angle    = Math.random() * 2 * Math.PI;
            const velocity = Math.random() * 400 + 100;
            el.style.setProperty('--tx', `${Math.cos(angle) * velocity}px`);
            el.style.setProperty('--ty', `${Math.sin(angle) * velocity}px`);
            animationName = 'confettiBurst';
        } else {
            el.style.left = `${startX}px`;
            el.style.top  = `${startY}px`;
            const angle = Math.random() * 2 * Math.PI;
            const dist  = Math.random() * 300 + 200;
            el.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
            el.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
            animationName = 'confettiImplode';
        }

        el.style.animationName           = animationName;
        el.style.animationTimingFunction = 'ease-out';
        el.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
        const duration = (Math.random() * 1 + 1.5) / speed;
        el.style.animationDuration = `${duration}s`;

        document.body.appendChild(el);
        setTimeout(() => el.remove(), duration * 1000);
    }
}

/* --- GRID SWIPE TRANSITION --- */

function swipeGrid(grid, direction, onSwap) {
    if (!grid || grid.dataset.animating === '1') return;
    const duration  = getScaledDuration(260);
    const outClass  = direction === 'left' ? 'grid-swipe-out-left'       : 'grid-swipe-out-right';
    const inClass   = direction === 'left' ? 'grid-swipe-in-from-right'  : 'grid-swipe-in-from-left';

    grid.dataset.animating = '1';
    grid.style.setProperty('--grid-swipe-duration', `${duration}ms`);
    grid.classList.remove('grid-swipe-in-from-right', 'grid-swipe-in-from-left');
    grid.classList.add(outClass);

    setTimeout(() => {
        onSwap();
        grid.classList.remove(outClass);
        void grid.offsetWidth;
        grid.classList.add(inClass);

        setTimeout(() => {
            grid.classList.remove(inClass);
            grid.dataset.animating = '0';
        }, duration);
    }, duration);
}

/* --- BACKGROUND PARTICLES --- */

function loadBackgroundParticles() {
    const container = document.getElementById('bg-particles');
    if (!container) return;

    const spawn = () => {
        if (document.hidden) {
            setTimeout(spawn, 1000);
            return;
        }

        const el = document.createElement('div');
        el.classList.add('confetti');

        let colors   = ['#f8e3cc', '#e2e8f0', '#fff5b1', '#e3f4f6', '#d0f0fd', '#ff9a9e', '#a18cd1', '#2ecc71', '#4a90e2'];
        let animName = 'confettiImplode';

        if (AppState.settings.activeBackground === 'bg-dark-squares') {
            colors   = ['#ff00ff', '#00ffff', '#39ff14', '#ffff00', '#ff1493', '#00ff99'];
            animName = 'squareFloat';
        }

        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        const speed    = Math.random() * 0.4 + 0.1;
        const sizeMult = Math.random() * 4 + 1;

        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;
        el.style.left = `${startX}px`;
        el.style.top  = `${startY}px`;

        const angle = Math.random() * 2 * Math.PI;
        const dist  = Math.max(window.innerWidth, window.innerHeight) * 0.7 + (Math.random() * 200);

        el.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
        el.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
        el.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);

        el.style.animationName           = animName;
        const duration                   = (Math.random() * 5 + 10) / speed;
        el.style.animationDuration       = `${duration}s`;
        el.style.animationTimingFunction = 'linear';

        const size = (Math.random() * 6 + 4) * sizeMult;
        el.style.width  = `${size}px`;
        el.style.height = `${size}px`;

        container.appendChild(el);
        setTimeout(() => el.remove(), duration * 1000);

        setTimeout(spawn, 1000);
    };

    spawn();
}

/* --- VIEW CROSSFADE ---
 * Fades fromView out, runs an optional beforeShow callback, then fades toView in.
 * Used by: views.js      — all major view transitions (landing → competitive, etc.)
 *          event-listeners.js — global-back-btn handler
 */
function crossfadeViews(fromView, toView, beforeShow = null) {
    const duration = getViewFadeDuration();
    if (fromView) fromView.classList.remove('fade-in');

    setTimeout(() => {
        if (fromView) fromView.classList.add('hidden');
        if (beforeShow) beforeShow();
        toView.classList.remove('hidden');
        void toView.offsetWidth;
        toView.classList.add('fade-in');
        loadDebugSettings();
    }, duration);
}

/* --- PANEL FADE TRANSITION ---
 * Cross-fades between two sub-panels. Handles the under-construction banner
 * slide-in after the fade, a banner slide-out delay before switching, and an
 * instant (no-animation) fast path.
 * Used by: ser-estar.js  — setSerEstarPanel
 *          para-por.js   — setParaPorPanel
 *          aqui-alla.js  — setAquiAllaPanel
 */
function switchPanelAnimated({ allPanels, currentPanel, nextPanel, instant, onEnter }) {
    if (!instant && currentPanel && currentPanel !== nextPanel) {
        const currentBanner = currentPanel.querySelector('.under-construction-banner.banner-slid-in');

        const doSwitch = () => {
            currentPanel.classList.remove('panel-fade-in');
            const fadeDuration = getViewFadeDuration();
            setTimeout(() => {
                currentPanel.classList.add('hidden');
                if (nextPanel) {
                    nextPanel.classList.remove('hidden');
                    void nextPanel.offsetWidth;
                    nextPanel.classList.add('panel-fade-in');
                    const nextBanner = nextPanel.querySelector('.under-construction-banner');
                    if (nextBanner) setTimeout(() => nextBanner.classList.add('banner-slid-in'), fadeDuration);
                    if (onEnter) onEnter();
                }
            }, fadeDuration);
        };

        if (currentBanner) {
            currentBanner.classList.remove('banner-slid-in');
            setTimeout(doSwitch, getScaledDuration(300));
        } else {
            doSwitch();
        }
    } else {
        allPanels.forEach(panel => {
            panel.classList.toggle('hidden', panel !== nextPanel);
            panel.classList.remove('panel-fade-in');
            const banner = panel.querySelector('.under-construction-banner');
            if (banner) banner.classList.remove('banner-slid-in');
        });
        if (nextPanel) {
            void nextPanel.offsetWidth;
            nextPanel.classList.add('panel-fade-in');
        }
        if (onEnter) onEnter();
    }
}

/* --- COMPETITIVE ANSWER TRANSITION ---
 * Fills the progress bar over settings.newWordDelay ms then loads the next word.
 * Used by: answer.js — handleCorrect (type = 'correct')
 *          answer.js — handleIncorrect (type = 'wrong')
 */
function triggerTransition(type) {
    AppState.isLocked = true;
    UI.input.disabled = true;

    if (type !== 'wrong') UI.statusMessage.classList.remove('hidden');

    UI.progressContainer.classList.remove('hidden');
    void UI.progressBar.offsetWidth; // force reflow so CSS transition fires

    const duration = AppState.settings.newWordDelay || 1000;
    UI.progressBar.style.transition = `width ${duration / 1000}s linear`;
    UI.progressBar.style.width      = '100%';

    transitionTimer = setTimeout(() => loadNextWord(), duration);
}

/* --- SETTINGS GROUP ACCORDION ---
 * Animates collapse / expand of a .settings-group-body using max-height.
 * Uses requestAnimationFrame so the browser registers the initial height before
 * animating to 0, and a transitionend listener to clean up inline styles on expand.
 * Used by: event-listeners.js — userControls (settings group h3 click handlers)
 */
function applyGroupCollapse(groupEl, collapsed, animate) {
    const body = groupEl.querySelector('.settings-group-body');
    if (!body) return;
    if (collapsed) {
        if (!animate) {
            groupEl.classList.add('collapsed');
            body.style.maxHeight = '0px';
        } else {
            body.style.maxHeight = body.scrollHeight + 'px';
            requestAnimationFrame(() => {
                body.style.maxHeight = '0px';
                groupEl.classList.add('collapsed');
            });
        }
    } else {
        groupEl.classList.remove('collapsed');
        body.style.maxHeight = body.scrollHeight + 'px';
        const onEnd = () => { body.style.maxHeight = ''; body.removeEventListener('transitionend', onEnd); };
        body.addEventListener('transitionend', onEnd);
    }
}

/* =============================================================================
   Background — constants, cycling, and apply functions.
   ============================================================================= */

const BACKGROUNDS = ['bg-rainbow', 'bg-ocean', 'bg-sunset', 'bg-forest', 'bg-nebula'];

/**
 * Normalises a stored background name, falling back to 'bg-rainbow' for
 * unknown values.
 */
function normalizeBackground(backgroundName) {
    const fallback = 'bg-rainbow';
    if (!backgroundName || typeof backgroundName !== 'string') return fallback;

    const supportedBackgrounds = [...BACKGROUNDS, 'bg-dark-squares'];
    return supportedBackgrounds.includes(backgroundName) ? backgroundName : fallback;
}

/**
 * Applies a background by crossfading the two background layer divs.
 * Updates AppState so the choice is persisted on the next saveData() call.
 */
function setBackground(backgroundName) {
    backgroundName = normalizeBackground(backgroundName);
    AppState.settings.activeBackground = backgroundName;
    document.body.setAttribute('data-background', backgroundName);

    const wrapper = document.getElementById('bg-wrapper');
    if (!wrapper) return;

    const activeLayer = wrapper.querySelector('.bg-layer.active') || wrapper.firstElementChild;
    const nextLayer   = Array.from(wrapper.children).find(el => el !== activeLayer);

    nextLayer.classList.remove(...BACKGROUNDS);
    nextLayer.classList.add(backgroundName);

    nextLayer.classList.add('active');
    activeLayer.classList.remove('active');
}

/**
 * Starts (or restarts) the 30-second automatic background cycling interval.
 * Call after any setting change that affects autoCycleBackground.
 */
function handleBackgroundCycle() {
    if (backgroundCycleInterval) clearInterval(backgroundCycleInterval);
    if (!AppState.settings.autoCycleBackground) return;

    backgroundCycleInterval = setInterval(() => {
        let idx = BACKGROUNDS.indexOf(AppState.settings.activeBackground);
        if (idx === -1) idx = 0;
        const nextIdx = (idx + 1) % BACKGROUNDS.length;
        setBackground(BACKGROUNDS[nextIdx]);
    }, 30000);
}
