/* --- STATE MANAGEMENT --- */
const AppState = {
    currentBundleId: null,
    words: [], 
    currentWordIndex: null,
    currentDirection: 'en-to-es', 
    practiceWordIndex: null,
    practiceDirection: 'en-to-es',
    currentSpanishPrompt: null,
    practiceSpanishPrompt: null,
    isTestWord: false,
    isStatsDebug: false,
    testWordCounter: 1,
    isLocked: false, 
    isDeleting: false,
    previousView: null,
    lastAction: null,
    actionHistory: [],
    redoHistory: [],
    viewTransitionTimer: null,
    practiceMatched: new Set(),
    practiceSkipped: new Set(),
    practiceSearch: '',
    practiceOrder: [],
    practiceWrongGuesses: new Set(),
    settings: {
        voiceGender: 'male',
        randomVoice: true,
        voiceVolume: 1,
        strictAccents: true,
        requireInvertedPunctuation: false,
        bgTheme: 'bg-rainbow',
        autoCycleThemes: true,
        newWordDelay: 1000,
        practiceAnimSpeed: 1,
        modeGridSize: 650,
        wordlistCols: 6,
        animSpeed: 1.2,
        animPreset: '1',
        autoDownload: true,
        autoDownloadFrequency: 10,
        debugMode: false,
        statsColumns: {
            en: true,
            es: true,
            attempts: true,
            streak: true,
            correct: true,
            incorrect: true,
            weight: true
        },
        practiceStatsColumns: {
            p_en: true,
            p_es: true,
            p_attempts: true,
            p_streak: true,
            p_correct: true,
            p_incorrect: true
        }
    },
    sort: {
        column: 'weight',
        order: 'desc'
    },
    practiceSort: {
        column: 'p_attempts',
        order: 'desc'
    },
    wordlistSort: { key: 'default', order: 'asc' },
    wordlistSearch: '',
    wordlistBundleFilter: {},
    statsSearch: '',
    practiceStatsSearch: '',
    modePage: 0,
    vocabPage: 0,
    isCustomSelectionMode: false,
    customSelectedBundleIds: []
};

/* --- DOM ELEMENTS --- */
const UI = {
    mainContainer: document.querySelector('.main-container'),
    testingContainer: document.getElementById('testing-container'),
    debugContent: document.getElementById('debug-content'),
    welcome: document.getElementById('view-welcome'),
    btnContinueGuest: document.getElementById('btn-continue-guest'),
    modeSelect: document.getElementById('view-mode-select'),
    modeGrid: document.getElementById('mode-grid'),
    modePagePrev: document.getElementById('mode-page-prev'),
    modePageNext: document.getElementById('mode-page-next'),
    landing: document.getElementById('view-landing'),
    vocabPagePrev: document.getElementById('vocab-page-prev'),
    vocabPageNext: document.getElementById('vocab-page-next'),
    wordlist: document.getElementById('view-wordlist'),
    competitive: document.getElementById('view-competitive'),
    practice: document.getElementById('view-practice'),
    practiceWord: document.getElementById('practice-word'),
    practiceAudio: document.getElementById('practice-audio-btn'),
    practiceGrid: document.getElementById('practice-options-grid'),
    practiceModeSelection: document.getElementById('practice-mode-selection'),
    practiceGameArea: document.getElementById('practice-game-area'),
    btnPracticeEn: document.getElementById('btn-practice-en'),
    btnPracticeEs: document.getElementById('btn-practice-es'),
    practiceSearch: document.getElementById('practice-search'),
    btnPracticeShuffle: document.getElementById('btn-practice-shuffle'),
    btnPracticeSkip: document.getElementById('btn-practice-skip'),
    btnResetPractice: document.getElementById('btn-reset-practice'),
    practiceProgressFill: document.getElementById('practice-progress-fill'),
    practiceProgressText: document.getElementById('practice-progress-text'),
    stats: document.getElementById('view-stats'),
    practiceStats: document.getElementById('view-practice-stats'),
    nav: document.getElementById('app-nav'),
    subNav: document.getElementById('sub-nav'),
    btnSubPlay: document.getElementById('btn-sub-play'),
    btnSubStats: document.getElementById('btn-sub-stats'),
    bundleGrid: document.getElementById('bundle-grid'),
    wordlistContainer: document.getElementById('wordlist-container'),
    statsBody: document.getElementById('stats-body'),
    practiceStatsBody: document.getElementById('practice-stats-body'),
    questionWord: document.getElementById('question-word'),
    questionAudioBtn: document.getElementById('question-audio-btn'),
    questionLabel: document.getElementById('question-label'),
    input: document.getElementById('answer-input'),
    hintDisplay: document.getElementById('hint-display'),
    feedback: document.getElementById('feedback-message'),
    questionNote: document.getElementById('question-note'),
    streakProgressWrapper: document.getElementById('streak-progress-wrapper'),
    streakProgressFill: document.getElementById('streak-progress-fill'),
    btnSkip: document.getElementById('btn-skip'),
    btnHint: document.getElementById('btn-hint'),
    statusMessage: document.getElementById('status-message'),
    btnUndo: document.getElementById('btn-undo'),
    progressBar: document.getElementById('progress-bar'),
    progressContainer: document.getElementById('progress-bar-container'),
    controlsRow: document.getElementById('controls-row'),
    timestamp: document.getElementById('timestamp'),
    savePrompt: document.getElementById('save-prompt'),
    quickSaveBtn: document.getElementById('quick-save-btn'),
    tableHeaders: document.querySelectorAll('th[data-sort]')
};

let cycleInterval = null;
let sessionActionCount = 0;
let previousStreak = 0;
const THEMES = ['bg-rainbow', 'bg-ocean', 'bg-sunset', 'bg-forest', 'bg-nebula'];
const LEGACY_THEME_ALIASES = {
    'bg-dark-mode': 'bg-dark-squares'
};

function normalizeBackgroundTheme(themeName) {
    const fallback = 'bg-rainbow';
    if (!themeName || typeof themeName !== 'string') return fallback;

    const normalized = LEGACY_THEME_ALIASES[themeName] || themeName;
    const supportedThemes = [...THEMES, 'bg-dark-squares'];
    return supportedThemes.includes(normalized) ? normalized : fallback;
}

function getAnimationSpeed() {
    return AppState.settings.animSpeed || 1;
}

function getAnimDurMult() {
    return 1;
}

function getAnimEasing() {
    return 'ease';
}

function getScaledDuration(baseMs) {
    return baseMs * getAnimDurMult() / getAnimationSpeed();
}

function getViewFadeDuration() {
    return 420 * getAnimDurMult() / getAnimationSpeed();
}

function getViewResizeDuration() {
    return 600 * getAnimDurMult() / getAnimationSpeed();
}

function getAvailableBundles() {
    return typeof availableBundles !== 'undefined' ? availableBundles : [];
}

function getCustomVocabBundleId() {
    return typeof CUSTOM_VOCAB_BUNDLE_ID !== 'undefined' ? CUSTOM_VOCAB_BUNDLE_ID : 'bundle_custom_vocab';
}

function getBaseVocabBundleIds() {
    return typeof BASE_VOCAB_BUNDLE_IDS !== 'undefined' ? BASE_VOCAB_BUNDLE_IDS : ['bundle_1', 'bundle_2', 'bundle_3', 'bundle_4'];
}

function getCategoryBundleId(category) {
    if (typeof CATEGORY_TO_BUNDLE_ID !== 'undefined' && category && CATEGORY_TO_BUNDLE_ID[category]) {
        return CATEGORY_TO_BUNDLE_ID[category];
    }
    return null;
}

function createWordIdentity(word) {
    const category = (word && word.category ? word.category : '').trim().toLowerCase();
    const en = (word && word.en ? word.en : '').trim().toLowerCase();
    const es = (word && word.es ? word.es : '').trim().toLowerCase();
    return `${category}|||${en}|||${es}`;
}

function buildWordIndex(words) {
    const index = new Map();
    words.forEach((word, idx) => {
        index.set(createWordIdentity(word), idx);
    });
    return index;
}

function mergeSavedWords(freshWords, savedWords) {
    if (!Array.isArray(savedWords) || savedWords.length === 0) return freshWords;
    const savedByIdentity = new Map();
    savedWords.forEach(savedWord => {
        savedByIdentity.set(createWordIdentity(savedWord), savedWord);
    });

    return freshWords.map(freshWord => {
        const savedWord = savedByIdentity.get(createWordIdentity(freshWord));
        return savedWord ? { ...freshWord, ...savedWord } : freshWord;
    });
}

function loadStoredBundleData() {
    let fullData = {};
    const savedJSON = localStorage.getItem('wordBundleStats');
    if (savedJSON) {
        try {
            fullData = JSON.parse(savedJSON) || {};
        } catch (e) {
            fullData = {};
        }
    }
    if (!fullData.bundles) fullData.bundles = {};
    return fullData;
}

function copyCompetitiveStats(sourceWord, targetWord) {
    targetWord.attempts = sourceWord.attempts || 0;
    targetWord.streak = sourceWord.streak || 0;
    targetWord.wrong = sourceWord.wrong || 0;
    targetWord.correct = sourceWord.correct || 0;
    targetWord.skip = sourceWord.skip || 0;
    targetWord.weight = sourceWord.weight || 100;
}

function getCustomSelectedBundleIds() {
    if (!Array.isArray(AppState.customSelectedBundleIds)) return [];
    return AppState.customSelectedBundleIds.filter(id => getBaseVocabBundleIds().includes(id));
}

function isBundleSelectedForCustom(bundleId) {
    return getCustomSelectedBundleIds().includes(bundleId);
}

function toggleCustomBundleSelection(bundleId) {
    if (!getBaseVocabBundleIds().includes(bundleId)) return;
    if (isBundleSelectedForCustom(bundleId)) {
        AppState.customSelectedBundleIds = getCustomSelectedBundleIds().filter(id => id !== bundleId);
    } else {
        AppState.customSelectedBundleIds = [...getCustomSelectedBundleIds(), bundleId];
    }
}

function buildCustomBundleData(selectedBundleIds = getCustomSelectedBundleIds()) {
    const selectedSet = new Set(selectedBundleIds);
    const chunks = getAvailableBundles()
        .filter(bundle => selectedSet.has(bundle.id))
        .map(bundle => (bundle.data || '').trim())
        .filter(chunk => chunk.length > 0);
    return chunks.join('\n');
}

function getRuntimeBundleData(bundle) {
    if (!bundle) return '';
    if (bundle.id === getCustomVocabBundleId()) {
        return buildCustomBundleData();
    }
    return bundle.data || '';
}

function getRuntimeBundle(bundle) {
    if (!bundle) return bundle;
    return {
        ...bundle,
        data: getRuntimeBundleData(bundle)
    };
}

function syncCompetitiveStatsToMirrorBundles(sourceWord) {
    if (!sourceWord || !AppState.currentBundleId) return;

    const customBundleId = getCustomVocabBundleId();
    const targetBundleIds = [];

    if (AppState.currentBundleId === customBundleId) {
        const categoryBundleId = getCategoryBundleId(sourceWord.category);
        if (categoryBundleId) targetBundleIds.push(categoryBundleId);
    } else if (getBaseVocabBundleIds().includes(AppState.currentBundleId)) {
        targetBundleIds.push(customBundleId);
    }

    if (targetBundleIds.length === 0) return;

    const fullData = loadStoredBundleData();
    let hasChanges = false;

    targetBundleIds.forEach(targetBundleId => {
        const targetBundle = getAvailableBundles().find(bundle => bundle.id === targetBundleId);
        if (!targetBundle) return;

        const freshTargetData = getRuntimeBundleData(targetBundle);
        const freshTargetWords = freshTargetData ? parseBundleData(freshTargetData) : [];
        const savedTargetWords = Array.isArray(fullData.bundles[targetBundleId]) ? fullData.bundles[targetBundleId] : [];
        const mergedTargetWords = freshTargetWords.length > 0
            ? mergeSavedWords(freshTargetWords, savedTargetWords)
            : savedTargetWords.map(word => ({ ...word }));
        const targetIndex = buildWordIndex(mergedTargetWords).get(createWordIdentity(sourceWord));

        if (targetIndex === undefined) return;

        copyCompetitiveStats(sourceWord, mergedTargetWords[targetIndex]);
        fullData.bundles[targetBundleId] = mergedTargetWords;
        hasChanges = true;
    });

    if (hasChanges) {
        localStorage.setItem('wordBundleStats', JSON.stringify(fullData));
    }
}

function stripBracketSections(text) {
    return text
        .replace(/\s*[\(\[][^(\)\]]*[\)\]]\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function speakSpanish(text) {
    const sanitized = stripBracketSections(text);
    if (!sanitized) return;
    SpeechManager.speak(sanitized);
}

function pickRandomAlternative(alternatives, fallback = '') {
    if (Array.isArray(alternatives) && alternatives.length > 0) {
        return alternatives[Math.floor(Math.random() * alternatives.length)];
    }
    return fallback;
}

function setSerEstarPanel(panelId) {
    const normalizedPanelId = panelId === 'se-competitive' ? 'se-competitive' : 'se-practice';
    document.querySelectorAll('.se-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.panel === normalizedPanelId);
    });
    document.querySelectorAll('.se-panel').forEach(panel => {
        panel.classList.toggle('hidden', panel.id !== normalizedPanelId);
    });
    updateCurrentSectionDisplay(normalizedPanelId);
}

function setParaPorPanel(panelId) {
    const normalizedPanelId = panelId === 'pp-competitive' ? 'pp-competitive' : 'pp-practice';
    document.querySelectorAll('.pp-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.panel === normalizedPanelId);
    });
    document.querySelectorAll('.pp-panel').forEach(panel => {
        panel.classList.toggle('hidden', panel.id !== normalizedPanelId);
    });
    updateCurrentSectionDisplay(normalizedPanelId);
}

/* --- INITIALIZATION --- */
window.addEventListener('DOMContentLoaded', () => {
    loadGlobalData();
    // Ensure animation preset is applied on load
    document.documentElement.dataset.animPreset = '1';
    updateVoiceUI();
    updateDebugUI();
    renderModeSelect();
    renderLandingPage();
    setupEventListeners();
    setupStatsColumnMenu();
    setupPracticeStatsColumnMenu();
    initBackgroundParticles();

    // Close bundle filter menu on outside click
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('bundle-filter-menu');
        const btn = document.getElementById('btn-bundle-filter');
        if (menu && !menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== btn) {
            menu.classList.add('hidden');
        }
    });
    
    // Initial sort highlight
    updateSortHeaderStyles();

    // Fade in welcome screen first
    setTimeout(() => UI.welcome.classList.add('fade-in'), 10);
});

window.addEventListener('beforeunload', () => {
    saveData();
});

