// Shared curriculum-data helpers (migrated from curriculum-data/helpers.js)
function formatBundle(category, rows) {
    return rows.map(row => `${category},${row.join(',')}`).join('\n');
}

const CUSTOM_VOCAB_BUNDLE_ID = 'bundle_custom_vocab';
const BASE_VOCAB_BUNDLE_IDS = ['bundle_1', 'bundle_2', 'bundle_3', 'bundle_4', 'bundle_5'];
const CATEGORY_TO_BUNDLE_ID = {
    'Body Part': 'bundle_1',
    'Animals': 'bundle_2',
    'Emotions': 'bundle_3',
    'Filler Words': 'bundle_4',
    'Panamanian-Specific Terms': 'bundle_5',
    'Infinitive Verbs 1-30':   'bundle_6',
    'Infinitive Verbs 31-60':  'bundle_7',
    'Infinitive Verbs 61-90':  'bundle_8',
    'Infinitive Verbs 91-120': 'bundle_9',
    'Infinitive Verbs 121-150': 'bundle_10',
    'Infinitive Verbs 151-180': 'bundle_11',
    'Infinitive Verbs 181-210': 'bundle_12',
    'Infinitive Verbs 211-240': 'bundle_13'
};

const CUSTOM_INFINITIVE_VERB_BUNDLE_ID = 'bundle_custom_infinitive_verbs';
const INFINITIVE_VERB_BUNDLE_IDS = ['bundle_6', 'bundle_7', 'bundle_8', 'bundle_9', 'bundle_10', 'bundle_11', 'bundle_12', 'bundle_13'];

const availableBundles = [
    { id: CUSTOM_VOCAB_BUNDLE_ID,           name: 'Multi-Bundle', data: '' },
    { id: CUSTOM_INFINITIVE_VERB_BUNDLE_ID, name: 'Multi-Bundle', data: '' },
    // Vocabulary bundles — data is null until the script is lazy-loaded on demand
    { id: 'bundle_1',  name: 'Body Parts',              src: 'curriculum-data/body-parts.js',                          data: null },
    { id: 'bundle_2',  name: 'Animals',                 src: 'curriculum-data/animals.js',                             data: null },
    { id: 'bundle_3',  name: 'Emotions',                src: 'curriculum-data/emotions.js',                            data: null },
    { id: 'bundle_4',  name: 'Filler Words',            src: 'curriculum-data/filler-words.js',                        data: null },
    { id: 'bundle_5',  name: 'Panamanian Phrases',      src: 'curriculum-data/panamanian-phrases.js',                  data: null },
    // Infinitive verb bundles
    { id: 'bundle_6',  name: 'Infinitive Verbs 1-30',   src: 'curriculum-data/infinitive-verbs/infinitive-verbs-1.js', data: null },
    { id: 'bundle_7',  name: 'Infinitive Verbs 31-60',  src: 'curriculum-data/infinitive-verbs/infinitive-verbs-2.js', data: null },
    { id: 'bundle_8',  name: 'Infinitive Verbs 61-90',  src: 'curriculum-data/infinitive-verbs/infinitive-verbs-3.js', data: null },
    { id: 'bundle_9',  name: 'Infinitive Verbs 91-120', src: 'curriculum-data/infinitive-verbs/infinitive-verbs-4.js', data: null },
    { id: 'bundle_10', name: 'Infinitive Verbs 121-150', src: 'curriculum-data/infinitive-verbs/infinitive-verbs-5.js', data: null },
    { id: 'bundle_11', name: 'Infinitive Verbs 151-180', src: 'curriculum-data/infinitive-verbs/infinitive-verbs-6.js', data: null },
    { id: 'bundle_12', name: 'Infinitive Verbs 181-210', src: 'curriculum-data/infinitive-verbs/infinitive-verbs-7.js', data: null },
    { id: 'bundle_13', name: 'Infinitive Verbs 211-240', src: 'curriculum-data/infinitive-verbs/infinitive-verbs-8.js', data: null }
];

/**
 * Called by each curriculum data file when it has been loaded (either eagerly
 * or via lazy dynamic-script injection).  Finds the pre-registered bundle stub
 * by id and populates its data field.  If no stub exists yet (e.g. a brand-new
 * bundle file that hasn't been added to the manifest), the bundle is pushed
 * onto the array so the rest of the app can discover it.
 */
function _registerBundleData(id, rawData) {
    const bundle = availableBundles.find(b => b && b.id === id);
    if (bundle) {
        bundle.data = rawData;
    } else {
        availableBundles.push({ id, data: rawData });
    }
}

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
    infinitiveVerbLanding: document.getElementById('view-infinitive-verb-landing'),
    infinitiveVerbPagePrev: document.getElementById('infinitive-verb-page-prev'),
    infinitiveVerbPageNext: document.getElementById('infinitive-verb-page-next'),
    infinitiveVerbBundleGrid: document.getElementById('infinitive-verb-bundle-grid'),
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

let transitionTimer = null;
let sessionActionCount = 0;
