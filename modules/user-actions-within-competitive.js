/* =============================================================================
   modules/user-actions-within-competitive.js
   All logic for the competitive quiz mode — word selection, answer evaluation,
   hint reveal, skip, undo, session milestones, and history management.

   Consolidated from:
     - word-engine.js  (weighted word selection, loadNextWord, weight helpers)
     - answer.js       (normalisation, submitAnswer, correct/incorrect handlers)
     - hint.js         (letter-by-letter hint reveal)
     - skip.js         (skip current word)
     - undo.js         (real-time undo, settings panel undo/redo)
   ============================================================================= */

/* ─────────────────────────────────────────────────────────────────────────────
   FEEDBACK MESSAGE
   Returns the text shown in the feedback area after each answer.
   ───────────────────────────────────────────────────────────────────────────── */

const getFeedbackMessage = {
    correct: (es, en, streak)                  => `That's it!  Streak: ${streak}`,
    badge:   (es, en, streak, diff, badgeName) => `That's it!  ${diff} more for ${badgeName}`,
    gold:    (es, en, streak)                  => `That's it!  Gold — fully mastered`,
    wrong:   (es, en)                          => `Answer:  ${es}  —  ${en}`,
};


/* ─────────────────────────────────────────────────────────────────────────────
   WORD ENGINE
   Weighted word selection, loading the next question, resetting the control
   row, and weight calculation / update helpers.
   ───────────────────────────────────────────────────────────────────────────── */

/**
 * Picks a uniformly-random alternative from an array of options, or returns
 * the fallback value when the array is empty / not present.
 */
function pickRandomAlternative(alts, fallback) {
    if (!Array.isArray(alts) || alts.length === 0) return fallback;
    return alts[Math.floor(Math.random() * alts.length)];
}

/**
 * Returns the index (into AppState.words) of the next word to quiz, using a
 * weighted-random draw that filters out Gold words (streak >= 15).
 * Returns -1 when every word has been mastered.
 */
function getWeightedWord() {
    const candidates = AppState.words
        .map((word, index) => ({ ...word, originalIndex: index }))
        .filter(w => w.streak < 15);

    if (candidates.length === 0) return -1;

    const totalWeight = candidates.reduce((sum, word) => sum + word.weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < candidates.length; i++) {
        random -= candidates[i].weight;
        if (random <= 0) return candidates[i].originalIndex;
    }
    return candidates[0].originalIndex;
}

/** Clears input/feedback and resets the control row to its default state. */
function resetControls() {
    UI.input.value    = '';
    UI.input.disabled = false;
    UI.feedback.innerText      = '';
    UI.feedback.style.color    = '';
    UI.competitive.classList.remove('correct-state', 'wrong-state');
    UI.streakProgressWrapper.classList.add('hidden');
    UI.questionNote.classList.add('hidden');

    UI.btnSkip.style.display = '';
    UI.btnHint.style.display = '';
    UI.statusMessage.classList.add('hidden');
    UI.btnSkip.classList.remove('hidden');
    UI.btnHint.classList.remove('hidden');

    UI.btnHint.innerText  = 'Hint';
    UI.btnHint.disabled   = false;
    UI.btnUndo.classList.add('hidden');

    UI.progressContainer.classList.add('hidden');
    UI.progressBar.style.width      = '0%';
    UI.progressBar.style.transition = 'none';

    UI.hintDisplay.innerText = '';
    UI.hintDisplay.classList.add('hidden');

    hintStage = 0;

    UI.input.focus();
}