function setupEventListeners() {
    if (UI.btnContinueGuest) {
        UI.btnContinueGuest.addEventListener('click', () => {
            crossfadeViews(UI.welcome, UI.modeSelect, () => {
                UI.mainContainer.classList.add('wide');
                setSelectorNavState('mode');
                updateCurrentSectionDisplay('view-mode-select');
            });
        });
    }

    if (UI.modePagePrev) {
        UI.modePagePrev.addEventListener('click', () => {
            if (AppState.modePage > 0) {
                swipeGrid(UI.modeGrid, 'right', () => {
                    AppState.modePage -= 1;
                    renderModeSelect();
                });
            }
        });
    }

    if (UI.modePageNext) {
        UI.modePageNext.addEventListener('click', () => {
            if (AppState.modePage < 1) {
                swipeGrid(UI.modeGrid, 'left', () => {
                    AppState.modePage += 1;
                    renderModeSelect();
                });
            }
        });
    }

    if (UI.vocabPagePrev) {
        UI.vocabPagePrev.addEventListener('click', () => {
            if (AppState.vocabPage > 0) {
                swipeGrid(UI.bundleGrid, 'right', () => {
                    AppState.vocabPage -= 1;
                    renderLandingPage();
                });
            }
        });
    }

    if (UI.vocabPageNext) {
        UI.vocabPageNext.addEventListener('click', () => {
            if (AppState.vocabPage < 1) {
                swipeGrid(UI.bundleGrid, 'left', () => {
                    AppState.vocabPage += 1;
                    renderLandingPage();
                });
            }
        });
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.dataset.target;
            const serEstarView = document.getElementById('view-ser-estar');
            const isSerEstarActive = !!serEstarView && !serEstarView.classList.contains('hidden');
            const paraPorView = document.getElementById('view-para-por');
            const isParaPorActive = !!paraPorView && !paraPorView.classList.contains('hidden');

            if (isSerEstarActive && (target === 'se-practice' || target === 'se-competitive')) {
                setSerEstarPanel(target);
                document.querySelectorAll('.tab-btn').forEach(tab => {
                    tab.classList.toggle('active', tab.dataset.target === target);
                });
                return;
            }

            if (isParaPorActive && (target === 'pp-practice' || target === 'pp-competitive')) {
                setParaPorPanel(target);
                document.querySelectorAll('.tab-btn').forEach(tab => {
                    tab.classList.toggle('active', tab.dataset.target === target);
                });
                return;
            }

            if (target === 'view-competitive') {
                const currentView = document.querySelector('.view:not(.hidden)');
                if (currentView && currentView.id === 'view-competitive') {
                    switchView('view-stats');
                    return;
                } else if (currentView && (currentView.id === 'view-stats' || currentView.id === 'view-practice-stats')) {
                    switchView('view-competitive');
                    return;
                }
            }

            if (target === 'view-practice') {
                const currentView = document.querySelector('.view:not(.hidden)');
                if (currentView && currentView.id === 'view-practice') {
                    if (!UI.practiceGameArea.classList.contains('hidden')) {
                        UI.practiceGameArea.classList.add('hidden');
                        UI.btnResetPractice.classList.add('hidden');
                        UI.practiceModeSelection.classList.remove('hidden');
                        return;
                    }
                    switchView('view-practice-stats');
                    return;
                } else if (currentView && currentView.id === 'view-practice-stats') {
                    switchView('view-practice');
                    return;
                }
            }
            switchView(target);
        });
    });

    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchView(e.target.dataset.target));
    });

    // SER / ESTAR internal tab switching
    document.querySelectorAll('.se-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const panelId = e.currentTarget.dataset.panel;
            setSerEstarPanel(panelId);
        });
    });

    document.querySelectorAll('.pp-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const panelId = e.currentTarget.dataset.panel;
            setParaPorPanel(panelId);
        });
    });

    if (UI.btnPracticeEn) {
        UI.btnPracticeEn.addEventListener('click', () => startPracticeMode('en-to-es'));
    }
    if (UI.btnPracticeEs) {
        UI.btnPracticeEs.addEventListener('click', () => startPracticeMode('es-to-en'));
    }

    if (UI.btnPracticeShuffle) {
        UI.btnPracticeShuffle.addEventListener('click', shufflePracticeGrid);
    }
    if (UI.btnPracticeSkip) {
        UI.btnPracticeSkip.addEventListener('click', skipPracticeWord);
    }

    if (UI.practiceSearch) {
        UI.practiceSearch.addEventListener('input', (e) => {
            AppState.practiceSearch = e.target.value.toLowerCase();
            renderPracticeGrid();
        });

        UI.practiceSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const visibleItems = Array.from(UI.practiceGrid.children).filter(child => 
                    !child.classList.contains('search-dimmed') && 
                    !child.classList.contains('matched') && 
                    !child.classList.contains('incorrect-gray')
                );

                const searchTerm = e.target.value.trim().toLowerCase();

                const exactMatch = visibleItems.find(child => {
                    const index = parseInt(child.dataset.index);
                    const word = AppState.words[index];
                    if (!word) return false;
                    const text = AppState.practiceDirection === 'en-to-es' ? word.es : word.en;
                    return text.toLowerCase() === searchTerm;
                });

                if (exactMatch) {
                    exactMatch.click();
                    e.preventDefault();
                    return;
                }

                if (visibleItems.length === 1) {
                    visibleItems[0].click();
                    e.preventDefault();
                }
            }
        });
    }

    if (UI.btnResetPractice) {
        UI.btnResetPractice.addEventListener('click', resetPracticeProgress);
    }

    document.querySelectorAll('.settings-toggle-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            UI.testingContainer.classList.toggle('hidden');
        });
    });

    document.getElementById('global-back-btn').addEventListener('click', () => {
        if (!UI.stats.classList.contains('hidden') || !UI.practiceStats.classList.contains('hidden')) {
            switchView('view-competitive');
            updateCurrentSectionDisplay('view-competitive');
            return;
        }

        if (!UI.practice.classList.contains('hidden') && !UI.practiceGameArea.classList.contains('hidden')) {
            UI.practiceGameArea.classList.add('hidden');
            UI.btnResetPractice.classList.add('hidden');
            UI.practiceModeSelection.classList.remove('hidden');
            updateCurrentSectionDisplay('view-practice');
            return;
        }

        // If on vocabulary selector (landing), go back to mode select
        if (!UI.landing.classList.contains('hidden')) {
            crossfadeViews(UI.landing, UI.modeSelect, () => {
                setSelectorNavState('mode');
                updateCurrentSectionDisplay('view-mode-select');
            });
            return;
        }

        // If on SER/ESTAR view, go back to mode select
        const serEstarView = document.getElementById('view-ser-estar');
        if (serEstarView && !serEstarView.classList.contains('hidden')) {
            crossfadeViews(serEstarView, UI.modeSelect, () => {
                setSelectorNavState('mode');
                updateCurrentSectionDisplay('view-mode-select');
            });
            return;
        }

        const paraPorView = document.getElementById('view-para-por');
        if (paraPorView && !paraPorView.classList.contains('hidden')) {
            crossfadeViews(paraPorView, UI.modeSelect, () => {
                setSelectorNavState('mode');
                updateCurrentSectionDisplay('view-mode-select');
            });
            return;
        }

        document.body.classList.remove('focus-mode-active');
        UI.mainContainer.classList.add('wide');

        saveData();
        
        if (transitionTimer) clearTimeout(transitionTimer);
        if (AppState.viewTransitionTimer) {
            clearTimeout(AppState.viewTransitionTimer);
            AppState.viewTransitionTimer = null;
        }
        AppState.isLocked = false;
        AppState.currentBundleId = null;
        AppState.words = [];
        AppState.currentWordIndex = null;
        AppState.practiceWordIndex = null;
        UI.subNav.classList.add('hidden');

        const currentView = document.querySelector('.view:not(.hidden)');
        crossfadeViews(currentView, UI.landing, () => {
            AppState.vocabPage = 0;
            setSelectorNavState('landing');
            renderLandingPage();
            updateCurrentSectionDisplay('view-landing');
        });
    });

    document.getElementById('random-voice').addEventListener('change', (e) => {
        AppState.settings.randomVoice = e.target.checked;
        SpeechManager.setRandom(e.target.checked);
        updateVoiceUI();
        saveData();
    });

    document.querySelectorAll('.voice-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const gender = e.target.dataset.gender;
            AppState.settings.voiceGender = gender;
            SpeechManager.setGender(gender);
            updateVoiceUI();
            saveData();
        });
    });

    document.getElementById('btn-test-voice').addEventListener('click', () => {
        SpeechManager.speak("Hola, probando la voz.");
    });

    document.getElementById('voice-volume').addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        AppState.settings.voiceVolume = val;
        document.getElementById('voice-volume-val').innerText = Math.round(val * 100) + '%';
        SpeechManager.setVolume(val);
    });
    document.getElementById('voice-volume').addEventListener('change', saveData);

    document.getElementById('strict-accents').addEventListener('change', (e) => {
        AppState.settings.strictAccents = e.target.checked;
        saveData();
    });

    document.getElementById('require-inverted-punctuation').addEventListener('change', (e) => {
        AppState.settings.requireInvertedPunctuation = e.target.checked;
        saveData();
    });

    document.getElementById('new-word-delay').addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        AppState.settings.newWordDelay = val;
        document.getElementById('new-word-delay-val').innerText = `${(val/1000).toFixed(1)}s`;
    });
    document.getElementById('new-word-delay').addEventListener('change', saveData);

    document.getElementById('rec-new-word-delay').addEventListener('click', () => {
        const val = 1000;
        document.getElementById('new-word-delay').value = val;
        AppState.settings.newWordDelay = val;
        document.getElementById('new-word-delay-val').innerText = "1.0s";
        saveData();
    });

    document.getElementById('wordlist-cols').addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        AppState.settings.wordlistCols = val;
        document.getElementById('wordlist-cols-val').innerText = val;
        document.documentElement.style.setProperty('--wordlist-cols', val);
    });
    document.getElementById('wordlist-cols').addEventListener('change', saveData);

    document.getElementById('mode-grid-size').addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        AppState.settings.modeGridSize = val;
        document.getElementById('mode-grid-size-val').innerText = `${val}px`;
        document.documentElement.style.setProperty('--mode-grid-max', `${val}px`);
    });
    document.getElementById('mode-grid-size').addEventListener('change', saveData);

    document.getElementById('anim-speed').addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        AppState.settings.animSpeed = val;
        document.getElementById('anim-speed-val').innerText = val + 'x';
        document.documentElement.style.setProperty('--anim-speed', val);
    });
    document.getElementById('anim-speed').addEventListener('change', saveData);

    document.getElementById('rec-anim-speed').addEventListener('click', () => {
        const val = 1.2;
        document.getElementById('anim-speed').value = val;
        AppState.settings.animSpeed = val;
        document.getElementById('anim-speed-val').innerText = val + 'x';
        document.documentElement.style.setProperty('--anim-speed', val);
        saveData();
    });

    document.getElementById('auto-download').addEventListener('change', (e) => {
        AppState.settings.autoDownload = e.target.checked;
        saveData();
    });

    document.getElementById('auto-download-freq').addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        AppState.settings.autoDownloadFrequency = val;
        document.getElementById('auto-download-freq-val').innerText = val;
    });
    document.getElementById('auto-download-freq').addEventListener('change', saveData);

    document.getElementById('rec-auto-download-freq').addEventListener('click', () => {
        const val = 25;
        document.getElementById('auto-download-freq').value = val;
        AppState.settings.autoDownloadFrequency = val;
        document.getElementById('auto-download-freq-val').innerText = val;
        saveData();
    });

    document.getElementById('rec-wordlist-cols').addEventListener('click', () => {
        const val = 6;
        document.getElementById('wordlist-cols').value = val;
        AppState.settings.wordlistCols = val;
        document.getElementById('wordlist-cols-val').innerText = val;
        document.documentElement.style.setProperty('--wordlist-cols', val);
        saveData();
    });

    document.getElementById('rec-mode-grid-size').addEventListener('click', () => {
        const val = 650;
        document.getElementById('mode-grid-size').value = val;
        AppState.settings.modeGridSize = val;
        document.getElementById('mode-grid-size-val').innerText = `${val}px`;
        document.documentElement.style.setProperty('--mode-grid-max', `${val}px`);
        saveData();
    });

    document.getElementById('wordlist-search').addEventListener('input', (e) => {
        AppState.wordlistSearch = e.target.value.toLowerCase();
        renderWordlist();
    });

    document.getElementById('stats-search').addEventListener('input', (e) => {
        AppState.statsSearch = e.target.value.toLowerCase();
        renderStats();
    });

    document.getElementById('practice-stats-search').addEventListener('input', (e) => {
        AppState.practiceStatsSearch = e.target.value.toLowerCase();
        renderPracticeStats();
    });

    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const key = e.target.dataset.key;
            if (AppState.wordlistSort.key === key && key !== 'default') {
                AppState.wordlistSort.order = AppState.wordlistSort.order === 'asc' ? 'desc' : 'asc';
            } else {
                AppState.wordlistSort.key = key;
                AppState.wordlistSort.order = (key === 'skip' || key === 'wrong') ? 'desc' : 'asc';
            }
            renderWordlist();
        });
    });

    // Data Import/Export
    document.getElementById('btn-export').addEventListener('click', () => triggerExport(false));

    document.getElementById('btn-import-trigger').addEventListener('click', () => {
        document.getElementById('file-import').click();
    });

    document.getElementById('file-import').addEventListener('change', handleFileImport);

    document.getElementById('btn-delete-all-data-debug').addEventListener('click', () => {
        if (confirm("Are you sure you want to delete ALL statistics across ALL bundles? Settings will be preserved.")) {
            AppState.isDeleting = true;
            const dataToKeep = {
                settings: AppState.settings,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('wordBundleStats', JSON.stringify(dataToKeep));
            location.reload();
        }
    });

    // Quick Save Prompt
    UI.quickSaveBtn.addEventListener('click', () => {
        saveData();
        UI.savePrompt.classList.remove('visible');
        sessionActionCount = 0;
    });

    UI.progressContainer.addEventListener('click', () => {
        if (UI.competitive.classList.contains('wrong-state')) {
            undoAction();
        }
    });

    UI.questionAudioBtn.addEventListener('click', () => {
        if (AppState.isTestWord) return;
        if (AppState.currentDirection === 'es-to-en') {
            const word = AppState.words[AppState.currentWordIndex];
            speakSpanish(AppState.currentSpanishPrompt || word.es);
        }
    });

    UI.practiceAudio.addEventListener('click', () => {
        if (AppState.practiceDirection === 'es-to-en') {
            const word = AppState.words[AppState.practiceWordIndex];
            speakSpanish(AppState.practiceSpanishPrompt || word.es);
        }
    });

    UI.btnSkip.addEventListener('click', skipWord);
    UI.btnHint.addEventListener('click', showHint);
    UI.btnUndo.addEventListener('click', undoAction);

    UI.tableHeaders.forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            sortStats(column);
        });
    });

    document.querySelectorAll('#view-practice-stats th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            sortPracticeStats(column);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (UI.competitive.classList.contains('hidden')) return;
        
        if (e.key === 'Enter') {
            if (AppState.isLocked) return;
            submitAnswer();
        } else if (e.code === 'Space') {
            if (document.activeElement === UI.input) return;
            e.preventDefault(); 
            if (AppState.isLocked && !UI.btnUndo.classList.contains('hidden')) {
                undoAction(); 
            } else if (!AppState.isLocked) {
                showHint(); 
            }
        }
    });

    document.getElementById('btn-debug-enable').addEventListener('click', enableDebugMode);
    document.getElementById('btn-debug-disable').addEventListener('click', disableDebugMode);
    document.getElementById('btn-debug-recalibrate').addEventListener('click', recalibrateWeights);
    document.getElementById('btn-debug-randomize').addEventListener('click', randomizeBundleData);

    document.getElementById('btn-toggle-debug-stats').addEventListener('click', () => {
        const debugContent = document.getElementById('debug-content');
        const toggleBtn = document.getElementById('btn-toggle-debug-stats');
        if (debugContent.classList.contains('hidden')) {
            debugContent.classList.remove('hidden');
            toggleBtn.innerText = 'Hide Active Stats';
        } else {
            debugContent.classList.add('hidden');
            toggleBtn.innerText = 'Show Active Stats';
        }
    });

    UI.statsBody.addEventListener('input', (e) => {
        if (!AppState.isStatsDebug) return;
        const target = e.target;
        if (target.classList.contains('editable-stat')) {
            const idx = parseInt(target.dataset.idx);
            const field = target.dataset.field;
            const val = parseInt(target.innerText);
            if (!isNaN(val) && AppState.words[idx]) {
                AppState.words[idx][field] = val;
            }
        }
    });

    document.getElementById('btn-settings-undo').addEventListener('click', performSettingsUndo);
    document.getElementById('btn-settings-redo').addEventListener('click', performSettingsRedo);
}

function triggerExport(isAuto = false) {
    saveData(); // Ensure localStorage is up to date

    let fullData = {};
    try {
        const existing = localStorage.getItem('wordBundleStats');
        if (existing) fullData = JSON.parse(existing);
    } catch(e) {}

    const exportObj = {
        timestamp: new Date().toISOString(),
        bundles: fullData.bundles || {},
        settings: fullData.settings || {}
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchorNode = document.createElement('a');
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    const fileName = `LearningApp_FullBackup - ${dateStr} - ${timeStr}.json`;
    
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

async function handleFileImport(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    let successCount = 0;
    let failCount = 0;
    let errors = [];
    let currentBundleUpdated = false;

    // Load current data
    let fullData = {};
    try {
        const existing = localStorage.getItem('wordBundleStats');
        if (existing) fullData = JSON.parse(existing);
    } catch(e) {}
    if (!fullData.bundles) fullData.bundles = {};

    const filePromises = files.map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({ name: file.name, content: e.target.result });
            reader.onerror = () => resolve({ name: file.name, error: "Read error" });
            reader.readAsText(file);
        });
    });

    const results = await Promise.all(filePromises);

    for (const result of results) {
        if (result.error) {
            failCount++;
            errors.push(`${result.name}: Could not read file`);
            continue;
        }

        try {
            const importedData = JSON.parse(result.content);
            
            // Check for new format (all bundles)
            if (importedData.bundles) {
                for (const [bId, bWords] of Object.entries(importedData.bundles)) {
                    // Verify bundle exists in availableBundles to avoid junk data
                    const knownBundle = getAvailableBundles().find(b => b && b.id === bId);
                    if (knownBundle) {
                        fullData.bundles[bId] = bWords;
                        // If this is the currently active bundle, update state
                        if (AppState.currentBundleId === bId) {
                            AppState.words = bWords;
                            currentBundleUpdated = true;
                        }
                    }
                }
                successCount++;
            } 
            // Check for legacy format (single bundle)
            else if (importedData.bundleId && importedData.words) {
                const knownBundle = getAvailableBundles().find(b => b && b.id === importedData.bundleId);
                if (!knownBundle) {
                    failCount++;
                    errors.push(`${result.name}: Unknown Bundle ID (${importedData.bundleId})`);
                    continue;
                }
                fullData.bundles[importedData.bundleId] = importedData.words;
                if (AppState.currentBundleId === importedData.bundleId) {
                    AppState.words = importedData.words;
                    currentBundleUpdated = true;
                }
                successCount++;
            } else {
                failCount++;
                errors.push(`${result.name}: Invalid file format`);
                continue;
            }
        } catch (err) {
            failCount++;
            errors.push(`${result.name}: JSON parse error`);
        }
    }

    if (successCount > 0) {
        localStorage.setItem('wordBundleStats', JSON.stringify(fullData));
        updateTimestamp();
        
        if (currentBundleUpdated) {
            renderStats();
            renderWordlist();
            loadNextWord();
        }
    }
    
    let msg = `Import Complete.\nSuccess: ${successCount}\nFailed: ${failCount}`;
    if (failCount > 0) {
        msg += `\n\nErrors:\n${errors.slice(0, 5).join('\n')}`;
        if (errors.length > 5) msg += '\n...';
    }
    alert(msg);

    event.target.value = '';
}

