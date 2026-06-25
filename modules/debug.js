/* =============================================================================
   modules/debug.js
   Debug mode enable/disable, weight recalibration, location eligibility
   checks, and the in-panel debug info renderer.
   ============================================================================= */

function enableDebugMode() {
    if (!isDebugLocationEligible()) {
        loadDebugSettings();
        return;
    }
    if (AppState.isTestWord) return;

    resetControls();
    AppState.isLocked     = false;
    AppState.isStatsDebug = false;
    AppState.isTestWord   = true;
    AppState.testWordCounter = 1;

    UI.questionLabel.innerText = 'DEBUG MODE';
    UI.questionWord.innerText  = 'TESTING 1';
    UI.input.placeholder       = 'Type TESTING 1...';

    if (!UI.testingContainer.classList.contains('hidden') && UI.debugContent) {
        UI.debugContent.innerHTML = '<p><strong>Debug Mode Active</strong><br>Stats are disabled.</p>';
    }
    loadDebugSettings();
}

function disableDebugMode() {
    console.log('Disable Debug Mode clicked');

    // Stats debug path
    if (AppState.isStatsDebug) {
        AppState.isStatsDebug = false;
        renderStats();
        loadDebugSettings();
        if (UI.debugContent) UI.debugContent.innerHTML = '<p>Debug Mode Disabled</p>';
        saveData();
        return;
    }

    if (!AppState.isTestWord) return;

    if (transitionTimer) clearTimeout(transitionTimer);
    AppState.isTestWord = false;

    if (!UI.testingContainer.classList.contains('hidden') && UI.debugContent) {
        UI.debugContent.innerHTML = '<p>Debug Mode Disabled</p>';
    }
    if (UI.competitive.classList.contains('hidden')) {
        switchView('view-competitive');
    }
    loadDebugSettings();
    loadNextWord();
}

function recalibrateWeights() {
    if (!AppState.words || AppState.words.length === 0) return;
    if (confirm('Recalibrate weights based on performance stats?')) {
        AppState.words.forEach(w => updateWordWeight(w));
        saveData();
        if (!UI.stats.classList.contains('hidden')) renderStats();
        alert('Weights recalibrated.');
    }
}

function isDebugLocationEligible() {
    return !UI.competitive.classList.contains('hidden') && AppState.currentBundleId !== null;
}

function clearDebugStateForIneligibleLocation() {
    const hadCompetitiveDebug = AppState.isTestWord;
    const hadStatsDebug       = AppState.isStatsDebug;

    if (!hadCompetitiveDebug && !hadStatsDebug) return;

    if (transitionTimer) clearTimeout(transitionTimer);
    AppState.isTestWord   = false;
    AppState.isStatsDebug = false;

    if (hadStatsDebug && !UI.stats.classList.contains('hidden')) renderStats();

    if (hadCompetitiveDebug && AppState.currentBundleId && AppState.words.length > 0) {
        loadNextWord();
    }

    if (UI.debugContent) UI.debugContent.innerHTML = '<p>Debug Mode Disabled</p>';
}

function loadDebugSettings() {
    const enableBtn      = document.getElementById('btn-debug-enable');
    const disableBtn     = document.getElementById('btn-debug-disable');
    const debugControls  = document.getElementById('debug-controls');
    const actionRow      = document.getElementById('debug-action-row');
    const locationMessage = document.getElementById('debug-location-message');
    if (!enableBtn || !disableBtn) return;

    const isEligible = isDebugLocationEligible();

    if (!isEligible) clearDebugStateForIneligibleLocation();

    if (locationMessage) {
        if (isEligible) {
            locationMessage.classList.add('hidden');
        } else {
            locationMessage.classList.remove('hidden');
            locationMessage.innerHTML =
                '<p><strong>Note:</strong> You must be in the Competitive mode of a wordlist to use the debug menu.</p>';
        }
    }

    enableBtn.disabled  = !isEligible;
    disableBtn.disabled = !isEligible;
    if (actionRow) actionRow.classList.toggle('debug-location-disabled', !isEligible);

    if (isEligible && (AppState.isTestWord || AppState.isStatsDebug)) {
        enableBtn.classList.add('selected');
        disableBtn.classList.remove('selected');
        if (debugControls) debugControls.classList.remove('debug-disabled');
    } else {
        enableBtn.classList.remove('selected');
        disableBtn.classList.add('selected');
        if (debugControls) debugControls.classList.add('debug-disabled');
    }

    enableBtn.style.opacity       = '';
    enableBtn.style.cursor        = '';
    enableBtn.style.pointerEvents = '';
}

function renderDebugInfo() {
    if (UI.testingContainer.classList.contains('hidden')) return;
    if (!UI.debugContent) return;
    if (!AppState.isActiveStatsVisible || !isDebugLocationEligible()) {
        UI.debugContent.innerHTML = '';
        return;
    }
    if (AppState.currentWordIndex === null || !AppState.words[AppState.currentWordIndex]) {
        UI.debugContent.innerHTML = '<p>No word loaded</p>';
        return;
    }

    const word = AppState.words[AppState.currentWordIndex];

    let rankIcon = 'None';
    if      (word.streak >= 15) rankIcon = '🥇 Gold';
    else if (word.streak >= 10) rankIcon = '🥈 Silver';
    else if (word.streak >=  5) rankIcon = '🥉 Bronze';

    UI.debugContent.innerHTML = `
        <div style="font-size: 0.85rem; line-height: 1.4;">
            <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 4px;">Word Stats</h4>
            <div style="display: grid; grid-template-columns: 70px 1fr; gap: 4px;">
                <strong>English:</strong>    <span>${word.en}</span>
                <strong>Spanish:</strong>    <span>${word.es}</span>
                <strong>Streak:</strong>     <span>${word.streak}</span>
                <strong>Correct:</strong>    <span>${word.correct || 0}</span>
                <strong>Note:</strong>       <span>${word.note || '-'}</span>
                <strong>Badge:</strong>      <span>${rankIcon}</span>
                <strong>Weight:</strong>     <span>${word.weight.toFixed(0)}</span>
                <strong>Attempts:</strong>   <span>${word.attempts}</span>
                <strong>Wrong:</strong>      <span>${word.wrong}</span>
                <strong>Don't Know:</strong> <span>${word.skip}</span>
            </div>
        </div>
    `;
}
