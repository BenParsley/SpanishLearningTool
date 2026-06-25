/* =============================================================================
   modules/audio.js
   Spanish speech playback, audio keyboard shortcut handling, voice UI, and
   utility sounds.  All speech is delegated to the global SpeechManager defined
   in speech.js.
   ============================================================================= */

/* --- BROWSER DETECTION --- */

/**
 * Returns the browser name.  Uses navigator.userAgentData (Chromium) first,
 * then falls back to UA-string parsing.
 */
function getBrowserName() {
    if (navigator.userAgentData && Array.isArray(navigator.userAgentData.brands)) {
        const brands = navigator.userAgentData.brands;
        if (brands.some(b => b.brand === 'Microsoft Edge'))  return 'Edge';
        if (brands.some(b => b.brand === 'Opera GX'))        return 'Opera GX';
        if (brands.some(b => b.brand === 'Opera'))           return 'Opera';
        if (brands.some(b => b.brand === 'Google Chrome'))   return 'Chrome';
        const real = brands.find(b => !b.brand.includes('Not'));
        if (real) return real.brand;
    }
    const ua = navigator.userAgent;
    if (/Edg\//.test(ua))                             return 'Edge';
    if (/OPGX\//.test(ua))                            return 'Opera GX';
    if (/OPR\/|Opera/.test(ua))                       return 'Opera';
    if (/Firefox\//.test(ua))                         return 'Firefox';
    if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari';
    if (/Chrome\//.test(ua))                          return 'Chrome';
    return 'Unknown';
}

/* --- TEXT HELPERS --- */

/**
 * Strips parenthetical and bracketed sections from a string so that the TTS
 * engine does not read out notes such as "(informal)" or "[pl.]".
 */
function stripBracketSections(text) {
    return text
        .replace(/\s*[\(\[][^(\)\]]*[\)\]]\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/* --- SPEECH --- */

function speakSpanish(text) {
    const sanitized = stripBracketSections(text);
    if (!sanitized) return;
    SpeechManager.speak(sanitized);
}

/**
 * Speaks text and returns a Promise that resolves once the utterance ends.
 * Falls back to fire-and-forget if the SpeechManager doesn't support promises.
 */
function speakSpanishAsync(text) {
    const sanitized = stripBracketSections(text);
    if (!sanitized) return Promise.resolve();
    if (SpeechManager && typeof SpeechManager.speakWithPromise === 'function') {
        return SpeechManager.speakWithPromise(sanitized);
    }
    SpeechManager.speak(sanitized);
    return Promise.resolve();
}

/* --- KEYBOARD SHORTCUT NORMALISATION --- */

function normalizeShortcutKey(key) {
    if (!key || typeof key !== 'string') return '';
    const trimmed = key.trim();
    if (!trimmed) return '';
    if (trimmed === ' ') return 'Space';
    if (trimmed.length === 1) return trimmed.toUpperCase();

    const aliasMap = {
        control: 'Ctrl', ctrl: 'Ctrl',
        alt: 'Alt',
        shift: 'Shift',
        meta: 'Meta', cmd: 'Meta', command: 'Meta',
        spacebar: 'Space',
        esc: 'Escape',
        del: 'Delete',
        plus: '+'
    };

    const lower = trimmed.toLowerCase();
    if (aliasMap[lower]) return aliasMap[lower];
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function normalizeShortcut(shortcut) {
    if (!shortcut || typeof shortcut !== 'string') return '';

    const parts = shortcut
        .split('+')
        .map(part => normalizeShortcutKey(part))
        .filter(Boolean);

    if (parts.length === 0) return '';

    const modifierOrder = ['Ctrl', 'Alt', 'Shift', 'Meta'];
    const modifiers = [];
    let mainKey = '';

    parts.forEach(part => {
        if (modifierOrder.includes(part)) {
            if (!modifiers.includes(part)) modifiers.push(part);
        } else if (!mainKey) {
            mainKey = part;
        }
    });

    if (!mainKey && modifiers.length > 0) {
        mainKey = modifiers.pop();
    }

    const orderedModifiers = modifierOrder.filter(mod => modifiers.includes(mod));
    return [...orderedModifiers, mainKey].filter(Boolean).join('+');
}

/** Converts a KeyboardEvent into a normalised shortcut string, e.g. "Alt+P". */
function eventToShortcut(event) {
    const parts = [];
    if (event.ctrlKey)  parts.push('Ctrl');
    if (event.altKey)   parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey)  parts.push('Meta');
    parts.push(normalizeShortcutKey(event.key));
    return normalizeShortcut(parts.join('+'));
}

/** Returns the normalised audio shortcut string from settings. */
function getAudioShortcut() {
    return normalizeShortcut(AppState.settings.audioShortcut || 'Alt+P') || 'Alt+P';
}

function isAudioShortcutPressed(event) {
    return eventToShortcut(event) === getAudioShortcut();
}

/**
 * Returns true when the audio shortcut should be suppressed — e.g. when the
 * user is typing in a plain text field without a modifier key.
 */
function shouldIgnoreAudioShortcut(event) {
    const active = document.activeElement;
    if (active && active.id === 'audio-shortcut') return true;
    const isTypingField = active && (
        active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.isContentEditable
    );
    if (!isTypingField) return false;
    return !(event.ctrlKey || event.altKey || event.metaKey);
}

/* --- AUDIO PLAYBACK --- */

/** Plays audio for the current question if the conditions are met. */
function playCurrentQuestionAudio() {
    if (playSerEstarQuestionAudio()) return;
    if (UI.competitive.classList.contains('hidden')) return;
    if (AppState.isTestWord || AppState.currentDirection !== 'es-to-en') return;
    const word = AppState.words[AppState.currentWordIndex];
    if (!word) return;
    speakSpanish(AppState.currentSpanishPrompt || word.es);
}

function isSerEstarCompetitivePlayVisible() {
    const serEstarView = document.getElementById('view-ser-estar');
    if (!serEstarView || serEstarView.classList.contains('hidden')) return false;
    const competitivePanel = document.getElementById('se-competitive');
    if (!competitivePanel || competitivePanel.classList.contains('hidden')) return false;
    const playSection = document.getElementById('se-comp-play');
    if (!playSection || playSection.classList.contains('hidden')) return false;
    return true;
}

function getSerEstarQuestionSpeechText() {
    if (typeof SeComp === 'undefined' || !Array.isArray(allSerEstarPhrases)) return '';
    if (SeComp.currentIndex < 0 || SeComp.currentIndex >= allSerEstarPhrases.length) return '';
    const phrase = allSerEstarPhrases[SeComp.currentIndex];
    const spanishPrompt = Array.isArray(phrase) ? phrase[0] : '';
    if (typeof spanishPrompt !== 'string') return '';
    return spanishPrompt.replace(/___/g, ' ').replace(/\s+/g, ' ').trim();
}

function playSerEstarQuestionAudio() {
    if (!isSerEstarCompetitivePlayVisible()) return false;
    const speechText = getSerEstarQuestionSpeechText();
    if (!speechText) return false;
    speakSpanish(speechText);
    return true;
}

/** Keyboard handler for the Ser/Estar competitive view (currently no shortcuts). */
function handleSerEstarCompetitiveKeydown(/* event */) {
    return false;
}

/* --- VOICE UI --- */

/** Updates the voice gender button states and disabled styles. */
function loadAudioSettings() {
    const isRandom = AppState.settings.randomVoice;
    const gender   = AppState.settings.voiceGender;
    document.querySelectorAll('.voice-btn').forEach(btn => {
        if (isRandom) {
            btn.classList.add('disabled');
            btn.classList.remove('selected');
        } else {
            btn.classList.remove('disabled');
            btn.classList.toggle('selected', btn.dataset.gender === gender);
        }
    });
}

/* --- UTILITY SOUNDS --- */

/** Plays a brief success chime using the Web Audio API. */
function playSuccessSound() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
}

/* --- PAGE LOAD --- */
(function () {
    const browser = getBrowserName();
    console.log(`Browser: ${browser}`);
    if (browser === 'Firefox' || browser === 'Opera GX') {
        console.log(`TTS not working as intended due to ${browser} being used`);
    }
})();