/* --- DATA HANDLING --- */
function loadGlobalData() {
    const savedJSON = localStorage.getItem('wordBundleStats');
    if (savedJSON) {
        try {
            const data = JSON.parse(savedJSON);
            if (data.settings) {
                AppState.settings = data.settings;
                if (AppState.settings.randomVoice === undefined) AppState.settings.randomVoice = true;
                if (AppState.settings.requireInvertedPunctuation === undefined) AppState.settings.requireInvertedPunctuation = false;
                updateVoiceUI();
                const strictCheck = document.getElementById('strict-accents');
                if(strictCheck) strictCheck.checked = AppState.settings.strictAccents;
                const invertedPunctuationCheck = document.getElementById('require-inverted-punctuation');
                if (invertedPunctuationCheck) invertedPunctuationCheck.checked = AppState.settings.requireInvertedPunctuation;
                SpeechManager.setGender(AppState.settings.voiceGender);
                SpeechManager.setRandom(AppState.settings.randomVoice);

                if (!AppState.settings.bgTheme) AppState.settings.bgTheme = 'bg-rainbow';
                if (!AppState.settings.practiceAnimSpeed) AppState.settings.practiceAnimSpeed = 1;
                if (!AppState.settings.modeGridSize) AppState.settings.modeGridSize = 650;
                if (!AppState.settings.wordlistCols) AppState.settings.wordlistCols = 6;
                if (!AppState.settings.animSpeed) AppState.settings.animSpeed = 1.2;
                AppState.settings.animPreset = '1';
                if (AppState.settings.voiceVolume === undefined) AppState.settings.voiceVolume = 1;
                if (AppState.settings.autoDownload === undefined) AppState.settings.autoDownload = true;
                if (!AppState.settings.autoDownloadFrequency) AppState.settings.autoDownloadFrequency = 10;
                if (AppState.settings.autoCycleThemes === undefined) AppState.settings.autoCycleThemes = true;

                // Migration for newWordDelay: derive from legacy progressSpeed, then practiceDelay, then default
                if (!AppState.settings.newWordDelay) {
                    if (AppState.settings.progressSpeed) {
                        AppState.settings.newWordDelay = AppState.settings.progressSpeed;
                    } else if (AppState.settings.practiceDelay) {
                        AppState.settings.newWordDelay = AppState.settings.practiceDelay;
                    } else {
                        AppState.settings.newWordDelay = 1000;
                    }
                }

                if (!AppState.settings.statsColumns) {
                    AppState.settings.statsColumns = {
                        en: true, es: true, attempts: true, streak: true,
                        correct: true, incorrect: true, weight: true
                    };
                }
                // Ensure 'correct' key exists if migrating from older version
                if (AppState.settings.statsColumns.correct === undefined) {
                    AppState.settings.statsColumns.correct = true;
                }
                if (AppState.settings.statsColumns.incorrect === undefined) {
                    AppState.settings.statsColumns.incorrect = true;
                }

                if (!AppState.settings.practiceStatsColumns) {
                    AppState.settings.practiceStatsColumns = {
                        p_en: true,
                        p_es: true,
                        p_attempts: true,
                        p_streak: true,
                        p_correct: true,
                        p_incorrect: true
                    };
                }
                
                // Force mandatory columns
                AppState.settings.statsColumns.en = true;
                AppState.settings.statsColumns.es = true;

                updateStatsColumnVisibility();
                updatePracticeStatsColumnVisibility();

                // Migration & legacy handling
                AppState.settings.bgTheme = normalizeBackgroundTheme(AppState.settings.bgTheme);
                // Since dark mode toggle is removed, always enable auto-cycling themes.
                AppState.settings.autoCycleThemes = true;

                const newWordDelayInput = document.getElementById('new-word-delay');
                if(newWordDelayInput) {
                    newWordDelayInput.value = AppState.settings.newWordDelay;
                    document.getElementById('new-word-delay-val').innerText = `${(AppState.settings.newWordDelay/1000).toFixed(1)}s`;
                }

                const colsInput = document.getElementById('wordlist-cols');
                if(colsInput) {
                    colsInput.value = AppState.settings.wordlistCols;
                    document.getElementById('wordlist-cols-val').innerText = AppState.settings.wordlistCols;
                    document.documentElement.style.setProperty('--wordlist-cols', AppState.settings.wordlistCols);
                }

                const modeGridSizeInput = document.getElementById('mode-grid-size');
                if (modeGridSizeInput) {
                    modeGridSizeInput.value = AppState.settings.modeGridSize;
                    document.getElementById('mode-grid-size-val').innerText = `${AppState.settings.modeGridSize}px`;
                    document.documentElement.style.setProperty('--mode-grid-max', `${AppState.settings.modeGridSize}px`);
                }

                const animInput = document.getElementById('anim-speed');
                if(animInput) {
                    animInput.value = AppState.settings.animSpeed;
                    document.getElementById('anim-speed-val').innerText = AppState.settings.animSpeed + 'x';
                    document.documentElement.style.setProperty('--anim-speed', AppState.settings.animSpeed);
                }

                document.documentElement.dataset.animPreset = '1';

                const volInput = document.getElementById('voice-volume');
                if(volInput) {
                    volInput.value = AppState.settings.voiceVolume;
                    document.getElementById('voice-volume-val').innerText = Math.round(AppState.settings.voiceVolume * 100) + '%';
                    SpeechManager.setVolume(AppState.settings.voiceVolume);
                }

                const randomVoiceInput = document.getElementById('random-voice');
                if(randomVoiceInput) {
                    randomVoiceInput.checked = AppState.settings.randomVoice;
                }

                const autoDownloadInput = document.getElementById('auto-download');
                if(autoDownloadInput) {
                    autoDownloadInput.checked = AppState.settings.autoDownload;
                }

                const autoDownloadFreqInput = document.getElementById('auto-download-freq');
                if(autoDownloadFreqInput) {
                    autoDownloadFreqInput.value = AppState.settings.autoDownloadFrequency;
                    document.getElementById('auto-download-freq-val').innerText = AppState.settings.autoDownloadFrequency;
                }

                const darkModeToggle = document.getElementById('dark-mode-toggle');
                if (darkModeToggle) {
                    darkModeToggle.checked = (AppState.settings.bgTheme === 'bg-dark-squares');
                }
            }
        } catch (e) {
            console.error("Error loading saved data", e);
        }
    }

    AppState.settings.bgTheme = normalizeBackgroundTheme(AppState.settings.bgTheme);
    setTheme(AppState.settings.bgTheme);
    toggleBackground(AppState.settings.disableBackground);
    handleThemeCycle();

    updateTimestamp();
}

function setupStatsColumnMenu() {
    const btn = document.getElementById('btn-stats-cols');
    const menu = document.getElementById('stats-cols-menu');
    
    if (!btn || !menu) return;

    const columns = [
        { key: 'en', label: 'English' },
        { key: 'es', label: 'Spanish' },
        { key: 'attempts', label: 'Attempts' },
        { key: 'streak', label: 'Streak' },
        { key: 'correct', label: 'Correct' },
        { key: 'incorrect', label: 'Incorrect' },
        { key: 'weight', label: 'Weight' }
    ];

    menu.innerHTML = '';
    columns.forEach(col => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = AppState.settings.statsColumns[col.key];
        
        if (['en', 'es'].includes(col.key)) {
            checkbox.disabled = true;
            label.style.opacity = '0.6';
            label.style.cursor = 'not-allowed';
        }

        checkbox.addEventListener('change', (e) => {
            AppState.settings.statsColumns[col.key] = e.target.checked;
            updateStatsColumnVisibility();
            saveData();
        });
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(col.label));
        menu.appendChild(label);
    });

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== btn) {
            menu.classList.add('hidden');
        }
    });
}

function setupPracticeStatsColumnMenu() {
    const btn = document.getElementById('btn-practice-stats-cols');
    const menu = document.getElementById('practice-stats-cols-menu');
    
    if (!btn || !menu) return;

    const columns = [
        { key: 'p_en', label: 'English' },
        { key: 'p_es', label: 'Spanish' },
        { key: 'p_attempts', label: 'Attempts' },
        { key: 'p_streak', label: 'Streak' },
        { key: 'p_correct', label: 'Correct' },
        { key: 'p_incorrect', label: 'Incorrect' }
    ];

    menu.innerHTML = '';
    columns.forEach(col => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = AppState.settings.practiceStatsColumns[col.key];
        
        if (['p_en', 'p_es'].includes(col.key)) {
            checkbox.disabled = true;
            label.style.opacity = '0.6';
            label.style.cursor = 'not-allowed';
        }

        checkbox.addEventListener('change', (e) => {
            AppState.settings.practiceStatsColumns[col.key] = e.target.checked;
            updatePracticeStatsColumnVisibility();
            saveData();
        });
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(col.label));
        menu.appendChild(label);
    });

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== btn) {
            menu.classList.add('hidden');
        }
    });
}

function setupBundleFilterMenu() {
    const btn = document.getElementById('btn-bundle-filter');
    const menu = document.getElementById('bundle-filter-menu');
    if (!btn || !menu) return;

    menu.innerHTML = '';
    const bundleIds = Object.keys(AppState.wordlistBundleFilter);
    const updateCheckboxStates = () => {
        const checkedCount = Object.values(AppState.wordlistBundleFilter).filter(v => v !== false).length;
        menu.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (cb.checked && checkedCount <= 1) {
                cb.disabled = true;
                cb.parentElement.style.opacity = '0.5';
                cb.parentElement.style.cursor = 'not-allowed';
            } else {
                cb.disabled = false;
                cb.parentElement.style.opacity = '';
                cb.parentElement.style.cursor = '';
            }
        });
    };

    bundleIds.forEach(id => {
        const bundleInfo = getAvailableBundles().find(b => b.id === id);
        if (!bundleInfo) return;
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = AppState.wordlistBundleFilter[id] !== false;
        checkbox.addEventListener('change', (e) => {
            AppState.wordlistBundleFilter[id] = e.target.checked;
            updateCheckboxStates();
            renderWordlist();
        });
        label.appendChild(checkbox);
        const plainName = bundleInfo.name.replace(/^\p{Emoji_Presentation}\s*/u, '').replace(/^\p{So}\s*/u, '');
        label.appendChild(document.createTextNode(plainName));
        menu.appendChild(label);
    });

    updateCheckboxStates();

    // Remove old listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });
}

function updateStatsColumnVisibility() {
    const table = document.querySelector('#view-stats table');
    if (!table) return;
    
    const cols = AppState.settings.statsColumns;
    for (const [key, visible] of Object.entries(cols)) {
        if (visible) {
            table.classList.remove(`hide-col-${key}`);
        } else {
            table.classList.add(`hide-col-${key}`);
        }
    }
}

function updatePracticeStatsColumnVisibility() {
    const table = document.querySelector('#view-practice-stats table');
    if (!table) return;
    
    const cols = AppState.settings.practiceStatsColumns;
    for (const [key, visible] of Object.entries(cols)) {
        if (visible) {
            table.classList.remove(`hide-col-${key}`);
        } else {
            table.classList.add(`hide-col-${key}`);
        }
    }
}

function saveData() {
    if (AppState.isDeleting) return;
    let fullData = {};
    const existing = localStorage.getItem('wordBundleStats');
    if (existing) {
        try { fullData = JSON.parse(existing); } catch(e) {}
    }

    fullData.settings = AppState.settings;
    fullData.lastSaved = new Date().toISOString();

    if (AppState.currentBundleId) {
        if (!fullData.bundles) fullData.bundles = {};
        fullData.bundles[AppState.currentBundleId] = AppState.words;
    }

    localStorage.setItem('wordBundleStats', JSON.stringify(fullData));
    updateTimestamp();
}

function updateTimestamp() {
    const saved = localStorage.getItem('wordBundleStats');
    if (saved) {
        try {
            const date = new Date(JSON.parse(saved).lastSaved);
            UI.timestamp.innerText = `Last Saved: ${date.toLocaleTimeString()} ${date.toLocaleDateString()}`;
        } catch (e) {}
    }
}

function setTheme(themeName) {
    themeName = normalizeBackgroundTheme(themeName);
    AppState.settings.bgTheme = themeName;
    document.body.setAttribute('data-theme', themeName);
    
    const wrapper = document.getElementById('bg-wrapper');
    if (!wrapper) return;

    const activeLayer = wrapper.querySelector('.bg-layer.active') || wrapper.firstElementChild;
    const nextLayer = Array.from(wrapper.children).find(el => el !== activeLayer);

    nextLayer.classList.remove(...THEMES);
    nextLayer.classList.add(themeName);
    
    nextLayer.classList.add('active');
    activeLayer.classList.remove('active');
}

function toggleBackground(isDisabled) {
    if (isDisabled) {
        document.body.classList.add('bg-disabled');
        // Particles stop spawning automatically due to check in initBackgroundParticles
    } else {
        document.body.classList.remove('bg-disabled');
        initBackgroundParticles(); // Restart loop
    }
}

function handleThemeCycle() {
    if (cycleInterval) clearInterval(cycleInterval);
    if (!AppState.settings.autoCycleThemes) return;

    cycleInterval = setInterval(() => {
        let idx = THEMES.indexOf(AppState.settings.bgTheme);
        if (idx === -1) idx = 0;
        let nextIdx = (idx + 1) % THEMES.length;
        setTheme(THEMES[nextIdx]);
    }, 30000); // 30 seconds for relaxing speed
}

/* --- VIEW LOGIC --- */

function crossfadeViews(fromView, toView, beforeShow = null) {
    const duration = getViewFadeDuration();
    if (fromView) {
        fromView.classList.remove('fade-in');
    }

    setTimeout(() => {
        if (fromView) {
            fromView.classList.add('hidden');
        }
        if (beforeShow) {
            beforeShow();
        }
        toView.classList.remove('hidden');
        void toView.offsetWidth;
        toView.classList.add('fade-in');
        updateDebugUI();
    }, duration);
}