/** Populates the UI with the next word question. */
function loadNextWord() {
    resetControls();
    AppState.isLocked = false;

    if (AppState.isTestWord) {
        AppState.testWordCounter = AppState.testWordCounter === 1 ? 2 : 1;
        const text = `TESTING ${AppState.testWordCounter}`;
        UI.questionLabel.innerText = 'DEBUG MODE';
        UI.questionWord.innerText  = text;
        UI.input.placeholder       = `Type ${text}...`;
        UI.questionAudioBtn.classList.add('disabled-audio');
        return;
    }

    if (!AppState.words || AppState.words.length === 0) {
        UI.questionWord.innerText  = 'No words loaded.';
        UI.questionLabel.innerText = 'Select a Bundle';
        UI.input.placeholder  = '';
        UI.input.disabled     = true;
        return;
    }

    const index = getWeightedWord();
    if (index === -1) {
        UI.questionWord.innerText  = 'Bundle Completed!';
        UI.questionLabel.innerText = 'All words mastered (Gold Rank)';
        UI.input.placeholder = '';
        UI.input.disabled    = true;
        UI.questionAudioBtn.classList.add('disabled-audio');
        UI.btnSkip.classList.add('hidden');
        UI.btnHint.classList.add('hidden');
        return;
    }

    AppState.currentWordIndex     = index;
    const wordObj                 = AppState.words[index];
    AppState.currentSpanishPrompt = pickRandomAlternative(wordObj.es_alts, wordObj.es);
    AppState.currentDirection     = Math.random() > 0.5 ? 'en-to-es' : 'es-to-en';

    if (AppState.currentDirection === 'en-to-es') {
        UI.questionLabel.innerText = 'Translate to Spanish:';
        UI.questionWord.innerText  = wordObj.en;
        UI.input.placeholder       = 'Type Spanish word...';
        UI.questionAudioBtn.classList.add('disabled-audio');
    } else {
        UI.questionLabel.innerText = 'Translate to English:';
        UI.questionWord.innerText  = AppState.currentSpanishPrompt;
        UI.input.placeholder       = 'Type English word...';
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

/* --- WEIGHT CALCULATION --- */

function calculateWeight(word) {
    let weight = 100;
    weight += (word.wrong  * 15);
    weight += (word.skip   * 10);
    weight -= (word.streak * 10);
    weight -= (word.attempts *  1);
    return Math.max(1, Math.min(1000, weight));
}

function updateWordWeight(word) {
    word.weight = calculateWeight(word);
}

/* --- DEBUG HELPERS --- */

function randomizeBundleData() {
    if (!confirm('Randomize all bundle stats in browser storage? This cannot be undone.')) return;

    const fullData = loadStoredBundleData();
    const randInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    for (const bundleId of Object.keys(fullData.bundles)) {
        const words = fullData.bundles[bundleId];
        if (!Array.isArray(words)) continue;
        for (const w of words) {
            const correct  = randInt(0, 100);
            const wrong    = randInt(0, 100);
            const attempts = correct + wrong;
            const streak   = randInt(0, correct);
            const skip     = randInt(0, 100);
            w.attempts = attempts;
            w.correct  = correct;
            w.wrong    = wrong;
            w.streak   = streak;
            w.skip     = skip;
        }
    }

    _setLocalStorageSafe('wordBundleStats', JSON.stringify(fullData));

    if (AppState.currentBundleId && fullData.bundles[AppState.currentBundleId]) {
        AppState.words = fullData.bundles[AppState.currentBundleId];
    }

    if (!UI.stats.classList.contains('hidden')) renderStats();
    loadGridContent();
    alert('Bundle stats randomized.');
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANSWER
   Answer normalisation, submission, correct / incorrect handlers.
   The auto-advance transition animation (triggerTransition) is in
   modules/animations.js.
   ───────────────────────────────────────────────────────────────────────────── */

/* --- NORMALISATION --- */

function normalizeForComparison(
    text,
    ignoreAccents,
    ignoreInvertedPunctuation,
    normalizeBoundaryPairs = false,
    ignoreApostrophe = false
) {
    let normalized = text.trim();

    if (normalizeBoundaryPairs) {
        if (normalized.endsWith('?') && !normalized.startsWith('¿')) normalized = `¿${normalized}`;
        if (normalized.endsWith('!') && !normalized.startsWith('¡')) normalized = `¡${normalized}`;
    }
    if (ignoreInvertedPunctuation) normalized = normalized.replace(/[¿¡]/g, '');
    if (ignoreApostrophe)          normalized = normalized.replace(/['''`]/g, '');
    if (ignoreAccents)             normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return normalized.toLowerCase();
}

function hasRequiredBoundaryPunctuation(userText, targetText) {
    const userTrimmed   = userText.trim();
    const targetTrimmed = targetText.trim();

    const expectsQuestion     = targetTrimmed.startsWith('¿') || targetTrimmed.endsWith('?');
    const expectsExclamation  = targetTrimmed.startsWith('¡') || targetTrimmed.endsWith('!');

    if (expectsQuestion)    return userTrimmed.startsWith('¿') && userTrimmed.endsWith('?');
    if (expectsExclamation) return userTrimmed.startsWith('¡') && userTrimmed.endsWith('!');
    return true;
}

/* --- SUBMISSION --- */

function submitAnswer() {
    if (AppState.isLocked) return;
    const userVal = UI.input.value.trim();
    if (!userVal) return;

    // Debug / test word path
    if (AppState.isTestWord) {
        if (userVal.toUpperCase() === `TESTING ${AppState.testWordCounter}`) {
            UI.feedback.innerText   = 'Correct!';
            UI.feedback.style.color = 'var(--success)';
            UI.competitive.classList.add('correct-state');
            triggerTransition('correct');
        } else {
            UI.feedback.innerText = 'Wrong!';
            UI.competitive.classList.add('wrong-state');
            UI.btnUndo.classList.remove('hidden');
            triggerTransition('wrong');
        }
        return;
    }

    const wordObj = AppState.words[AppState.currentWordIndex];
    const targets = AppState.currentDirection === 'en-to-es' ? wordObj.es_alts : wordObj.in_alts || [wordObj.en];

    // Re-derive the correct primary target for the current direction/prompt
    const primaryTarget = AppState.currentDirection === 'en-to-es'
        ? (AppState.currentSpanishPrompt || wordObj.es)
        : wordObj.en;

    const userWithoutBrackets = stripBracketSections(userVal);

    const ignoreInvertedPunctuation = !AppState.settings.requireInvertedPunctuation;
    const normalizeBoundaryPairs    =  AppState.settings.requireInvertedPunctuation;
    const ignoreApostrophe          = !AppState.settings.requireApostrophe;

    const strictUser          = normalizeForComparison(userVal,              false, ignoreInvertedPunctuation, normalizeBoundaryPairs, ignoreApostrophe);
    const strictUserNoBrackets= normalizeForComparison(userWithoutBrackets,  false, ignoreInvertedPunctuation, normalizeBoundaryPairs, ignoreApostrophe);
    const normUser            = normalizeForComparison(userVal,              true,  ignoreInvertedPunctuation, normalizeBoundaryPairs, ignoreApostrophe);
    const normUserNoBrackets  = normalizeForComparison(userWithoutBrackets,  true,  ignoreInvertedPunctuation, normalizeBoundaryPairs, ignoreApostrophe);

    let strictMatch  = false;
    let looseMatch   = false;
    let matchedTarget = null;

    for (const t of targets) {
        if (!ignoreInvertedPunctuation && !hasRequiredBoundaryPunctuation(userVal, t)) continue;

        const optionalTarget = stripBracketSections(t);
        const candidates = (optionalTarget && optionalTarget !== t) ? [t, optionalTarget] : [t];

        for (const candidate of candidates) {
            const strictTarget = normalizeForComparison(candidate, false, ignoreInvertedPunctuation, normalizeBoundaryPairs, ignoreApostrophe);
            const normTarget   = normalizeForComparison(candidate, true,  ignoreInvertedPunctuation, normalizeBoundaryPairs, ignoreApostrophe);

            if (strictUser === strictTarget || strictUserNoBrackets === strictTarget) strictMatch = true;
            if (normUser   === normTarget   || normUserNoBrackets   === normTarget)   { looseMatch = true; matchedTarget = candidate; }
        }
    }

    if (strictMatch || (!AppState.settings.strictAccents && looseMatch)) {
        handleCorrect(wordObj, primaryTarget);
    } else if (AppState.settings.strictAccents && looseMatch && !strictMatch) {
        // Identify the first differing accented character
        let missingChar = '';
        if (matchedTarget) {
            for (let i = 0; i < matchedTarget.length; i++) {
                if (i >= userVal.length) break;
                if (matchedTarget[i] !== userVal[i] && /[áéíóúüñÁÉÍÓÚÜÑ]/.test(matchedTarget[i])) {
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

/* --- CORRECT / INCORRECT HANDLERS --- */

function handleCorrect(word, target) {
    word.attempts++;
    word.streak++;
    word.correct = (word.correct || 0) + 1;

    // Badge milestone confetti
    if ([5, 10, 15].includes(word.streak)) {
        let badgeColors = null;
        if      (word.streak ===  5) badgeColors = ['#f8e3cc', '#ed8936', '#c05621']; // Bronze
        else if (word.streak === 10) badgeColors = ['#e2e8f0', '#a0aec0', '#718096']; // Silver
        else if (word.streak === 15) badgeColors = ['#fff5b1', '#ecc94b', '#b7791f']; // Gold

        triggerConfetti('implode', 5, 2, badgeColors);
        setTimeout(() => triggerConfetti('burst', 2, 2, badgeColors), 1000);
    }

    const es          = AppState.currentSpanishPrompt || word.es;
    const en          = word.en;
    const streak      = word.streak;
    const milestones  = [5, 10, 15];
    const nextMilestone = milestones.find(m => m > streak);

    if (nextMilestone) {
        const diff      = nextMilestone - streak;
        const badgeName = { 5: 'Bronze', 10: 'Silver', 15: 'Gold' }[nextMilestone];
        UI.feedback.innerText   = getFeedbackMessage.badge(es, en, streak, diff, badgeName);
        UI.feedback.style.color = 'var(--success)';

        const milestoneIdx  = milestones.indexOf(nextMilestone);
        const prevMilestone = milestoneIdx > 0 ? milestones[milestoneIdx - 1] : 0;
        const progressPerc  = Math.min(100, Math.max(0, ((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100));

        UI.streakProgressFill.style.width = `${progressPerc}%`;
        UI.streakProgressWrapper.classList.remove('hidden');
    } else if (streak >= 15) {
        UI.feedback.innerText   = getFeedbackMessage.gold(es, en, streak);
        UI.feedback.style.color = 'var(--success)';
        UI.streakProgressFill.style.width = '100%';
        UI.streakProgressWrapper.classList.remove('hidden');
    } else {
        UI.feedback.innerText   = getFeedbackMessage.correct(es, en, streak);
        UI.feedback.style.color = 'var(--success)';
    }

    updateWordWeight(word);
    syncCompetitiveStatsToMirrorBundles(word);
    addToHistory(AppState.words.indexOf(word), 'correct', streak - 1);
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
    word.streak    = 0;
    addToHistory(AppState.words.indexOf(word), 'wrong', previousStreak);
    updateWordWeight(word);
    syncCompetitiveStatsToMirrorBundles(word);
    UI.competitive.classList.add('wrong-state');
    UI.questionWord.innerText = `${target}`;
    const es    = AppState.currentSpanishPrompt || word.es;
    UI.feedback.innerText   = getFeedbackMessage.wrong(es, word.en);
    UI.feedback.style.color = 'var(--danger)';
    sessionActionCount++;
    checkSessionMilestones();
    UI.btnUndo.classList.remove('hidden');
    AppState.lastAction = 'wrong';
    speakSpanish(AppState.currentSpanishPrompt || word.es);
    triggerTransition('wrong');
}

/* ─────────────────────────────────────────────────────────────────────────────
   HINT
   Reveals the correct answer letter-by-letter for the current question.
   ───────────────────────────────────────────────────────────────────────────── */

function showHint() {
    if (AppState.isLocked) return;
    if (AppState.isTestWord) return;

    const wordObj = AppState.words[AppState.currentWordIndex];
    const target  = AppState.currentDirection === 'en-to-es'
        ? (AppState.currentSpanishPrompt || wordObj.es)
        : wordObj.en;

    const accentMatch = target.match(/[áéíóúüñÁÉÍÓÚÜÑ]/);
    const hasAccent   = !!accentMatch;

    hintStage++;

    let hintText = '';

    if (hintStage === 1) {
        hintText = target.substring(0, 1);
    } else if (hintStage === 2) {
        hintText = target.substring(0, Math.ceil(target.length / 2));
        if (!hasAccent) UI.btnHint.disabled = true;
    } else if (hintStage === 3 && hasAccent) {
        const currentLen = Math.ceil(target.length / 2);
        const revealLen  = Math.max(currentLen, accentMatch.index + 1);
        hintText = target.substring(0, revealLen);
        UI.btnHint.disabled = true;
    }

    if (hintText) {
        UI.hintDisplay.innerText = hintText + '...';
        UI.hintDisplay.classList.remove('hidden');
    }

    UI.input.focus();
}

/* ─────────────────────────────────────────────────────────────────────────────
   SKIP
   Skips the current word in competitive mode (and in practice mode).
   ───────────────────────────────────────────────────────────────────────────── */

function skipWord() {
    if (AppState.isLocked) return;

    const word = AppState.words[AppState.currentWordIndex];

    // Debug / test word path
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

/* ─────────────────────────────────────────────────────────────────────────────
   UNDO
   Real-time undo for competitive mode and settings-panel undo/redo for
   adjusting word stats after the fact.
   ───────────────────────────────────────────────────────────────────────────── */

/* --- REAL-TIME UNDO --- */

function undoAction() {
    clearTimeout(transitionTimer);

    // Debug / test word path
    if (AppState.isTestWord) {
        AppState.isLocked = false;
        UI.competitive.classList.remove('wrong-state');
        UI.btnUndo.classList.add('hidden');
        UI.progressContainer.classList.add('hidden');
        UI.progressBar.style.width = '0%';
        UI.questionWord.innerText  = `TESTING ${AppState.testWordCounter}`;
        UI.input.disabled = false;
        UI.input.focus();
        UI.feedback.innerText   = '';
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

/* --- SESSION MILESTONES --- */

function checkSessionMilestones() {
    const freq = AppState.settings.autoDownloadFrequency || 10;
    if (sessionActionCount > 0 && sessionActionCount % freq === 0 && AppState.settings.autoDownload) {
        triggerExport(true);
    }
    if (sessionActionCount >= 15) {
        UI.savePrompt.classList.add('visible');
    }
}

/* --- HISTORY MANAGEMENT --- */

function addToHistory(wordIndex, action, prevStreak) {
    AppState.actionHistory = [{ index: wordIndex, action, prevStreak }];
    AppState.redoHistory   = [];
    updateSettingsUndoLabel();
}

/* --- SETTINGS UNDO LABEL --- */

function updateSettingsUndoLabel() {
    const label   = document.getElementById('settings-undo-label');
    const btn     = document.getElementById('btn-settings-undo');
    const redoBtn = document.getElementById('btn-settings-redo');
    if (!label || !btn) return;

    btn.innerText = 'Undo';
    if (redoBtn) redoBtn.innerText = 'Redo';

    if (AppState.actionHistory.length === 0) {
        btn.disabled = true;
        if (AppState.redoHistory.length > 0 && redoBtn) {
            const next    = AppState.redoHistory[0];
            const word    = AppState.words[next.index];
            const actionText = next.action.charAt(0).toUpperCase() + next.action.slice(1);
            label.innerText = `Redo available: ${actionText} on "${word.en}"`;
        } else {
            label.innerText = 'Nothing to undo';
        }
    } else {
        btn.disabled = false;
        const last   = AppState.actionHistory[0];
        const word   = AppState.words[last.index];
        const actionText = last.action.charAt(0).toUpperCase() + last.action.slice(1);
        btn.innerText   = `Undo ${actionText}`;
        label.innerText = `Last Action: ${actionText} on "${word.en}"`;
    }

    if (redoBtn) {
        if (AppState.redoHistory.length === 0) {
            redoBtn.disabled = true;
        } else {
            redoBtn.disabled = false;
            const next   = AppState.redoHistory[0];
            const actionText = next.action.charAt(0).toUpperCase() + next.action.slice(1);
            redoBtn.innerText = `Redo ${actionText}`;
        }
    }
}

/* --- SETTINGS UNDO / REDO --- */

function performSettingsUndo() {
    if (AppState.actionHistory.length === 0) return;

    const last = AppState.actionHistory.pop();
    AppState.redoHistory = [last];

    const word = AppState.words[last.index];

    if (last.action === 'correct') {
        word.streak   = Math.max(0, word.streak   - 1);
        word.attempts = Math.max(0, word.attempts - 1);
        word.correct  = Math.max(0, (word.correct  || 0) - 1);
    } else if (last.action === 'wrong') {
        word.wrong    = Math.max(0, word.wrong    - 1);
        word.attempts = Math.max(0, word.attempts - 1);
        word.streak   = last.prevStreak;
    } else if (last.action === 'skip') {
        word.skip     = Math.max(0, word.skip     - 1);
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
