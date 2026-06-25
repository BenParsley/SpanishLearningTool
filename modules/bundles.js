/* =============================================================================
   modules/bundles.js
   Bundle catalogue helpers, custom multi-bundle selection, word data parsing,
   identity matching, merging saved stats into fresh words, runtime bundle
   assembly, and cross-bundle stats sync.
   ============================================================================= */

/* --- LAZY DATA LOADING --- */

/**
 * In-flight load promises keyed by bundle id.  Prevents double-injecting the
 * same script when a bundle is requested more than once before it resolves.
 */
const _bundleLoadPromises = new Map();

/**
 * Ensures the raw word data for `bundle` is available.
 * - If `bundle.data` is already non-null (already loaded or a virtual bundle
 *   like Multi-Bundle that has `data: ''`), resolves immediately.
 * - Otherwise injects a <script> tag for `bundle.src`, waits for it to
 *   execute (which calls `_registerBundleData` and sets `bundle.data`), then
 *   resolves.
 * Returns a Promise that resolves when data is ready, or rejects on load error.
 */
function ensureBundleDataLoaded(bundle) {
    if (!bundle) return Promise.resolve();
    if (bundle.data !== null) return Promise.resolve();
    if (!bundle.src) return Promise.resolve();

    if (_bundleLoadPromises.has(bundle.id)) {
        return _bundleLoadPromises.get(bundle.id);
    }

    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = bundle.src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load bundle script: ${bundle.src}`));
        document.head.appendChild(script);
    });

    _bundleLoadPromises.set(bundle.id, promise);
    return promise;
}

/* --- BUNDLE CONFIG --- */

function getVocabPageSize() {
    return 9;
}

function getMaxVocabPage() {
    const totalBundles = getAvailableBundles().length;
    return Math.max(0, Math.ceil(totalBundles / getVocabPageSize()) - 1);
}

function getAvailableBundles() {
    if (typeof availableBundles === 'undefined') {
        console.error('availableBundles is not defined. Ensure app.js loads before curriculum-data files.');
        return [];
    }
    const infinitiveVerbIds = new Set([
        ...(typeof INFINITIVE_VERB_BUNDLE_IDS !== 'undefined' ? INFINITIVE_VERB_BUNDLE_IDS : []),
        typeof CUSTOM_INFINITIVE_VERB_BUNDLE_ID !== 'undefined' ? CUSTOM_INFINITIVE_VERB_BUNDLE_ID : ''
    ]);
    return availableBundles.filter(bundle => !infinitiveVerbIds.has((bundle && bundle.id) || ''));
}

function getCustomInfinitiveVerbBundleId() {
    return typeof CUSTOM_INFINITIVE_VERB_BUNDLE_ID !== 'undefined' ? CUSTOM_INFINITIVE_VERB_BUNDLE_ID : 'bundle_custom_infinitive_verbs';
}

function getInfinitiveVerbBundleIds() {
    return typeof INFINITIVE_VERB_BUNDLE_IDS !== 'undefined' ? INFINITIVE_VERB_BUNDLE_IDS : [];
}

/** Returns infinitive verb bundles: custom infinitive verb multi-bundle first, then the 8 individual infinitive verb bundles. */
function getInfinitiveVerbBundles() {
    if (typeof availableBundles === 'undefined') return [];
    const infinitiveVerbIds = new Set(getInfinitiveVerbBundleIds());
    const customInfinitiveVerbId = getCustomInfinitiveVerbBundleId();
    const individual = availableBundles.filter(b => b && infinitiveVerbIds.has(b.id));
    const customInfinitiveVerb  = availableBundles.find(b => b && b.id === customInfinitiveVerbId);
    return customInfinitiveVerb ? [customInfinitiveVerb, ...individual] : individual;
}

function getSelectableInfinitiveVerbBundleIds() {
    return getInfinitiveVerbBundleIds();
}

/** Returns the currently-selected infinitive verb bundle IDs for the custom infinitive verb multi-bundle. */
function getInfinitiveVerbSelectedBundleIds() {
    if (!Array.isArray(AppState.infinitiveVerbSelectedBundleIds)) return [];
    const selectableIds = new Set(getSelectableInfinitiveVerbBundleIds());
    return AppState.infinitiveVerbSelectedBundleIds.filter(id => selectableIds.has(id));
}

function isInfinitiveVerbBundleSelected(bundleId) {
    return getInfinitiveVerbSelectedBundleIds().includes(bundleId);
}

function toggleInfinitiveVerbBundleSelection(bundleId) {
    const selectableIds = new Set(getSelectableInfinitiveVerbBundleIds());
    if (!selectableIds.has(bundleId)) return;
    if (isInfinitiveVerbBundleSelected(bundleId)) {
        AppState.infinitiveVerbSelectedBundleIds = getInfinitiveVerbSelectedBundleIds().filter(id => id !== bundleId);
    } else {
        AppState.infinitiveVerbSelectedBundleIds = [...getInfinitiveVerbSelectedBundleIds(), bundleId];
    }
}

function buildInfinitiveVerbBundleData(selectedIds = getInfinitiveVerbSelectedBundleIds()) {
    const selectedSet = new Set(selectedIds);
    const infinitiveVerbIds = new Set(getInfinitiveVerbBundleIds());
    const chunks = (typeof availableBundles !== 'undefined' ? availableBundles : [])
        .filter(bundle => bundle && infinitiveVerbIds.has(bundle.id) && selectedSet.has(bundle.id))
        .map(bundle => (bundle.data || '').trim())
        .filter(chunk => chunk.length > 0);
    return chunks.join('\n');
}

function getCustomVocabBundleId() {
    return typeof CUSTOM_VOCAB_BUNDLE_ID !== 'undefined' ? CUSTOM_VOCAB_BUNDLE_ID : 'bundle_custom_vocab';
}

function getSelectableCustomBundleIds() {
    return getAvailableBundles()
        .filter(bundle => bundle && bundle.id !== getCustomVocabBundleId())
        .map(bundle => bundle.id);
}

function getBaseVocabBundleIds() {
    return typeof BASE_VOCAB_BUNDLE_IDS !== 'undefined'
        ? BASE_VOCAB_BUNDLE_IDS
        : ['bundle_1', 'bundle_2', 'bundle_3', 'bundle_4', 'bundle_5'];
}

function getCategoryBundleId(category) {
    if (typeof CATEGORY_TO_BUNDLE_ID !== 'undefined' && category && CATEGORY_TO_BUNDLE_ID[category]) {
        return CATEGORY_TO_BUNDLE_ID[category];
    }
    return null;
}

/* --- MULTI-BUNDLE SELECTION --- */

/** Returns the currently-selected bundle IDs for the custom multi-bundle. */
function getCustomSelectedBundleIds() {
    if (!Array.isArray(AppState.customSelectedBundleIds)) return [];
    const selectableIds = new Set(getSelectableCustomBundleIds());
    return AppState.customSelectedBundleIds.filter(id => selectableIds.has(id));
}

/** Returns true if the given bundle is included in the custom selection. */
function isBundleSelectedForCustom(bundleId) {
    return getCustomSelectedBundleIds().includes(bundleId);
}

/**
 * Toggles a bundle's membership in the custom multi-bundle selection.
 * Silently ignores IDs that are not selectable (e.g. the custom bundle itself).
 */
function toggleCustomBundleSelection(bundleId) {
    const selectableIds = new Set(getSelectableCustomBundleIds());
    if (!selectableIds.has(bundleId)) return;

    if (isBundleSelectedForCustom(bundleId)) {
        AppState.customSelectedBundleIds = getCustomSelectedBundleIds().filter(id => id !== bundleId);
    } else {
        AppState.customSelectedBundleIds = [...getCustomSelectedBundleIds(), bundleId];
    }
}

/**
 * Builds and returns the combined CSV data string for the custom bundle,
 * by joining the raw data from every selected individual bundle.
 */
function buildCustomBundleData(selectedBundleIds = getCustomSelectedBundleIds()) {
    const selectedSet = new Set(selectedBundleIds);
    const chunks = getAvailableBundles()
        .filter(bundle => selectedSet.has(bundle.id))
        .map(bundle => (bundle.data || '').trim())
        .filter(chunk => chunk.length > 0);
    return chunks.join('\n');
}

/* --- WORD IDENTITY --- */

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

/* --- MERGING --- */

/**
 * Merges persisted word stats back into freshly-parsed bundle words.
 * Fresh words are used as the authoritative source of vocabulary content
 * (en, es, note, etc.); saved words supply the stats fields.
 */
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

/* --- PERSISTENCE HELPERS --- */

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
    targetWord.streak   = sourceWord.streak   || 0;
    targetWord.wrong    = sourceWord.wrong    || 0;
    targetWord.correct  = sourceWord.correct  || 0;
    targetWord.skip     = sourceWord.skip     || 0;
    targetWord.weight   = sourceWord.weight   || 100;
}

/* --- RUNTIME BUNDLE ASSEMBLY --- */

function getRuntimeBundleData(bundle) {
    if (!bundle) return '';
    if (bundle.id === getCustomVocabBundleId()) {
        return buildCustomBundleData();
    }
    if (bundle.id === getCustomInfinitiveVerbBundleId()) {
        return buildInfinitiveVerbBundleData();
    }
    return bundle.data || '';
}

function getRuntimeBundle(bundle) {
    if (!bundle) return bundle;
    return { ...bundle, data: getRuntimeBundleData(bundle) };
}

/* --- CROSS-BUNDLE STATS SYNC --- */

/**
 * When a word's competitive stats change in the current bundle, mirror those
 * stats to the same word in any related "mirror" bundle.
 * e.g. If playing the Custom multi-bundle, stats also flow to the individual
 * bundle that owns that word, and vice versa.
 */
function syncCompetitiveStatsToMirrorBundles(sourceWord) {
    if (!sourceWord || !AppState.currentBundleId) return;

    const customBundleId = getCustomVocabBundleId();
    const targetBundleIds = [];

    if (AppState.currentBundleId === customBundleId) {
        const categoryBundleId = getCategoryBundleId(sourceWord.category);
        if (categoryBundleId) targetBundleIds.push(categoryBundleId);
    } else if (getSelectableCustomBundleIds().includes(AppState.currentBundleId)) {
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
        const savedTargetWords = Array.isArray(fullData.bundles[targetBundleId])
            ? fullData.bundles[targetBundleId]
            : [];
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
        _setLocalStorageSafe('wordBundleStats', JSON.stringify(fullData));
    }
}

/* --- BUNDLE DATA PARSING --- */

/**
 * Parses a bundle's raw CSV text into an array of word objects.
 * Each line: category,english|alt1|alt2,spanish|alt1|alt2[,note]
 */
function parseBundleData(textData) {
    const lines = textData.trim().split('\n');
    return lines
        .filter(line => line.trim() !== '')
        .map(line => {
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
        })
        .filter(item => item !== null);
}