function setSelectorNavState(state) {
    const leftGroup = document.querySelector('.nav-group.left');
    const centerGroup = document.querySelector('.nav-group.center');
    const rightGroup = document.querySelector('.nav-group.right');
    const backBtn = document.getElementById('global-back-btn');
    const navSelectorTitle = document.getElementById('nav-selector-title');
    const tabButtons = document.querySelectorAll('.tab-btn');

    const setCenteredTitle = (titleText) => {
        tabButtons.forEach((btn) => {
            btn.style.display = 'none';
        });
        if (navSelectorTitle) {
            navSelectorTitle.textContent = titleText;
            navSelectorTitle.classList.remove('hidden');
        }
    };

    const seTabBar = document.querySelector('#view-ser-estar .se-tab-bar');
    const ppTabBar = document.querySelector('#view-para-por .pp-tab-bar');

    const setMainTabConfig = (firstLabel, firstTarget, secondLabel, secondTarget) => {
        if (tabButtons[0]) {
            tabButtons[0].textContent = firstLabel;
            tabButtons[0].dataset.target = firstTarget;
        }
        if (tabButtons[1]) {
            tabButtons[1].textContent = secondLabel;
            tabButtons[1].dataset.target = secondTarget;
        }
    };

    const showTabs = () => {
        setMainTabConfig('Wordlist', 'view-wordlist', 'Competitive', 'view-competitive');
        tabButtons.forEach((btn) => {
            btn.style.display = '';
        });
        if (navSelectorTitle) {
            navSelectorTitle.classList.add('hidden');
            navSelectorTitle.textContent = '';
        }
    };

    UI.nav.classList.remove('hidden');
    UI.subNav.classList.add('hidden');

    if (state === 'mode') {
        UI.mainContainer.classList.add('wide');
        if (seTabBar) seTabBar.classList.remove('hidden');
        if (ppTabBar) ppTabBar.classList.remove('hidden');
        UI.nav.classList.remove('mode-nav-muted');
        if (leftGroup) leftGroup.style.display = '';
        if (leftGroup) leftGroup.style.visibility = 'hidden';
        if (centerGroup) centerGroup.style.display = '';
        if (rightGroup) rightGroup.style.display = '';
        if (rightGroup) rightGroup.style.visibility = '';
        setCenteredTitle('Choose Your Topic');
        if (backBtn) {
            backBtn.textContent = '←';
            backBtn.classList.remove('mode-placeholder');
            backBtn.disabled = false;
        }
        return;
    }

    if (state === 'landing') {
        UI.mainContainer.classList.add('wide');
        if (seTabBar) seTabBar.classList.remove('hidden');
        if (ppTabBar) ppTabBar.classList.remove('hidden');
        UI.nav.classList.remove('mode-nav-muted');
        if (leftGroup) leftGroup.style.display = '';
        if (leftGroup) leftGroup.style.visibility = '';
        if (centerGroup) centerGroup.style.display = '';
        if (rightGroup) rightGroup.style.display = '';
        if (rightGroup) rightGroup.style.visibility = '';
        setCenteredTitle('Choose Your Vocabulary');
        if (backBtn) {
            backBtn.textContent = '←';
            backBtn.classList.remove('mode-placeholder');
            backBtn.disabled = false;
        }
        return;
    }

    if (state === 'ser-estar') {
        UI.mainContainer.classList.add('wide');
        UI.nav.classList.remove('mode-nav-muted');
        if (leftGroup) leftGroup.style.display = '';
        if (leftGroup) leftGroup.style.visibility = '';
        if (centerGroup) centerGroup.style.display = '';
        if (rightGroup) rightGroup.style.display = '';
        if (rightGroup) rightGroup.style.visibility = '';

        setMainTabConfig('Practice', 'se-practice', 'Competitive', 'se-competitive');
        tabButtons.forEach((btn) => {
            btn.style.display = '';
            btn.classList.remove('active');
        });
        if (tabButtons[0]) tabButtons[0].classList.add('active');
        if (navSelectorTitle) {
            navSelectorTitle.classList.add('hidden');
            navSelectorTitle.textContent = '';
        }
        setSerEstarPanel('se-practice');

        if (seTabBar) seTabBar.classList.add('hidden');
        if (ppTabBar) ppTabBar.classList.remove('hidden');
        if (backBtn) {
            backBtn.textContent = '←';
            backBtn.classList.remove('mode-placeholder');
            backBtn.disabled = false;
        }
        return;
    }

    if (state === 'para-por') {
        UI.mainContainer.classList.add('wide');
        UI.nav.classList.remove('mode-nav-muted');
        if (leftGroup) leftGroup.style.display = '';
        if (leftGroup) leftGroup.style.visibility = '';
        if (centerGroup) centerGroup.style.display = '';
        if (rightGroup) rightGroup.style.display = '';
        if (rightGroup) rightGroup.style.visibility = '';

        setMainTabConfig('Practice', 'pp-practice', 'Competitive', 'pp-competitive');
        tabButtons.forEach((btn) => {
            btn.style.display = '';
            btn.classList.remove('active');
        });
        if (tabButtons[0]) tabButtons[0].classList.add('active');
        if (navSelectorTitle) {
            navSelectorTitle.classList.add('hidden');
            navSelectorTitle.textContent = '';
        }
        setParaPorPanel('pp-practice');

        if (seTabBar) seTabBar.classList.remove('hidden');
        if (ppTabBar) ppTabBar.classList.add('hidden');
        if (backBtn) {
            backBtn.textContent = '←';
            backBtn.classList.remove('mode-placeholder');
            backBtn.disabled = false;
        }
        return;
    }

    if (seTabBar) seTabBar.classList.remove('hidden');
    if (ppTabBar) ppTabBar.classList.remove('hidden');

    UI.nav.classList.remove('mode-nav-muted');
    if (leftGroup) leftGroup.style.display = '';
    if (leftGroup) leftGroup.style.visibility = '';
    if (centerGroup) centerGroup.style.display = '';
    if (rightGroup) rightGroup.style.display = '';
    if (rightGroup) rightGroup.style.visibility = '';
    showTabs();
    if (backBtn) {
        backBtn.textContent = '←';
        backBtn.classList.remove('mode-placeholder');
        backBtn.disabled = false;
    }
}

function renderModeSelect() {
    UI.modeGrid.innerHTML = '';
    const modesPage0 = [
        { name: 'Vocabulary', active: true, action: 'vocabulary' },
        { name: 'SER or ESTAR', active: true, action: 'ser-estar' },
        { name: 'PARA or POR', active: true, action: 'para-por' }
    ];
    while (modesPage0.length < 9) {
        modesPage0.push({ name: '', active: false });
    }

    const modesPage1 = Array.from({ length: 9 }, () => ({ name: '', active: false }));
    const modes = AppState.modePage === 0 ? modesPage0 : modesPage1;

    modes.forEach(mode => {
        const btn = document.createElement('button');
        btn.className = 'mode-btn';
        btn.innerHTML = `<span class="mode-label">${mode.name}</span>`;
        if (!mode.active) {
            btn.disabled = true;
        } else {
            btn.onclick = () => {
                if (mode.action === 'vocabulary') {
                    crossfadeViews(UI.modeSelect, UI.landing, () => {
                        AppState.vocabPage = 0;
                        setSelectorNavState('landing');
                        renderLandingPage();
                        updateCurrentSectionDisplay('view-landing');
                    });
                } else if (mode.action === 'ser-estar') {
                    crossfadeViews(UI.modeSelect, document.getElementById('view-ser-estar'), () => {
                        UI.mainContainer.classList.add('wide');
                        setSelectorNavState('ser-estar');
                        updateCurrentSectionDisplay('view-ser-estar');
                    });
                } else if (mode.action === 'para-por') {
                    crossfadeViews(UI.modeSelect, document.getElementById('view-para-por'), () => {
                        UI.mainContainer.classList.add('wide');
                        setSelectorNavState('para-por');
                        updateCurrentSectionDisplay('view-para-por');
                    });
                }
            };
        }
        UI.modeGrid.appendChild(btn);
    });

    if (UI.modePagePrev) UI.modePagePrev.disabled = AppState.modePage === 0;
    if (UI.modePageNext) UI.modePageNext.disabled = AppState.modePage === 1;
}

function renderLandingPage() {
    UI.bundleGrid.innerHTML = '';
    const savedJSON = localStorage.getItem('wordBundleStats');
    const savedData = savedJSON ? JSON.parse(savedJSON) : {};
    const selectableBundles = AppState.vocabPage === 0 ? getAvailableBundles().slice(0, 6) : [];

    selectableBundles.forEach((bundle, index) => {
        const btn = document.createElement('button');
        btn.className = 'bundle-btn';
        if (bundle) {
            const isCustomBundle = bundle.id === getCustomVocabBundleId();
            if (isCustomBundle) {
                btn.classList.add('bundle-btn-custom');
                if (AppState.isCustomSelectionMode) {
                    btn.classList.add('bundle-btn-custom-armed');
                }
            }

            if (AppState.isCustomSelectionMode && !isCustomBundle && getBaseVocabBundleIds().includes(bundle.id)) {
                btn.classList.add('bundle-btn-selectable');
                if (isBundleSelectedForCustom(bundle.id)) {
                    btn.classList.add('bundle-btn-selected');
                } else {
                    btn.classList.add('bundle-btn-unselected');
                }
            }
            if (!isCustomBundle) {
                btn.classList.add('bundle-btn-static-stats');
            }

            // Calculate Stats
            const runtimeData = getRuntimeBundleData(bundle);
            const freshWords = runtimeData ? parseBundleData(runtimeData) : [];
            let words = freshWords;
            
            if (savedData.bundles && savedData.bundles[bundle.id]) {
                const savedWords = savedData.bundles[bundle.id];
                words = freshWords.length > 0
                    ? mergeSavedWords(freshWords, savedWords)
                    : savedWords;
            }

            const total = words.length;
            const encounters = words.filter(w => w.attempts > 0).length;
            const bronze = words.filter(w => w.streak >= 5 && w.streak < 10).length;
            const silver = words.filter(w => w.streak >= 10 && w.streak < 15).length;
            const gold = words.filter(w => w.streak >= 15).length;

            const pctEncounters = total > 0 ? ((encounters / total) * 100).toFixed(1) : '0.0';
            const pctBronze = total > 0 ? ((bronze / total) * 100).toFixed(1) : '0.0';
            const pctSilver = total > 0 ? ((silver / total) * 100).toFixed(1) : '0.0';
            const pctGold = total > 0 ? ((gold / total) * 100).toFixed(1) : '0.0';

            const statsTitleLine = !isCustomBundle
                ? `<div class="bundle-stats-title">${bundle.name}</div>`
                : '';

            if (isCustomBundle && AppState.isCustomSelectionMode) {
                const selectedIds = getCustomSelectedBundleIds();
                const allBundles = getAvailableBundles();
                let selectedListHTML = '';
                if (selectedIds.length === 0) {
                    selectedListHTML = '<div class="bundle-custom-list-empty">No bundles selected</div>';
                } else {
                    const names = selectedIds.map(id => {
                        const b = allBundles.find(x => x && x.id === id);
                        return b ? b.name : id;
                    });
                    selectedListHTML = '<div class="bundle-custom-list">' + names.map(n => `<div class="bundle-custom-list-item">${n}</div>`).join('') + '</div>';
                }
                btn.innerHTML = `
                    <button type="button" class="bundle-custom-icon-btn custom-action-cancel" title="Cancel">✕</button>
                    <button type="button" class="bundle-custom-icon-btn custom-action-continue" title="Continue">✓</button>
                    <span class="bundle-name">${bundle.name}</span>
                    ${selectedListHTML}`;
            } else if (isCustomBundle) {
                btn.innerHTML = `
                    <span class="bundle-name">${bundle.name}</span>
                    <span class="bundle-custom-hint">Click here to enable multi-select</span>`;
            } else {
                btn.innerHTML = `
                    <div class="bundle-stats">
                        ${statsTitleLine}
                        <div class="bundle-stats-body">
                            <div class="bundle-stat-row">
                                <span class="bundle-stat-label">Seen</span>
                                <div class="bundle-stat-track">
                                    <div class="bundle-stat-fill" style="width: ${pctEncounters}%; background-color: var(--primary);"></div>
                                </div>
                                <span class="bundle-stat-val">${encounters}/${total}</span>
                            </div>
                            <div class="bundle-stat-row">
                                <span class="bundle-stat-label">Bronze</span>
                                <div class="bundle-stat-track">
                                    <div class="bundle-stat-fill" style="width: ${pctBronze}%; background-color: #ed8936;"></div>
                                </div>
                                <span class="bundle-stat-val">${bronze}/${total}</span>
                            </div>
                            <div class="bundle-stat-row">
                                <span class="bundle-stat-label">Silver</span>
                                <div class="bundle-stat-track">
                                    <div class="bundle-stat-fill" style="width: ${pctSilver}%; background-color: #a0aec0;"></div>
                                </div>
                                <span class="bundle-stat-val">${silver}/${total}</span>
                            </div>
                            <div class="bundle-stat-row">
                                <span class="bundle-stat-label">Gold</span>
                                <div class="bundle-stat-track">
                                    <div class="bundle-stat-fill" style="width: ${pctGold}%; background-color: #ecc94b;"></div>
                                </div>
                                <span class="bundle-stat-val">${gold}/${total}</span>
                            </div>
                        </div>
                    </div>`;
            }

            if (isCustomBundle && AppState.isCustomSelectionMode) {
                const continueBtn = btn.querySelector('.custom-action-continue');
                const cancelBtn = btn.querySelector('.custom-action-cancel');

                if (continueBtn) {
                    continueBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (getCustomSelectedBundleIds().length === 0) {
                            alert('Select at least one bundle for Custom before continuing.');
                            return;
                        }
                        AppState.isCustomSelectionMode = false;
                        loadBundle(getRuntimeBundle(bundle));
                    });
                }

                if (cancelBtn) {
                    cancelBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        AppState.isCustomSelectionMode = false;
                        AppState.customSelectedBundleIds = [];
                        renderLandingPage();
                    });
                }
            }

            btn.onclick = () => {
                if (isCustomBundle) {
                    if (!AppState.isCustomSelectionMode) {
                        AppState.isCustomSelectionMode = true;
                        renderLandingPage();
                        return;
                    }
                    // In selection mode, Custom card actions are handled by Continue/Cancel buttons.
                    return;
                }

                if (AppState.isCustomSelectionMode && getBaseVocabBundleIds().includes(bundle.id)) {
                    toggleCustomBundleSelection(bundle.id);
                    renderLandingPage();
                    return;
                }

                loadBundle(bundle);
            };
        } else {
            btn.innerText = "Vocabulary Unavailable";
            btn.disabled = true;
        }
        UI.bundleGrid.appendChild(btn);
    });

    // Always show 9 slots (3x3): page 1 is all placeholders
    const totalSlots = 9;
    for (let i = selectableBundles.length; i < totalSlots; i++) {
        const btn = document.createElement('button');
        btn.className = 'bundle-btn';
        btn.innerText = '';
        btn.disabled = true;
        UI.bundleGrid.appendChild(btn);
    }

    if (UI.vocabPagePrev) UI.vocabPagePrev.disabled = AppState.vocabPage === 0;
    if (UI.vocabPageNext) UI.vocabPageNext.disabled = AppState.vocabPage === 1;
}

function loadBundle(bundle) {
    AppState.currentBundleId = bundle.id;
    const runtimeBundle = getRuntimeBundle(bundle);
    let freshWords = runtimeBundle.data ? parseBundleData(runtimeBundle.data) : [];
    if (bundle.id === getCustomVocabBundleId() && freshWords.length === 0) {
        alert('Custom has no selected bundles. Click Custom, choose bundles, then click Custom again.');
        return;
    }
    const savedJSON = localStorage.getItem('wordBundleStats');
    if (savedJSON) {
        try {
            const savedData = JSON.parse(savedJSON);
            if (savedData.bundles && savedData.bundles[bundle.id]) {
                const savedWords = savedData.bundles[bundle.id];
                freshWords = freshWords.length > 0 ? mergeSavedWords(freshWords, savedWords) : savedWords;
            }
        } catch (e) { console.warn("Failed to merge saved stats"); }
    }

    AppState.words = freshWords;

    // Initialize bundle filter
    const filterIds = bundle.id === getCustomVocabBundleId()
        ? getCustomSelectedBundleIds()
        : [bundle.id];
    AppState.wordlistBundleFilter = {};
    filterIds.forEach(id => { AppState.wordlistBundleFilter[id] = true; });
    setupBundleFilterMenu();

    // Keep selector visible while fading out so resize can happen between fades.
    UI.landing.classList.remove('fade-in');
    setTimeout(() => {
        UI.landing.classList.add('hidden');
        setSelectorNavState('learning');
        renderWordlist();
        renderStats();
        switchView('view-wordlist');
        updateDebugUI();
        loadNextWord();
    }, getViewFadeDuration());
}

function parseBundleData(textData) {
    const lines = textData.trim().split('\n');
    return lines.filter(line => line.trim() !== '').map(line => {
        const parts = line.split(',');
        if (parts.length < 3) return null;
        const enParts = parts[1].split('|').map(s => s.trim());
        const esParts = parts[2].split('|').map(s => s.trim());
        const note = parts[3] ? parts[3].trim() : null;
        return {
            category: parts[0].trim(),
            en: enParts[0],
            en_alts: enParts,
            es: esParts[0],
            es_alts: esParts,
            note: note,
            attempts: 0,
            streak: 0,
            wrong: 0,
            correct: 0,
            skip: 0,
            weight: 100,
            p_attempts: 0,
            p_streak: 0,
            p_wrong: 0,
            p_correct: 0,
            p_skip: 0
        };
    }).filter(item => item !== null);
}

