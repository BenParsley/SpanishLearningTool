/* =============================================================================
   modules/state.js
   Central application state object.
   All mutable runtime state lives here. Cross-module shared globals are also
   declared here so they exist in one place.
   ============================================================================= */

/* --- CENTRAL STATE OBJECT --- */
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
    isActiveStatsVisible: false,
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
        audioShortcut: 'Alt+P',
        voiceVolume: 1,
        strictAccents: true,
        requireInvertedPunctuation: false,
        requireApostrophe: false,
        activeBackground: 'bg-rainbow',
        autoCycleBackground: true,
        newWordDelay: 1000,
        practiceAnimSpeed: 1,
        modeGridSize: 650,
        wordlistCols: 6,
        animSpeed: 1,
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
    customSelectedBundleIds: [],
    infinitiveVerbPage: 0,
    isInfinitiveVerbSelectionMode: false,
    infinitiveVerbSelectedBundleIds: [],
    activeLanding: 'vocab'
};