function switchView(viewId) {
    if (AppState.viewTransitionTimer) {
        clearTimeout(AppState.viewTransitionTimer);
        AppState.viewTransitionTimer = null;
    }

    const currentView = document.querySelector('.view:not(.hidden)');
    const currentViewId = currentView ? currentView.id : null;

    document.querySelectorAll('.view').forEach(v => {
        v.classList.add('hidden');
        if (v.id === 'view-stats' || v.id === 'view-wordlist' || v.id === 'view-competitive' || v.id === 'view-practice' || v.id === 'view-landing' || v.id === 'view-practice-stats' || v.id === 'view-mode-select' || v.id === 'view-welcome' || v.id === 'view-ser-estar' || v.id === 'view-para-por') {
            v.classList.remove('fade-in');
            v.style.transition = '';
        }
    });

    if (viewId === 'view-competitive' && AppState.settings.focusMode) {
        document.body.classList.add('focus-mode-active');
    } else {
        document.body.classList.remove('focus-mode-active');
    }

    // Handle Sub-Nav Visibility
    if (viewId === 'view-competitive' || viewId === 'view-stats' || viewId === 'view-practice' || viewId === 'view-practice-stats') {
        UI.subNav.classList.remove('hidden');
        
        if (viewId === 'view-practice' || viewId === 'view-practice-stats') {
            UI.btnSubPlay.innerText = "Play";
            UI.btnSubPlay.dataset.target = "view-practice";
            UI.btnSubStats.innerText = "Statistics";
            UI.btnSubStats.dataset.target = "view-practice-stats";
        } else {
            UI.btnSubPlay.innerText = "Play";
            UI.btnSubPlay.dataset.target = "view-competitive";
            UI.btnSubStats.innerText = "Statistics";
            UI.btnSubStats.dataset.target = "view-stats";
        }

        document.querySelectorAll('.sub-tab-btn').forEach(btn => {
            if (btn.dataset.target === viewId) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    } else {
        UI.subNav.classList.add('hidden');
    }
    
    if (viewId === 'view-stats' || viewId === 'view-wordlist' || viewId === 'view-practice' || viewId === 'view-practice-stats') {
        UI.mainContainer.classList.add('wide');
        const view = document.getElementById(viewId);
        view.classList.remove('hidden');
        
        if (viewId === 'view-stats') renderStats();
        if (viewId === 'view-wordlist') renderWordlist();
        if (viewId === 'view-practice-stats') renderPracticeStats();
        if (viewId === 'view-practice') {
            if (hasSavedPracticeProgress()) {
                resumePracticeMode();
            } else {
                UI.practiceModeSelection.classList.remove('hidden');
                UI.practiceGameArea.classList.add('hidden');
                UI.btnResetPractice.classList.add('hidden');
            }
        }

        if (currentViewId === 'view-stats' || currentViewId === 'view-wordlist' || currentViewId === 'view-practice' || currentViewId === 'view-practice-stats') {
            view.classList.remove('fade-in');
            void view.offsetWidth; // Force reflow
            view.classList.add('fade-in');
        } else {
            // Wait for container expansion animation (0.6s) before fading in content
            const delay = getViewResizeDuration();
            AppState.viewTransitionTimer = setTimeout(() => {
                view.classList.add('fade-in');
                AppState.viewTransitionTimer = null;
            }, delay);
        }
    } else {
        const wasWide = UI.mainContainer.classList.contains('wide');
        UI.mainContainer.classList.remove('wide');
        
        const view = document.getElementById(viewId);
        
        const showView = () => {
            view.classList.remove('hidden');
            void view.offsetWidth; // Force reflow
            view.classList.add('fade-in');
            updateDebugUI();
        };

        if (viewId === 'view-competitive') {
            if (wasWide) {
                const delay = getViewResizeDuration();
                AppState.viewTransitionTimer = setTimeout(() => {
                    showView();
                    AppState.viewTransitionTimer = null;
                }, delay);
            } else {
                showView();
            }
        } else {
            document.getElementById(viewId).classList.remove('hidden');
        }
    }
    
    // Update debug UI button state based on current view
    updateDebugUI();
    
    // Update current section display
    updateCurrentSectionDisplay(viewId);
}

function updateCurrentSectionDisplay(viewId) {
    const sectionDisplay = document.getElementById('current-section-display');
    if (!sectionDisplay) return;
    
    let displayText = 'Current Location: ';
    
    // Build breadcrumb based on current view and state
    if (viewId === 'view-mode-select' || viewId === 'view-welcome') {
        displayText += 'Home';
    } else if (viewId === 'view-landing') {
        displayText += 'Vocabulary > Topic Selection';
    } else if (viewId === 'view-competitive' || viewId === 'view-wordlist' || viewId === 'view-stats') {
        // Vocabulary-related views with bundle selected
        displayText += 'Vocabulary';
        
        if (AppState.currentBundleId) {
            const bundle = getAvailableBundles().find(b => b.id === AppState.currentBundleId);
            const bundleName = bundle ? bundle.name : 'Unknown Topic';
            
            if (AppState.currentBundleId === getCustomVocabBundleId()) {
                const customSelectedBundleIds = getCustomSelectedBundleIds();
                if (customSelectedBundleIds.length > 0) {
                    const bundleNames = customSelectedBundleIds
                        .map(id => getAvailableBundles().find(b => b.id === id)?.name)
                        .filter(Boolean);
                    displayText += ` > Custom (${bundleNames.join(', ')})`;
                } else {
                    displayText += ' > Custom';
                }
            } else {
                displayText += ` > ${bundleName}`;
            }
            
            // Add the specific view type
            const viewTypeMap = {
                'view-competitive': 'Competitive',
                'view-wordlist': 'Wordlist',
                'view-stats': 'Statistics'
            };
            const viewType = viewTypeMap[viewId];
            if (viewType) {
                displayText += ` > ${viewType}`;
            }
        } else {
            // Shouldn't happen but fallback
            displayText += ' > Topic Selection';
        }
    } else if (viewId === 'view-practice' || viewId === 'view-practice-stats') {
        displayText += 'Practice';
        const viewTypeMap = {
            'view-practice': 'Play',
            'view-practice-stats': 'Statistics'
        };
        const viewType = viewTypeMap[viewId];
        if (viewType) {
            displayText += ` > ${viewType}`;
        }
    } else if (viewId === 'view-ser-estar' || viewId === 'se-practice' || viewId === 'se-competitive') {
        displayText += 'Grammar > Ser/Estar';
        if (viewId === 'se-practice') displayText += ' > Practice';
        else if (viewId === 'se-competitive') displayText += ' > Competitive';
    } else if (viewId === 'view-para-por' || viewId === 'pp-practice' || viewId === 'pp-competitive') {
        displayText += 'Grammar > Para/Por';
        if (viewId === 'pp-practice') displayText += ' > Practice';
        else if (viewId === 'pp-competitive') displayText += ' > Competitive';
    } else {
        displayText += 'Unknown Section';
    }
    
    sectionDisplay.textContent = displayText;
}

/* --- WORDLIST VIEW --- */
function renderWordlist() {
    UI.wordlist.scrollTop = 0;
    UI.wordlistContainer.innerHTML = '';
    
    // Bundle filter
    let wordsToRender = [...AppState.words].filter(word => {
        const bundleId = getCategoryBundleId(word.category);
        if (bundleId && AppState.wordlistBundleFilter[bundleId] === false) return false;
        return true;
    });

    // Search filter
    wordsToRender = wordsToRender.filter(word => {
        if (!AppState.wordlistSearch) return true;
        return word.en.toLowerCase().includes(AppState.wordlistSearch) || 
               word.es.toLowerCase().includes(AppState.wordlistSearch);
    });

    // Sort
    if (AppState.wordlistSort.key !== 'default') {
        const key = AppState.wordlistSort.key;
        const order = AppState.wordlistSort.order;
        wordsToRender.sort((a, b) => {
            let valA = a[key];
            let valB = b[key];
            
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Update Buttons UI
    document.querySelectorAll('.sort-btn').forEach(btn => {
        if (!btn.dataset.key) return;
        btn.classList.remove('active');
        let label = btn.dataset.key;
        if (label === 'default') label = 'Default';
        else if (label === 'en') label = 'English';
        else if (label === 'es') label = 'Spanish';
        else if (label === 'skip') label = "Don't Know";
        else if (label === 'wrong') label = 'Wrong';

        if (btn.dataset.key === AppState.wordlistSort.key) {
            btn.classList.add('active');
            if (btn.dataset.key !== 'default') label += AppState.wordlistSort.order === 'asc' ? ' ↑' : ' ↓';
        }
        btn.innerText = label;
    });

    wordsToRender.forEach(word => {
        const div = document.createElement('div');
        div.className = 'word-square';
        
        if (AppState.wordlistSort.key === 'skip' && word.skip === 0) {
            div.classList.add('dimmed');
        }
        if (AppState.wordlistSort.key === 'wrong' && word.wrong === 0) {
            div.classList.add('dimmed');
        }

        let content = `<strong>${word.en}</strong><span>${word.es}</span>`;
        if (AppState.wordlistSort.key === 'skip') {
            content += `<span class="skip-badge">Don't Know: ${word.skip}</span>`;
        } else if (AppState.wordlistSort.key === 'wrong') {
            content += `<span class="wrong-badge">Wrong: ${word.wrong}</span>`;
        }
        const bundleId = getCategoryBundleId(word.category);
        const bundleInfo = bundleId ? getAvailableBundles().find(b => b.id === bundleId) : null;
        if (bundleInfo) {
            const plainName = bundleInfo.name.replace(/^\p{Emoji_Presentation}\s*/u, '').replace(/^\p{So}\s*/u, '');
            content += `<span class="bundle-label">${plainName}</span>`;
        }
        div.innerHTML = content;
        div.addEventListener('click', () => {
            speakSpanish(word.es);
        });
        UI.wordlistContainer.appendChild(div);
    });
}

/* --- PRACTICE MODE LOGIC --- */
function startPracticeMode(direction) {
    if (!AppState.words || AppState.words.length === 0) return;

    AppState.practiceDirection = direction;
    AppState.practiceMatched.clear();
    AppState.practiceSkipped.clear();
    AppState.practiceSearch = '';
    AppState.practiceOrder = AppState.words.map((_, i) => i);
    if (UI.practiceSearch) UI.practiceSearch.value = '';
    
    UI.practiceModeSelection.classList.add('hidden');
    UI.practiceGameArea.classList.remove('hidden');
    UI.btnResetPractice.classList.remove('hidden');
    updatePracticeProgress();
    
    // Entry Animation
    const speed = getAnimationSpeed();
    const durMult = getAnimDurMult();
    const easing = getAnimEasing();
    const duration = 0.4 * durMult / speed;

    const questionArea = document.getElementById('practice-question-area');
    const grid = document.getElementById('practice-options-grid');
    
    questionArea.style.opacity = '0';
    questionArea.style.transform = 'translateY(-20px)';
    grid.style.opacity = '0';
    grid.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
        questionArea.style.transition = `opacity ${duration}s ${easing}, transform ${duration}s ${easing}`;
        questionArea.style.opacity = '1';
        questionArea.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            grid.style.transition = `opacity ${duration}s ${easing}, transform ${duration}s ${easing}`;
            grid.style.opacity = '1';
            grid.style.transform = 'translateY(0)';
        }, 200 * durMult / speed);
    });

    renderPracticeGrid();
    shufflePracticeGrid(); // Shuffle initially for better UX
    pickNextPracticeTarget();
    savePracticeProgress();
}

function hasSavedPracticeProgress() {
    const saved = localStorage.getItem('practiceProgress');
    if (!saved) return false;
    try {
        const data = JSON.parse(saved);
        return data.bundleId === AppState.currentBundleId;
    } catch (e) { return false; }
}

function resumePracticeMode() {
    const saved = localStorage.getItem('practiceProgress');
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        if (data.bundleId !== AppState.currentBundleId) return;

        AppState.practiceDirection = data.direction;
        AppState.practiceMatched = new Set(data.matched);
        AppState.practiceSkipped = new Set(data.skipped);
        AppState.practiceWrongGuesses = new Set(data.wrong);
        AppState.practiceWordIndex = data.currentIndex;
        AppState.practiceOrder = data.order || AppState.words.map((_, i) => i);

        UI.practiceModeSelection.classList.add('hidden');
        UI.practiceGameArea.classList.remove('hidden');
        UI.btnResetPractice.classList.remove('hidden');
        updatePracticeProgress();

        // Restore UI state for current target
        const targetWord = AppState.words[AppState.practiceWordIndex];
        if (targetWord) {
            if (AppState.practiceDirection === 'en-to-es') {
                UI.practiceWord.innerText = targetWord.en;
                UI.practiceAudio.classList.add('hidden');
                AppState.practiceSpanishPrompt = null;
            } else {
                AppState.practiceSpanishPrompt = pickRandomAlternative(targetWord.es_alts, targetWord.es);
                UI.practiceWord.innerText = AppState.practiceSpanishPrompt;
                UI.practiceAudio.classList.remove('hidden');
            }
        } else {
            pickNextPracticeTarget();
        }

        renderPracticeGrid();
    } catch (e) { console.error("Failed to resume practice", e); }
}

function updatePracticeProgress() {
    if (!AppState.words) return;
    const total = AppState.words.length;
    const matched = AppState.practiceMatched.size;
    const pct = total > 0 ? (matched / total) * 100 : 0;
    if (UI.practiceProgressFill) UI.practiceProgressFill.style.width = `${pct}%`;
    if (UI.practiceProgressText) UI.practiceProgressText.innerText = `${matched} / ${total}`;
}

function pickNextPracticeTarget() {
    AppState.practiceWrongGuesses.clear();
    
    const allSquares = UI.practiceGrid.querySelectorAll('.word-square.incorrect-gray');
    allSquares.forEach(el => el.classList.remove('incorrect-gray'));

    const availableIndices = AppState.words
        .map((_, idx) => idx)
        .filter(idx => !AppState.practiceMatched.has(idx));

    if (availableIndices.length === 0) {
        UI.practiceWord.innerText = "All words matched!";
        UI.practiceAudio.classList.add('disabled-audio');
        clearPracticeProgress();
        return;
    }

    // Prioritize words that haven't been skipped yet
    let pool = availableIndices.filter(idx => !AppState.practiceSkipped.has(idx));
    
    if (pool.length === 0) {
        // All remaining words have been skipped at least once, reset skipped to allow them to be picked again
        AppState.practiceSkipped.clear();
        pool = availableIndices;
    }

    const randomIndex = pool[Math.floor(Math.random() * pool.length)];
    AppState.practiceWordIndex = randomIndex;
    const targetWord = AppState.words[randomIndex];

    // Setup UI
    if (AppState.practiceDirection === 'en-to-es') {
        // Target is English, find Spanish
        AppState.practiceSpanishPrompt = null;
        UI.practiceWord.innerText = targetWord.en;
        UI.practiceAudio.classList.add('hidden');
    } else {
        // Target is Spanish, find English
        AppState.practiceSpanishPrompt = pickRandomAlternative(targetWord.es_alts, targetWord.es);
        UI.practiceWord.innerText = AppState.practiceSpanishPrompt;
        UI.practiceAudio.classList.remove('hidden');
        speakSpanish(AppState.practiceSpanishPrompt);
    }
    savePracticeProgress();
}

function skipPracticeWord() {
    if (AppState.practiceWordIndex === null) return;
    AppState.practiceSkipped.add(AppState.practiceWordIndex);
    
    const word = AppState.words[AppState.practiceWordIndex];
    word.p_skip = (word.p_skip || 0) + 1;
    word.p_attempts = (word.p_attempts || 0) + 1;
    
    sessionActionCount++;
    checkSessionMilestones();
    pickNextPracticeTarget();
}

function resetPracticeProgress() {
    if(confirm("Reset current practice session?")) {
        clearPracticeProgress();
        UI.practiceGameArea.classList.add('hidden');
        UI.btnResetPractice.classList.add('hidden');
        UI.practiceModeSelection.classList.remove('hidden');
    }
}

function savePracticeProgress() {
    if (!AppState.currentBundleId) return;
    const data = {
        bundleId: AppState.currentBundleId,
        direction: AppState.practiceDirection,
        matched: Array.from(AppState.practiceMatched),
        skipped: Array.from(AppState.practiceSkipped),
        wrong: Array.from(AppState.practiceWrongGuesses),
        currentIndex: AppState.practiceWordIndex,
        order: AppState.practiceOrder
    };
    localStorage.setItem('practiceProgress', JSON.stringify(data));
}

function clearPracticeProgress() {
    localStorage.removeItem('practiceProgress');
}

function shufflePracticeGrid() {
    const grid = UI.practiceGrid;
    const speed = getAnimationSpeed();
    const durMult = getAnimDurMult();
    const easing = getAnimEasing();
    const flyInDuration = 0.4 * durMult / speed;
    const flyOutDuration = 0.3 * durMult / speed;
    const rowDelay = 100 * durMult / speed;

    const children = Array.from(grid.children);
    if (children.length === 0) return;

    // Lock scroll
    grid.style.overflowY = 'hidden';
    grid.style.overflowX = 'hidden';
    grid.scrollTop = 0;

    const gridRect = grid.getBoundingClientRect();
    const gridCenterX = gridRect.width / 2;
    const gridCenterY = gridRect.height / 2;

    // 1. Fly to center
    children.forEach(child => {
        const rect = child.getBoundingClientRect();
        const childCenterX = (rect.left - gridRect.left) + rect.width / 2;
        const childCenterY = (rect.top - gridRect.top) + rect.height / 2;
        
        const tx = gridCenterX - childCenterX;
        const ty = gridCenterY - childCenterY;

        child.style.transition = `transform ${flyInDuration}s ${easing}, opacity ${flyInDuration}s ${easing}`;
        child.style.transform = `translate(${tx}px, ${ty}px) scale(0.1)`;
        child.style.opacity = '0';
        child.style.zIndex = '10';
    });

    // 2. Shuffle and Fly out
    setTimeout(() => {
        const unmatched = [];
        const matched = [];
        
        Array.from(grid.children).forEach(child => {
            if (child.classList.contains('matched')) {
                matched.push(child);
            } else {
                unmatched.push(child);
            }
        });

        const shuffle = (arr) => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        };

        shuffle(unmatched);
        shuffle(matched);

        unmatched.forEach(child => grid.appendChild(child));
        matched.forEach(child => grid.appendChild(child));

        // Update Order State
        AppState.practiceOrder = Array.from(grid.children).map(child => parseInt(child.dataset.index));
        savePracticeProgress();

        const shuffledChildren = Array.from(grid.children);
        shuffledChildren.forEach(child => {
            child.style.transition = 'none';
            child.style.transform = 'scale(0)';
            child.style.opacity = '0';
        });
            
        void grid.offsetWidth; // Force reflow

        // Calculate Rows
        let currentRowY = -10000;
        let currentRowIndex = -1;
        const rows = new Map();

        shuffledChildren.forEach(child => {
            if (child.offsetTop > currentRowY + 10) { 
                currentRowY = child.offsetTop;
                currentRowIndex++;
            }
            if (!rows.has(currentRowIndex)) rows.set(currentRowIndex, []);
            rows.get(currentRowIndex).push(child);
        });

        // Animate Rows
        rows.forEach((rowChildren, rIndex) => {
            const delay = rIndex * rowDelay;
            rowChildren.forEach(child => {
                setTimeout(() => {
                    child.style.transition = `transform ${flyOutDuration}s ${easing}, opacity ${flyOutDuration}s ${easing}`;
                    child.style.transform = 'scale(1)';
                    child.style.opacity = '1';
                    child.style.zIndex = '';
                }, delay);
            });
        });

        // Restore Scrollbar
        const totalTime = (currentRowIndex * rowDelay) + (flyOutDuration * 1000);
        setTimeout(() => {
            grid.style.overflowY = '';
        }, totalTime);

    }, flyInDuration * 1000);
}

function renderPracticeGrid() {
    UI.practiceGrid.innerHTML = '';
    
    let displayItems = AppState.words.map((word, index) => ({ word, index }));

    const orderMap = new Map(AppState.practiceOrder.map((idx, i) => [idx, i]));

    displayItems.sort((a, b) => {
        const term = AppState.practiceSearch;
        
        // 1. Search Relevance
        if (term) {
            const aMatch = a.word.en.toLowerCase().includes(term) || a.word.es.toLowerCase().includes(term);
            const bMatch = b.word.en.toLowerCase().includes(term) || b.word.es.toLowerCase().includes(term);
            
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
        }

        // 2. Matched Status (Unmatched first)
        const aMatched = AppState.practiceMatched.has(a.index);
        const bMatched = AppState.practiceMatched.has(b.index);

        if (!aMatched && bMatched) return -1;
        if (aMatched && !bMatched) return 1;

        // 3. Stored Order
        const posA = orderMap.has(a.index) ? orderMap.get(a.index) : a.index;
        const posB = orderMap.has(b.index) ? orderMap.get(b.index) : b.index;
        
        return posA - posB;
    });
    
    displayItems.forEach(({ word, index }) => {
        let isDimmed = false;
        if (AppState.practiceSearch) {
            const term = AppState.practiceSearch;
            if (!word.en.toLowerCase().includes(term) && !word.es.toLowerCase().includes(term)) {
                isDimmed = true;
            }
        }

        const div = document.createElement('div');
        div.className = 'word-square';
        div.dataset.index = index;
        if (isDimmed) div.classList.add('search-dimmed');
        
        // If en-to-es (Target EN), grid shows ES.
        // If es-to-en (Target ES), grid shows EN.
        const displayText = AppState.practiceDirection === 'en-to-es' ? word.es : word.en;
        
        // Highlight matching text
        let htmlContent = displayText;
        if (AppState.practiceSearch) {
            htmlContent = displayText.replace(new RegExp(`(${AppState.practiceSearch})`, 'gi'), '<span class="highlight-text">$1</span>');
        }
        div.innerHTML = `<strong>${htmlContent}</strong>`;
        
        if (AppState.practiceSearch && 
            displayText.toLowerCase() === AppState.practiceSearch && 
            !AppState.practiceMatched.has(index) && 
            !AppState.practiceWrongGuesses.has(index)) {
            div.classList.add('exact-match');
        }
        
        if (AppState.practiceMatched.has(index)) {
            div.classList.add('matched');
        }
        
        if (AppState.practiceWrongGuesses.has(index)) {
            div.classList.add('incorrect-gray');
        }

        div.addEventListener('click', () => {
            if (AppState.practiceMatched.has(index)) {
                // Flipcard logic
                const flipDur = getScaledDuration(300);
                const flipEasing = getAnimEasing();
                div.style.transition = `transform ${flipDur/1000}s ${flipEasing}`;
                div.style.transform = 'perspective(600px) rotateY(90deg)';
                
                setTimeout(() => {
                    const currentText = div.querySelector('strong').innerText;
                    const altText = (currentText === word.en) ? word.es : word.en;
                    
                    let htmlContent = altText;
                    if (AppState.practiceSearch) {
                        htmlContent = altText.replace(new RegExp(`(${AppState.practiceSearch})`, 'gi'), '<span class="highlight-text">$1</span>');
                    }
                    div.innerHTML = `<strong>${htmlContent}</strong>`;
                    
                    div.style.transition = 'none';
                    div.style.transform = 'perspective(600px) rotateY(-90deg)';
                    void div.offsetWidth;
                    
                    div.style.transition = `transform ${flipDur/1000}s ${flipEasing}`;
                    div.style.transform = 'perspective(600px) rotateY(0deg)';
                    
                    setTimeout(() => {
                        div.style.transition = '';
                        div.style.transform = '';
                    }, flipDur);
                }, flipDur);
                return;
            }

            if (AppState.practiceWrongGuesses.has(index)) return;

            if (index === AppState.practiceWordIndex) {
                // Correct
                div.classList.add('matched');
                AppState.practiceMatched.add(index);
                
                word.p_correct = (word.p_correct || 0) + 1;
                word.p_attempts = (word.p_attempts || 0) + 1;
                if (!AppState.practiceWrongGuesses.has(index)) {
                    word.p_streak = (word.p_streak || 0) + 1;
                } else {
                    word.p_streak = 0;
                }

                updatePracticeProgress();
                playSuccessSound();
                
                if (AppState.practiceDirection === 'en-to-es') speakSpanish(word.es);
                
                if (AppState.practiceSearch) {
                    AppState.practiceSearch = '';
                    if (UI.practiceSearch) UI.practiceSearch.value = '';
                    renderPracticeGrid();
                }

                sessionActionCount++;
                checkSessionMilestones();
                savePracticeProgress();
                pickNextPracticeTarget();
            } else {
                // Wrong
                AppState.practiceWrongGuesses.add(index);
                
                const targetWord = AppState.words[AppState.practiceWordIndex];
                targetWord.p_wrong = (targetWord.p_wrong || 0) + 1;
                targetWord.p_streak = 0;

                div.classList.add('wrong-shake');
                div.classList.add('incorrect-gray');
                setTimeout(() => div.classList.remove('wrong-shake'), 500);
                sessionActionCount++;
                checkSessionMilestones();
                savePracticeProgress();
            }
        });
        
        UI.practiceGrid.appendChild(div);
    });
}

/* --- COMPETITIVE LOGIC --- */
function getWeightedWord() {
    // Filter out Gold words (streak >= 15)
    const candidates = AppState.words.map((word, index) => ({ ...word, originalIndex: index }))
                                     .filter(w => w.streak < 15);

    if (candidates.length === 0) return -1;

    const totalWeight = candidates.reduce((sum, word) => sum + word.weight, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < candidates.length; i++) {
        random -= candidates[i].weight;
        if (random <= 0) {
            return candidates[i].originalIndex;
        }
    }
    return candidates[0].originalIndex;
}

function loadNextWord() {
    resetControls();
    AppState.isLocked = false;

    if (AppState.isTestWord) {
        AppState.testWordCounter = AppState.testWordCounter === 1 ? 2 : 1;
        const text = `TESTING ${AppState.testWordCounter}`;
        UI.questionLabel.innerText = "DEBUG MODE";
        UI.questionWord.innerText = text;
        UI.input.placeholder = `Type ${text}...`;
        UI.questionAudioBtn.classList.add('disabled-audio');
        return;
    }

    if (!AppState.words || AppState.words.length === 0) {
        UI.questionWord.innerText = "No words loaded.";
        UI.questionLabel.innerText = "Select a Bundle";
        UI.input.placeholder = "";
        UI.input.disabled = true;
        return;
    }

    const index = getWeightedWord();
    if (index === -1) {
        UI.questionWord.innerText = "Bundle Completed!";
        UI.questionLabel.innerText = "All words mastered (Gold Rank)";
        UI.input.placeholder = "";
        UI.input.disabled = true;
        UI.questionAudioBtn.classList.add('disabled-audio');
        UI.btnSkip.classList.add('hidden');
        UI.btnHint.classList.add('hidden');
        return;
    }
    AppState.currentWordIndex = index;
    const wordObj = AppState.words[index];
    AppState.currentSpanishPrompt = pickRandomAlternative(wordObj.es_alts, wordObj.es);
    AppState.currentDirection = Math.random() > 0.5 ? 'en-to-es' : 'es-to-en';

    if (AppState.currentDirection === 'en-to-es') {
        UI.questionLabel.innerText = "Translate to Spanish:";
        UI.questionWord.innerText = wordObj.en;
        UI.input.placeholder = "Type Spanish word...";
        UI.questionAudioBtn.classList.add('disabled-audio');
    } else {
        UI.questionLabel.innerText = "Translate to English:";
        UI.questionWord.innerText = AppState.currentSpanishPrompt;
        UI.input.placeholder = "Type English word...";
        UI.questionAudioBtn.classList.remove('disabled-audio');
    }

    if (wordObj.note) {
        UI.questionNote.innerText = `(${wordObj.note})`;
        UI.questionNote.classList.remove('hidden');
    } else {
        UI.questionNote.classList.add('hidden');
    }
    renderDebugInfo();
}

function resetControls() {
    UI.input.value = '';
    UI.input.disabled = false;
    UI.feedback.innerText = '';
    UI.feedback.style.color = '';
    UI.competitive.classList.remove('correct-state', 'wrong-state');
    UI.streakProgressWrapper.classList.add('hidden');
    UI.questionNote.classList.add('hidden');
    
    UI.btnSkip.style.display = '';
    UI.btnHint.style.display = '';
    UI.statusMessage.classList.add('hidden');
    UI.btnSkip.classList.remove('hidden');
    UI.btnHint.classList.remove('hidden');
    
    UI.btnHint.innerText = "Hint";
    UI.btnHint.disabled = false;
    UI.btnUndo.classList.add('hidden');
    
    UI.progressContainer.classList.add('hidden');
    UI.progressBar.style.width = '0%';
    UI.progressBar.style.transition = 'none';
    
    UI.hintDisplay.innerText = '';
    UI.hintDisplay.classList.add('hidden');
    
    hintStage = 0;
    
    UI.input.focus();
}

function enableDebugMode() {
    if (!isDebugLocationEligible()) {
        updateDebugUI();
        return;
    }

    if (AppState.isTestWord) return;

    resetControls();
    AppState.isLocked = false;
    AppState.isStatsDebug = false;
    AppState.isTestWord = true;
    AppState.testWordCounter = 1;

    UI.questionLabel.innerText = "DEBUG MODE";
    UI.questionWord.innerText = "TESTING 1";
    UI.input.placeholder = "Type TESTING 1...";

    if (!UI.testingContainer.classList.contains('hidden') && UI.debugContent) {
        UI.debugContent.innerHTML = '<p><strong>Debug Mode Active</strong><br>Stats are disabled.</p>';
    }
    updateDebugUI();
}

function disableDebugMode() {
    console.log("Disable Debug Mode clicked");
    
    // Handle Stats Debug
    if (AppState.isStatsDebug) {
        AppState.isStatsDebug = false;
        renderStats();
        updateDebugUI();
        if (UI.debugContent) UI.debugContent.innerHTML = '<p>Debug Mode Disabled</p>';
        saveData();
        return;
    }

    // Handle Competitive Debug
    if (!AppState.isTestWord) return;

    if (transitionTimer) clearTimeout(transitionTimer);
    AppState.isTestWord = false;
    
    if (!UI.testingContainer.classList.contains('hidden') && UI.debugContent) {
        UI.debugContent.innerHTML = '<p>Debug Mode Disabled</p>';
    }
    if (UI.competitive.classList.contains('hidden')) {
        switchView('view-competitive');
    }
    updateDebugUI();
    loadNextWord();
}

function calculateWeight(word) {
    let weight = 100;
    weight += (word.wrong * 15);
    weight += (word.skip * 10);
    weight -= (word.streak * 10);
    weight -= (word.attempts * 1);
    return Math.max(1, Math.min(1000, weight));
}

function updateWordWeight(word) {
    word.weight = calculateWeight(word);
}

function randomizeBundleData() {
    if (!confirm('Randomize all bundle stats in browser storage? This cannot be undone.')) return;
    const fullData = loadStoredBundleData();
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    for (const bundleId of Object.keys(fullData.bundles)) {
        const words = fullData.bundles[bundleId];
        if (!Array.isArray(words)) continue;
        for (const w of words) {
            const correct = randInt(0, 100);
            const wrong = randInt(0, 100);
            const attempts = correct + wrong;
            const streak = randInt(0, correct);
            const skip = randInt(0, 100);
            w.attempts = attempts;
            w.correct = correct;
            w.wrong = wrong;
            w.streak = streak;
            w.skip = skip;
        }
    }
    localStorage.setItem('wordBundleStats', JSON.stringify(fullData));
    if (AppState.currentBundleId && fullData.bundles[AppState.currentBundleId]) {
        AppState.words = fullData.bundles[AppState.currentBundleId];
    }
    if (!UI.stats.classList.contains('hidden')) renderStats();
    renderLandingPage();
    alert('Bundle stats randomized.');
}

function recalibrateWeights() {
    if (!AppState.words || AppState.words.length === 0) return;
    if (confirm("Recalibrate weights based on performance stats?")) {
        AppState.words.forEach(w => updateWordWeight(w));
        saveData();
        if (!UI.stats.classList.contains('hidden')) renderStats();
        alert("Weights recalibrated.");
    }
}

function isDebugLocationEligible() {
    return !UI.competitive.classList.contains('hidden') && AppState.currentBundleId !== null;
}

function clearDebugStateForIneligibleLocation() {
    const hadCompetitiveDebug = AppState.isTestWord;
    const hadStatsDebug = AppState.isStatsDebug;

    if (!hadCompetitiveDebug && !hadStatsDebug) return;

    if (transitionTimer) clearTimeout(transitionTimer);
    AppState.isTestWord = false;
    AppState.isStatsDebug = false;

    if (hadStatsDebug && !UI.stats.classList.contains('hidden')) {
        renderStats();
    }

    if (hadCompetitiveDebug && AppState.currentBundleId && AppState.words.length > 0) {
        loadNextWord();
    }

    if (UI.debugContent) {
        UI.debugContent.innerHTML = '<p>Debug Mode Disabled</p>';
    }
}

function updateDebugUI() {
    const enableBtn = document.getElementById('btn-debug-enable');
    const disableBtn = document.getElementById('btn-debug-disable');
    const debugControls = document.getElementById('debug-controls');
    const actionRow = document.getElementById('debug-action-row');
    const locationMessage = document.getElementById('debug-location-message');
    if (!enableBtn || !disableBtn) return;

    const isEligible = isDebugLocationEligible();

    if (!isEligible) {
        clearDebugStateForIneligibleLocation();
    }

    if (locationMessage) {
        if (isEligible) {
            locationMessage.classList.add('hidden');
        } else {
            locationMessage.classList.remove('hidden');
            locationMessage.innerHTML = '<p><strong>Note:</strong> You must be in the Competitive mode of a wordlist to use the debug menu.</p>';
        }
    }

    enableBtn.disabled = !isEligible;
    disableBtn.disabled = !isEligible;
    if (actionRow) {
        actionRow.classList.toggle('debug-location-disabled', !isEligible);
    }

    if (isEligible && (AppState.isTestWord || AppState.isStatsDebug)) {
        enableBtn.classList.add('selected');
        disableBtn.classList.remove('selected');
        if (debugControls) debugControls.classList.remove('debug-disabled');
    } else {
        enableBtn.classList.remove('selected');
        disableBtn.classList.add('selected');
        if (debugControls) debugControls.classList.add('debug-disabled');
    }

    enableBtn.style.opacity = '';
    enableBtn.style.cursor = '';
    enableBtn.style.pointerEvents = '';
}

let hintStage = 0;
let transitionTimer = null;

function showHint() {
    if (AppState.isLocked) return;
    const wordObj = AppState.words[AppState.currentWordIndex];
    const target = AppState.currentDirection === 'en-to-es'
        ? (AppState.currentSpanishPrompt || wordObj.es)
        : wordObj.en;
    if (AppState.isTestWord) return;
    
    const accentMatch = target.match(/[áéíóúüñÁÉÍÓÚÜÑ]/);
    const hasAccent = !!accentMatch;

    hintStage++;
    
    let hintText = '';
    if (hintStage === 1) {
        hintText = target.substring(0, 1);
    } else if (hintStage === 2) {
        hintText = target.substring(0, Math.ceil(target.length / 2));
        if (!hasAccent) {
            UI.btnHint.disabled = true;
        }
    } else if (hintStage === 3 && hasAccent) {
        const currentLen = Math.ceil(target.length / 2);
        const revealLen = Math.max(currentLen, accentMatch.index + 1);
        hintText = target.substring(0, revealLen);
        UI.btnHint.disabled = true;
    }
    
    if (hintText) {
        UI.hintDisplay.innerText = hintText + '...';
        UI.hintDisplay.classList.remove('hidden');
    }
    UI.input.focus();
}

function skipWord() {
    if (AppState.isLocked) return;
    const word = AppState.words[AppState.currentWordIndex];
    
    if (AppState.isTestWord) {
        UI.questionWord.innerText = `TESTING ${AppState.testWordCounter}`;
        UI.competitive.classList.add('wrong-state');
        UI.btnUndo.classList.remove('hidden');
        triggerTransition('wrong');
        return;
    }
    word.skip++;
    word.attempts++;
    
    const target = AppState.currentDirection === 'en-to-es'
        ? (AppState.currentSpanishPrompt || word.es)
        : word.en;
    UI.questionWord.innerText = target;
    UI.competitive.classList.add('wrong-state');
    UI.btnUndo.classList.remove('hidden');
    AppState.lastAction = 'skip';
    addToHistory(AppState.currentWordIndex, 'skip', word.streak);
    updateWordWeight(word);
    syncCompetitiveStatsToMirrorBundles(word);

    saveData();
    sessionActionCount++;
    checkSessionMilestones();
    speakSpanish(AppState.currentSpanishPrompt || word.es);
    triggerTransition('wrong');
}

function normalizeForComparison(text, ignoreAccents, ignoreInvertedPunctuation, normalizeBoundaryPairs = false) {
    let normalized = text.trim();
    if (normalizeBoundaryPairs) {
        if (normalized.endsWith('?') && !normalized.startsWith('¿')) {
            normalized = `¿${normalized}`;
        }
        if (normalized.endsWith('!') && !normalized.startsWith('¡')) {
            normalized = `¡${normalized}`;
        }
    }
    if (ignoreInvertedPunctuation) {
        normalized = normalized.replace(/[¿¡]/g, '');
    }
    if (ignoreAccents) {
        normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    return normalized.toLowerCase();
}

function hasRequiredBoundaryPunctuation(userText, targetText) {
    const userTrimmed = userText.trim();
    const targetTrimmed = targetText.trim();
    const expectsQuestionPair = targetTrimmed.startsWith('¿') || targetTrimmed.endsWith('?');
    const expectsExclamationPair = targetTrimmed.startsWith('¡') || targetTrimmed.endsWith('!');

    if (expectsQuestionPair) {
        return userTrimmed.startsWith('¿') && userTrimmed.endsWith('?');
    }
    if (expectsExclamationPair) {
        return userTrimmed.startsWith('¡') && userTrimmed.endsWith('!');
    }
    return true;
}

function submitAnswer() {
    if (AppState.isLocked) return;
    const userVal = UI.input.value.trim();
    if (!userVal) return;

    if (AppState.isTestWord) {
        if (userVal.toUpperCase() === `TESTING ${AppState.testWordCounter}`) {
            UI.feedback.innerText = "Correct!";
            UI.feedback.style.color = 'var(--success)';
            UI.competitive.classList.add('correct-state');
            triggerTransition('correct');
        } else {
            UI.feedback.innerText = "Wrong!";
            UI.competitive.classList.add('wrong-state');
            UI.btnUndo.classList.remove('hidden');
            triggerTransition('wrong');
        }
        return;
    }
    const wordObj = AppState.words[AppState.currentWordIndex];
    
    const targets = AppState.currentDirection === 'en-to-es' ? wordObj.es_alts : wordObj.en_alts;
    const primaryTarget = AppState.currentDirection === 'en-to-es'
        ? (AppState.currentSpanishPrompt || wordObj.es)
        : wordObj.en;
    const userWithoutBrackets = stripBracketSections(userVal);
    
    const ignoreInvertedPunctuation = !AppState.settings.requireInvertedPunctuation;
    const normalizeBoundaryPairs = AppState.settings.requireInvertedPunctuation;
    const strictUser = normalizeForComparison(userVal, false, ignoreInvertedPunctuation, normalizeBoundaryPairs);
    const strictUserNoBrackets = normalizeForComparison(userWithoutBrackets, false, ignoreInvertedPunctuation, normalizeBoundaryPairs);
    const normUser = normalizeForComparison(userVal, true, ignoreInvertedPunctuation, normalizeBoundaryPairs);
    const normUserNoBrackets = normalizeForComparison(userWithoutBrackets, true, ignoreInvertedPunctuation, normalizeBoundaryPairs);
    
    let strictMatch = false;
    let looseMatch = false;
    let matchedTarget = null;

    for (const t of targets) {
        if (!ignoreInvertedPunctuation && !hasRequiredBoundaryPunctuation(userVal, t)) {
            continue;
        }
        const optionalTarget = stripBracketSections(t);
        const candidates = optionalTarget && optionalTarget !== t ? [t, optionalTarget] : [t];

        for (const candidate of candidates) {
            const strictTarget = normalizeForComparison(candidate, false, ignoreInvertedPunctuation, normalizeBoundaryPairs);
            const normTarget = normalizeForComparison(candidate, true, ignoreInvertedPunctuation, normalizeBoundaryPairs);

            if (strictUser === strictTarget || strictUserNoBrackets === strictTarget) {
                strictMatch = true;
            }
            if (normUser === normTarget || normUserNoBrackets === normTarget) {
                looseMatch = true;
                matchedTarget = candidate;
            }
        }
    }

    if (strictMatch || (!AppState.settings.strictAccents && looseMatch)) {
        handleCorrect(wordObj, primaryTarget);
    } else if (AppState.settings.strictAccents && looseMatch && !strictMatch) {
        let missingChar = '';
        for (let i = 0; i < matchedTarget.length; i++) {
            if (i >= userVal.length) break;
            if (matchedTarget[i] !== userVal[i]) {
                if (/[áéíóúüñÁÉÍÓÚÜÑ]/.test(matchedTarget[i])) {
                    missingChar = matchedTarget[i];
                    break;
                }
            }
        }
        UI.feedback.innerText = `Accent missing! Requires '${missingChar}'`;
    } else {
        handleIncorrect(wordObj, primaryTarget);
    }
    saveData();
}

function handleCorrect(word, target) {
    word.attempts++;
    word.streak++;
    word.correct = (word.correct || 0) + 1;
    if ([5, 10, 15].includes(word.streak)) {
        let badgeColors = null;
        if (word.streak === 5) badgeColors = ['#f8e3cc', '#ed8936', '#c05621']; // Bronze
        else if (word.streak === 10) badgeColors = ['#e2e8f0', '#a0aec0', '#718096']; // Silver
        else if (word.streak === 15) badgeColors = ['#fff5b1', '#ecc94b', '#b7791f']; // Gold

        triggerConfetti('implode', 5, 2, badgeColors);
        setTimeout(() => {
            triggerConfetti('burst', 2, 2, badgeColors);
        }, 1000);
    }

    const milestones = [5, 10, 15];
    const nextMilestone = milestones.find(m => m > word.streak);
    
    if (nextMilestone) {
        const diff = nextMilestone - word.streak;
        const badgeName = {
            5: 'Bronze', 10: 'Silver', 15: 'Gold'
        }[nextMilestone];
        UI.feedback.innerText = `${diff} more for ${badgeName} badge!`;
        UI.feedback.style.color = 'var(--success)';

        // Progress Bar Logic
        const milestoneIdx = milestones.indexOf(nextMilestone);
        const prevMilestone = milestoneIdx > 0 ? milestones[milestoneIdx - 1] : 0;
        const totalRange = nextMilestone - prevMilestone;
        const currentProgress = word.streak - prevMilestone;
        const progressPerc = Math.min(100, Math.max(0, (currentProgress / totalRange) * 100));
        
        UI.streakProgressFill.style.width = `${progressPerc}%`;
        UI.streakProgressWrapper.classList.remove('hidden');
    } else if (word.streak >= 15) {
        UI.feedback.innerText = "Gold badge achieved!";
        UI.feedback.style.color = 'var(--success)';
        UI.streakProgressFill.style.width = '100%';
        UI.streakProgressWrapper.classList.remove('hidden');
    }

    updateWordWeight(word);
    syncCompetitiveStatsToMirrorBundles(word);
    addToHistory(AppState.words.indexOf(word), 'correct', word.streak - 1);
    UI.competitive.classList.add('correct-state');
    sessionActionCount++;
    checkSessionMilestones();
    speakSpanish(AppState.currentSpanishPrompt || word.es);
    triggerTransition('correct');
}

function handleIncorrect(word, target) {
    word.attempts++;
    word.wrong++;
    previousStreak = word.streak;
    word.streak = 0;
    addToHistory(AppState.words.indexOf(word), 'wrong', previousStreak);
    updateWordWeight(word);
    syncCompetitiveStatsToMirrorBundles(word);
    UI.competitive.classList.add('wrong-state');
    UI.questionWord.innerText = `${target}`;
    sessionActionCount++;
    checkSessionMilestones();
    UI.btnUndo.classList.remove('hidden');
    AppState.lastAction = 'wrong';
    speakSpanish(AppState.currentSpanishPrompt || word.es);
    triggerTransition('wrong');
}

function triggerTransition(type) {
    AppState.isLocked = true;
    UI.input.disabled = true;
    if (type !== 'wrong') { 
        UI.statusMessage.classList.remove('hidden');
    }
    UI.progressContainer.classList.remove('hidden');
    void UI.progressBar.offsetWidth; 
    const duration = AppState.settings.newWordDelay || 1000;

    UI.progressBar.style.transition = `width ${duration/1000}s linear`;
    UI.progressBar.style.width = '100%';
    transitionTimer = setTimeout(() => {
        loadNextWord();
    }, duration);
}

function undoAction() {
    clearTimeout(transitionTimer);
    
    if (AppState.isTestWord) {
        AppState.isLocked = false;
        UI.competitive.classList.remove('wrong-state');
        UI.btnUndo.classList.add('hidden');
        UI.progressContainer.classList.add('hidden');
        UI.progressBar.style.width = '0%';
        UI.questionWord.innerText = `TESTING ${AppState.testWordCounter}`;
        UI.input.disabled = false;
        UI.input.focus();
        UI.feedback.innerText = '';
        UI.feedback.style.color = '';
        return;
    }

    const word = AppState.words[AppState.currentWordIndex];
    
    if (AppState.lastAction === 'skip') {
        word.skip--;
        word.attempts--;
    } else {
        word.wrong--;
        word.streak = previousStreak;
        word.attempts--;
    }
    const popped = AppState.actionHistory.pop();
    if (popped) AppState.redoHistory = [popped];
    updateSettingsUndoLabel();
    updateWordWeight(word);
    syncCompetitiveStatsToMirrorBundles(word);

    saveData();
    AppState.isLocked = false;
    UI.competitive.classList.remove('wrong-state');
    UI.btnUndo.classList.add('hidden');
    UI.progressContainer.classList.add('hidden');
    UI.progressBar.style.width = '0%';
    
    if (AppState.currentDirection === 'en-to-es') {
        UI.questionWord.innerText = word.en;
    } else {
        UI.questionWord.innerText = word.es;
    }
    UI.input.disabled = false;
    UI.input.focus();
}

function checkSessionMilestones() {
    const freq = AppState.settings.autoDownloadFrequency || 10;
    if (sessionActionCount > 0 && sessionActionCount % freq === 0 && AppState.settings.autoDownload) {
        triggerExport(true);
    }
    if (sessionActionCount >= 15) {
        UI.savePrompt.classList.add('visible');
    }
}

function addToHistory(wordIndex, action, prevStreak) {
    AppState.actionHistory = [{
        index: wordIndex,
        action: action,
        prevStreak: prevStreak
    }];
    AppState.redoHistory = [];
    updateSettingsUndoLabel();
}

function updateSettingsUndoLabel() {
    const label = document.getElementById('settings-undo-label');
    const btn = document.getElementById('btn-settings-undo');
    const redoBtn = document.getElementById('btn-settings-redo');
    if (!label || !btn) return;

    btn.innerText = "Undo";
    if (redoBtn) redoBtn.innerText = "Redo";

    if (AppState.actionHistory.length === 0) {
        btn.disabled = true;
        if (AppState.redoHistory.length > 0 && redoBtn) {
            const next = AppState.redoHistory[0];
            const word = AppState.words[next.index];
            let actionText = next.action.charAt(0).toUpperCase() + next.action.slice(1);
            label.innerText = `Redo available: ${actionText} on "${word.en}"`;
        } else {
            label.innerText = "Nothing to undo";
        }
    } else {
        btn.disabled = false;
        const last = AppState.actionHistory[0];
        const word = AppState.words[last.index];
        let actionText = last.action.charAt(0).toUpperCase() + last.action.slice(1);
        
        btn.innerText = `Undo ${actionText}`;
        label.innerText = `Last Action: ${actionText} on "${word.en}"`;
    }

    if (redoBtn) {
        if (AppState.redoHistory.length === 0) {
            redoBtn.disabled = true;
        } else {
            redoBtn.disabled = false;
            const next = AppState.redoHistory[0];
            let actionText = next.action.charAt(0).toUpperCase() + next.action.slice(1);
            redoBtn.innerText = `Redo ${actionText}`;
        }
    }
}

function performSettingsUndo() {
    if (AppState.actionHistory.length === 0) return;
    const last = AppState.actionHistory.pop();
    AppState.redoHistory = [last];

    const word = AppState.words[last.index];

    if (last.action === 'correct') {
        word.streak = Math.max(0, word.streak - 1);
        word.attempts = Math.max(0, word.attempts - 1);
        word.correct = Math.max(0, (word.correct || 0) - 1);
    } else if (last.action === 'wrong') {
        word.wrong = Math.max(0, word.wrong - 1);
        word.attempts = Math.max(0, word.attempts - 1);
        word.streak = last.prevStreak;
    } else if (last.action === 'skip') {
        word.skip = Math.max(0, word.skip - 1);
        word.attempts = Math.max(0, word.attempts - 1);
    }
    updateWordWeight(word);
    saveData();
    if (!UI.stats.classList.contains('hidden')) renderStats();
    updateSettingsUndoLabel();
}

function performSettingsRedo() {
    if (AppState.redoHistory.length === 0) return;
    const next = AppState.redoHistory.pop();
    AppState.actionHistory = [next];

    const word = AppState.words[next.index];

    if (next.action === 'correct') {
        word.streak++;
        word.attempts++;
        word.correct = (word.correct || 0) + 1;
    } else if (next.action === 'wrong') {
        word.wrong++;
        word.attempts++;
        word.streak = 0;
    } else if (next.action === 'skip') {
        word.skip++;
        word.attempts++;
    }
    updateWordWeight(word);
    saveData();
    if (!UI.stats.classList.contains('hidden')) renderStats();
    updateSettingsUndoLabel();
}

/* --- STATS LOGIC & SORTING --- */
function sortStats(column) {
    if (AppState.sort.column === column) {
        AppState.sort.order = AppState.sort.order === 'asc' ? 'desc' : 'asc';
    } else {
        AppState.sort.column = column;
        AppState.sort.order = 'desc'; 
        if(column === 'en' || column === 'es') AppState.sort.order = 'asc';
    }

    updateSortHeaderStyles();
    renderStats();
}

function sortPracticeStats(column) {
    if (AppState.practiceSort.column === column) {
        AppState.practiceSort.order = AppState.practiceSort.order === 'asc' ? 'desc' : 'asc';
    } else {
        AppState.practiceSort.column = column;
        AppState.practiceSort.order = 'desc'; 
        if(column === 'p_en' || column === 'p_es') AppState.practiceSort.order = 'asc';
    }

    updatePracticeSortHeaderStyles();
    renderPracticeStats();
}

function updatePracticeSortHeaderStyles() {
    document.querySelectorAll('#view-practice-stats th[data-sort]').forEach(th => {
        th.classList.remove('active-sort', 'asc', 'desc');
        if (th.dataset.sort === AppState.practiceSort.column) {
            th.classList.add('active-sort');
            th.classList.add(AppState.practiceSort.order);
        }
    });
}

function renderPracticeStats() {
    UI.practiceStats.scrollTop = 0;
    UI.practiceStatsBody.innerHTML = '';
    
    const maxAttempts = Math.max(...AppState.words.map(w => w.p_attempts || 0), 1);
    const maxStreak = Math.max(...AppState.words.map(w => w.p_streak || 0), 1);
    const maxCorrect = Math.max(...AppState.words.map(w => w.p_correct || 0), 1);
    const maxIncorrect = Math.max(...AppState.words.map(w => (w.p_wrong || 0) + (w.p_skip || 0)), 1);

    let filteredWords = [...AppState.words].filter(w => {
        if (!AppState.practiceStatsSearch) return true;
        return w.en.toLowerCase().includes(AppState.practiceStatsSearch) || 
               w.es.toLowerCase().includes(AppState.practiceStatsSearch);
    });

    // Apply Sort
    const { column: col, order } = AppState.practiceSort;
    filteredWords.sort((a, b) => {
        let valA = col === 'p_incorrect' ? (a.p_wrong || 0) + (a.p_skip || 0) : a[col];
        let valB = col === 'p_incorrect' ? (b.p_wrong || 0) + (b.p_skip || 0) : b[col];

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
    });

    filteredWords.forEach((word) => {
        const tr = document.createElement('tr');
        
        const incorrectVal = (word.p_wrong || 0) + (word.p_skip || 0);

        const createBar = (val, max, type, label = val) => `<div class="stat-cell"><span class="stat-value">${label}</span></div>`;
        
        tr.innerHTML = `
            <td>${word.en}</td>
            <td class="clickable-cell" title="Click to listen">${word.es}</td>
            <td>${createBar(word.p_attempts || 0, maxAttempts, 'attempts', word.p_attempts || 0)}</td>
            <td>${createBar(word.p_streak || 0, maxStreak, 'streak', word.p_streak || 0)}</td>
            <td>${createBar(word.p_correct || 0, maxCorrect, 'correct', word.p_correct || 0)}</td>
            <td>${createBar(incorrectVal, maxIncorrect, 'incorrect', incorrectVal)}</td>
        `;
        UI.practiceStatsBody.appendChild(tr);

        const esCell = tr.querySelector('.clickable-cell');
        if (esCell) {
            esCell.addEventListener('click', () => speakSpanish(word.es));
        }
    });
}

function updateSortHeaderStyles() {
    UI.tableHeaders.forEach(th => {
        // Reset all
        th.classList.remove('active-sort', 'asc', 'desc');
        
        // Apply to current
        if (th.dataset.sort === AppState.sort.column) {
            th.classList.add('active-sort');
            th.classList.add(AppState.sort.order); // Adds 'asc' or 'desc' class for arrow CSS
        }
    });
}

function renderStats() {
    UI.stats.scrollTop = 0;
    UI.statsBody.innerHTML = '';
    const totalW = AppState.words.reduce((a, b) => a + b.weight, 0);
    
    const maxAttempts = Math.max(...AppState.words.map(w => w.attempts), 1);
    const maxStreak = Math.max(...AppState.words.map(w => w.streak), 1);
    const maxCorrect = Math.max(...AppState.words.map(w => w.correct || 0), 1);
    const maxIncorrect = Math.max(...AppState.words.map(w => (w.wrong || 0) + (w.skip || 0)), 1);
    const maxWeight = Math.max(...AppState.words.map(w => w.weight), 1);

    const isDebug = AppState.isStatsDebug;

    let filteredWords = [...AppState.words].filter(w => {
        if (!AppState.statsSearch) return true;
        return w.en.toLowerCase().includes(AppState.statsSearch) || 
               w.es.toLowerCase().includes(AppState.statsSearch);
    });

    // Apply Sort
    const { column: col, order } = AppState.sort;
    filteredWords.sort((a, b) => {
        let valA = col === 'incorrect' ? (a.wrong || 0) + (a.skip || 0) : a[col];
        let valB = col === 'incorrect' ? (b.wrong || 0) + (b.skip || 0) : b[col];

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
    });

    filteredWords.forEach((word) => {
        const index = AppState.words.indexOf(word);
        const tr = document.createElement('tr');
        
        let rankIcon = '&nbsp;';
        if (word.streak >= 15) rankIcon = '🥇';
        else if (word.streak >= 10) rankIcon = '🥈';
        else if (word.streak >= 5) rankIcon = '🥉';

        if (word.streak >= 15) tr.classList.add('streak-15');
        else if (word.streak >= 10) tr.classList.add('streak-10');
        else if (word.streak >= 5) tr.classList.add('streak-5');

        const weightPerc = ((word.weight / totalW) * 100).toFixed(1);
        const incorrectVal = (word.wrong || 0) + (word.skip || 0);

        const createBar = (val, max, type, label = val, field = null) => {
            let spanAttrs = 'class="stat-value"';
            if (isDebug && field) {
                spanAttrs = `contenteditable="true" class="editable-stat stat-value" data-idx="${index}" data-field="${field}"`;
            }

            return `
                <div class="stat-cell">
                    <span ${spanAttrs}>${label}</span>
                </div>
            `;
        };
        
        tr.innerHTML = `
            <td>${word.en}</td>
            <td class="clickable-cell" title="Click to listen">${word.es}</td>
            <td>${createBar(word.attempts, maxAttempts, 'attempts', word.attempts, 'attempts')}</td>
            <td>${createBar(word.streak, maxStreak, 'streak', (rankIcon !== '&nbsp;' ? rankIcon + ' ' : '') + word.streak, 'streak')}</td>
            <td>${createBar(word.correct || 0, maxCorrect, 'correct', word.correct || 0, 'correct')}</td>
            <td>${createBar(incorrectVal, maxIncorrect, 'incorrect', incorrectVal)}</td>
            <td>${createBar(word.weight, maxWeight, 'weight', weightPerc + '%')}</td>
        `;
        UI.statsBody.appendChild(tr);

        const esCell = tr.querySelector('.clickable-cell');
        if (esCell) {
            esCell.addEventListener('click', () => speakSpanish(word.es));
        }
    });
}

function renderDebugInfo() {
    if (UI.testingContainer.classList.contains('hidden')) return;
    if (!UI.debugContent) return;
    if (AppState.currentWordIndex === null || !AppState.words[AppState.currentWordIndex]) {
        UI.debugContent.innerHTML = '<p>No word loaded</p>';
        return;
    }
    const word = AppState.words[AppState.currentWordIndex];
    
    let rankIcon = 'None';
    if (word.streak >= 15) rankIcon = '🥇 Gold';
    else if (word.streak >= 10) rankIcon = '🥈 Silver';
    else if (word.streak >= 5) rankIcon = '🥉 Bronze';

    UI.debugContent.innerHTML = `
        <div style="font-size: 0.85rem; line-height: 1.4;">
            <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 4px;">Word Stats</h4>
            <div style="display: grid; grid-template-columns: 70px 1fr; gap: 4px;">
                <strong>English:</strong> <span>${word.en}</span>
                <strong>Spanish:</strong> <span>${word.es}</span>
                <strong>Streak:</strong> <span>${word.streak}</span>
                <strong>Correct:</strong> <span>${word.correct || 0}</span>
                <strong>Note:</strong> <span>${word.note || '-'}</span>
                <strong>Badge:</strong> <span>${rankIcon}</span>
                <strong>Weight:</strong> <span>${word.weight.toFixed(0)}</span>
                <strong>Attempts:</strong> <span>${word.attempts}</span>
                <strong>Wrong:</strong> <span>${word.wrong}</span>
                <strong>Don't Know:</strong> <span>${word.skip}</span>
            </div>
        </div>
    `;
}

function triggerConfetti(type = 'explode', overrideSpeed = null, overrideSize = null, customColors = null) {
    const defaultColors = ['#f8e3cc', '#e2e8f0', '#fff5b1', '#e3f4f6', '#d0f0fd', '#ff9a9e', '#a18cd1', '#2ecc71', '#4a90e2'];
    const colors = customColors || defaultColors;
    
    const speedInput = document.getElementById('confetti-speed');
    let speed = speedInput ? parseFloat(speedInput.value) : 1;
    if (overrideSpeed !== null) speed = overrideSpeed;
    
    const sizeInput = document.getElementById('confetti-size');
    let baseSize = sizeInput ? parseFloat(sizeInput.value) : 1;
    if (overrideSize !== null) baseSize = overrideSize;

    const shapeSelect = document.getElementById('confetti-shape');
    const shape = shapeSelect ? shapeSelect.value : 'square';

    // Determine origin based on type and visibility of answer button
    let startX, startY;
    const rect = UI.controlsRow.getBoundingClientRect();
    const isRowVisible = rect.width > 0 && rect.height > 0;

    if (isRowVisible && (type === 'explode' || type === 'burst' || type === 'implode' || type === 'pulse')) {
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
    } else {
        startX = window.innerWidth / 2;
        startY = window.innerHeight / 2;
    }
    
    for (let i = 0; i < 80; i++) {
        const el = document.createElement('div');
        el.classList.add('confetti');
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Randomize size based on slider
        const size = (Math.random() * 6 + 4) * baseSize; // 4px to 10px base
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;

        if (shape === 'circle') {
            el.style.borderRadius = '50%';
        } else if (shape === 'triangle') {
            el.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        }
        
        let animationName = '';
        
        if (type === 'explode') {
            el.style.left = `${startX}px`;
            el.style.top = `${startY}px`;
            const spreadX = (Math.random() - 0.5) * 400; 
            const upY = -(Math.random() * 150 + 100); 
            const downY = window.innerHeight - startY + 20;
            el.style.setProperty('--tx', `${spreadX}px`);
            el.style.setProperty('--up-y', `${upY}px`);
            el.style.setProperty('--down-y', `${downY}px`);
            animationName = 'confettiExplode';
        } else if (type === 'rain') {
            el.style.left = `${Math.random() * 100}vw`;
            el.style.top = `-10px`;
            el.style.setProperty('--tx', `${(Math.random() - 0.5) * 50}px`);
            animationName = 'confettiRain';
        } else if (type === 'burst') {
            el.style.left = `${startX}px`;
            el.style.top = `${startY}px`;
            const angle = Math.random() * 2 * Math.PI;
            const velocity = Math.random() * 400 + 100;
            el.style.setProperty('--tx', `${Math.cos(angle) * velocity}px`);
            el.style.setProperty('--ty', `${Math.sin(angle) * velocity}px`);
            animationName = 'confettiBurst';
        } else if (type === 'rise') {
            el.style.left = `${Math.random() * 100}vw`;
            el.style.top = `105vh`;
            el.style.setProperty('--tx', `${(Math.random() - 0.5) * 100}px`);
            animationName = 'confettiRise';
        } else if (type === 'spiral') {
            el.style.left = `${Math.random() * 100}vw`;
            el.style.top = `-10px`;
            el.style.setProperty('--tx', `${(Math.random() - 0.5) * 200}px`);
            animationName = 'confettiSpiral';
        } else if (type === 'fountain') {
            el.style.left = `${window.innerWidth / 2}px`;
            el.style.top = `${window.innerHeight}px`;
            const spreadX = (Math.random() - 0.5) * 600;
            const upY = -(Math.random() * 400 + 300);
            el.style.setProperty('--tx', `${spreadX}px`);
            el.style.setProperty('--up-y', `${upY}px`);
            animationName = 'confettiFountain';
        } else if (type === 'cross') {
            const fromLeft = Math.random() > 0.5;
            el.style.left = fromLeft ? '-20px' : '100vw';
            el.style.top = `${Math.random() * 100}vh`;
            const destX = fromLeft ? '100vw' : '-100vw';
            const destY = (Math.random() - 0.5) * 200 + 'px';
            el.style.setProperty('--tx', destX);
            el.style.setProperty('--ty', destY);
            animationName = 'confettiCross';
        } else if (type === 'snow') {
            el.style.left = `${Math.random() * 100}vw`;
            el.style.top = `-10px`;
            animationName = 'confettiSnow';
        } else if (type === 'implode') {
            el.style.left = `${startX}px`;
            el.style.top = `${startY}px`;
            const angle = Math.random() * 2 * Math.PI;
            const dist = Math.random() * 300 + 200;
            el.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
            el.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
            animationName = 'confettiImplode';
        } else if (type === 'pulse') {
            el.style.left = `${startX}px`;
            el.style.top = `${startY}px`;
            const angle = Math.random() * 2 * Math.PI;
            const dist = Math.random() * 100 + 50;
            el.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
            el.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
            animationName = 'confettiPulse';
        }

        el.style.animationName = animationName;
        el.style.animationTimingFunction = 'ease-out';
        if (type === 'rain' || type === 'spiral' || type === 'rise' || type === 'snow' || type === 'cross') el.style.animationTimingFunction = 'linear';

        el.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
        
        const duration = (Math.random() * 1 + 1.5) / speed;
        el.style.animationDuration = `${duration}s`;
        
        document.body.appendChild(el);
        setTimeout(() => el.remove(), duration * 1000);
    }
}

function updateVoiceUI() {
    const isRandom = AppState.settings.randomVoice;
    const gender = AppState.settings.voiceGender;
    document.querySelectorAll('.voice-btn').forEach(btn => {
        if (isRandom) {
            btn.classList.add('disabled');
            btn.classList.remove('selected');
        } else {
            btn.classList.remove('disabled');
            if (btn.dataset.gender === gender) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        }
    });
}

function initBackgroundParticles() {
    const container = document.getElementById('bg-particles');
    if (!container) return;

    const spawn = () => {
        if (document.hidden) {
            setTimeout(spawn, 1000);
            return;
        }
        if (AppState.settings.disableBackground) {
            return;
        }

        const el = document.createElement('div');
        el.classList.add('confetti');
        
        let colors = ['#f8e3cc', '#e2e8f0', '#fff5b1', '#e3f4f6', '#d0f0fd', '#ff9a9e', '#a18cd1', '#2ecc71', '#4a90e2'];
        let animName = 'confettiImplode';

        if (AppState.settings.bgTheme === 'bg-dark-squares') {
            colors = ['#ff00ff', '#00ffff', '#39ff14', '#ffff00', '#ff1493', '#00ff99'];
            animName = 'squareFloat';
        }

        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Settings
        // Speed: 0.1x to 0.5x random if not overridden
        const speed = Math.random() * 0.4 + 0.1;
        // Size: 1x to 5x random if not overridden
        const sizeMult = Math.random() * 4 + 1;


        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;
        el.style.left = `${startX}px`;
        el.style.top = `${startY}px`;

        const angle = Math.random() * 2 * Math.PI;
        const dist = Math.max(window.innerWidth, window.innerHeight) * 0.7 + (Math.random() * 200);
        
        el.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
        el.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
        el.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);

        el.style.animationName = animName;
        const duration = (Math.random() * 5 + 10) / speed;
        el.style.animationDuration = `${duration}s`; 
        el.style.animationTimingFunction = 'linear';
        
        const size = (Math.random() * 6 + 4) * sizeMult;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;

        container.appendChild(el);
        setTimeout(() => el.remove(), duration * 1000); 

        const density = 2;
        setTimeout(spawn, 2000 / density);
    };
    spawn();
}

function playSuccessSound() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
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

function swipeGrid(grid, direction, onSwap) {
    if (!grid || grid.dataset.animating === '1') return;
    const duration = getScaledDuration(260);
    const outClass = direction === 'left' ? 'grid-swipe-out-left' : 'grid-swipe-out-right';
    const inClass = direction === 'left' ? 'grid-swipe-in-from-right' : 'grid-swipe-in-from-left';

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