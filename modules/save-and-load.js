/* =============================================================================
   modules/save-and-load.js
   localStorage load/save, auto-download exports, and JSON file import.
   ============================================================================= */

/* --- STORAGE QUOTA HELPERS --- */

const STORAGE_WARN_BYTES  = 4 * 1024 * 1024; // 4 MB — show warning banner
const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024; // ~5 MB — browser cap

/**
 * Checks the size of the `wordBundleStats` blob and shows/hides the
 * storage-warning banner accordingly.  Called after every write and on load.
 */
function checkStorageQuota() {
    const saved = localStorage.getItem('wordBundleStats');
    const bytes = saved ? saved.length : 0; // each JS string char ≈ 1–2 bytes; length is a safe approximation
    const el     = document.getElementById('storage-warning');
    const textEl = document.getElementById('storage-warning-text');
    if (!el) return;

    if (bytes >= STORAGE_WARN_BYTES) {
        const usedMB = (bytes / (1024 * 1024)).toFixed(1);
        const pct    = Math.min(100, Math.round((bytes / STORAGE_LIMIT_BYTES) * 100));
        if (textEl) {
            textEl.textContent = `⚠️ Storage nearly full — ${usedMB} MB used (~${pct}% of the ~5 MB browser limit). Download a backup now to avoid losing progress.`;
        }
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

/**
 * Safe wrapper around localStorage.setItem.  Catches QuotaExceededError and
 * updates the storage-warning banner with a "save failed" message instead of
 * silently swallowing the error.
 */
function _setLocalStorageSafe(key, value) {
    try {
        localStorage.setItem(key, value);
        if (key === 'wordBundleStats') checkStorageQuota();
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22) {
            const el     = document.getElementById('storage-warning');
            const textEl = document.getElementById('storage-warning-text');
            if (textEl) textEl.textContent = '⚠️ Storage full — save failed! Download a backup and clear old data to continue saving progress.';
            if (el) el.classList.remove('hidden');
            console.error('localStorage quota exceeded — data was NOT saved.', e);
        } else {
            throw e;
        }
    }
}

/* --- SAVE / TIMESTAMP --- */

function saveData() {
    if (AppState.isDeleting) return;

    let fullData = {};
    const existing = localStorage.getItem('wordBundleStats');
    if (existing) {
        try { fullData = JSON.parse(existing); } catch (e) {}
    }

    fullData.settings  = AppState.settings;
    fullData.lastSaved = new Date().toISOString();

    if (AppState.currentBundleId) {
        if (!fullData.bundles) fullData.bundles = {};
        fullData.bundles[AppState.currentBundleId] = AppState.words;
    }

    _setLocalStorageSafe('wordBundleStats', JSON.stringify(fullData));
    updateTimestamp();
}

function updateTimestamp() {
    const saved = localStorage.getItem('wordBundleStats');
    if (!saved) return;
    try {
        const date = new Date(JSON.parse(saved).lastSaved);
        if (UI && UI.timestamp) {
            UI.timestamp.innerText = `Last Saved: ${date.toLocaleTimeString()} ${date.toLocaleDateString()}`;
        }
    } catch (e) {}
}

/* --- EXPORT --- */

function triggerExport(isAuto = false) {
    saveData();

    let fullData = {};
    try {
        const existing = localStorage.getItem('wordBundleStats');
        if (existing) fullData = JSON.parse(existing);
    } catch (e) {}

    const exportObj = {
        timestamp: new Date().toISOString(),
        bundles:   fullData.bundles   || {},
        settings:  fullData.settings  || {}
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const anchor  = document.createElement('a');

    const now    = new Date();
    const pad2   = n => String(n).padStart(2, '0');
    const day    = pad2(now.getDate());
    const month  = pad2(now.getMonth() + 1);
    const hours  = pad2(now.getHours());
    const mins   = pad2(now.getMinutes());
    const secs   = pad2(now.getSeconds());

    const fileName = isAuto
        ? `data - ${day}-${month} ${hours}-${mins}-${secs}.json`
        : `[manual] LearningApp_FullBackup - ${now.toISOString().split('T')[0]} - ${now.toTimeString().split(' ')[0].replace(/:/g, '-')}.json`;

    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', fileName);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
}

/* --- IMPORT --- */

async function handleFileImport(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    let successCount = 0;
    let failCount    = 0;
    const errors     = [];
    let currentBundleUpdated = false;

    let fullData = {};
    try {
        const existing = localStorage.getItem('wordBundleStats');
        if (existing) fullData = JSON.parse(existing);
    } catch (e) {}
    if (!fullData.bundles) fullData.bundles = {};

    const filePromises = files.map(file => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload  = e => resolve({ name: file.name, content: e.target.result });
        reader.onerror = () => resolve({ name: file.name, error: 'Read error' });
        reader.readAsText(file);
    }));

    const results = await Promise.all(filePromises);

    for (const result of results) {
        if (result.error) {
            failCount++;
            errors.push(`${result.name}: Could not read file`);
            continue;
        }

        try {
            const importedData = JSON.parse(result.content);

            if (importedData.bundles) {
                for (const [bId, bWords] of Object.entries(importedData.bundles)) {
                    const knownBundle = getAvailableBundles().find(b => b && b.id === bId);
                    if (knownBundle) {
                        fullData.bundles[bId] = bWords;
                        if (AppState.currentBundleId === bId) {
                            AppState.words = bWords;
                            currentBundleUpdated = true;
                        }
                    }
                }
                successCount++;
            } else if (importedData.bundleId && importedData.words) {
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
            }
        } catch (err) {
            failCount++;
            errors.push(`${result.name}: JSON parse error`);
        }
    }

    if (successCount > 0) {
        _setLocalStorageSafe('wordBundleStats', JSON.stringify(fullData));
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

/* --- INITIAL DATA LOAD --- */

function loadDataFromLocalStorage() {
    const savedJSON = localStorage.getItem('wordBundleStats');
    if (savedJSON) {
        try {
            const data = JSON.parse(savedJSON);
            if (data.settings) {
                AppState.settings = data.settings;

                // Defaults for fields that might be absent in older saves
                if (AppState.settings.randomVoice === undefined)              AppState.settings.randomVoice = true;
                if (AppState.settings.requireInvertedPunctuation === undefined) AppState.settings.requireInvertedPunctuation = false;
                if (AppState.settings.requireApostrophe === undefined)        AppState.settings.requireApostrophe = false;
                if (AppState.settings.audioShortcut === undefined)            AppState.settings.audioShortcut = 'Alt+P';
                if (!AppState.settings.activeBackground)                      AppState.settings.activeBackground = 'bg-rainbow';
                if (!AppState.settings.practiceAnimSpeed)                     AppState.settings.practiceAnimSpeed = 1;
                if (!AppState.settings.modeGridSize || AppState.settings.modeGridSize === 550) AppState.settings.modeGridSize = 650;
                if (!AppState.settings.wordlistCols)                          AppState.settings.wordlistCols = 6;
                if (!AppState.settings.animSpeed)                             AppState.settings.animSpeed = 1.2;
                if (AppState.settings.voiceVolume === undefined)              AppState.settings.voiceVolume = 1;
                if (AppState.settings.autoDownload === undefined)             AppState.settings.autoDownload = true;
                if (!AppState.settings.autoDownloadFrequency)                 AppState.settings.autoDownloadFrequency = 10;
                if (AppState.settings.autoCycleBackground === undefined)      AppState.settings.autoCycleBackground = true;

                // newWordDelay migration
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
                if (AppState.settings.statsColumns.correct   === undefined) AppState.settings.statsColumns.correct   = true;
                if (AppState.settings.statsColumns.incorrect === undefined) AppState.settings.statsColumns.incorrect = true;

                if (!AppState.settings.practiceStatsColumns) {
                    AppState.settings.practiceStatsColumns = {
                        p_en: true, p_es: true, p_attempts: true,
                        p_streak: true, p_correct: true, p_incorrect: true
                    };
                }

                // Force mandatory columns
                AppState.settings.statsColumns.en = true;
                AppState.settings.statsColumns.es = true;

                // Legacy / migration — handle old key names from saved data
                if (AppState.settings.bgTheme && !AppState.settings.activeBackground) {
                    AppState.settings.activeBackground = AppState.settings.bgTheme;
                }
                delete AppState.settings.bgTheme;
                AppState.settings.activeBackground  = normalizeBackground(AppState.settings.activeBackground);
                AppState.settings.autoCycleBackground = true; // dark-mode toggle removed; always cycle

                // Sync DOM controls
                loadAudioSettings();

                const strictCheck = document.getElementById('strict-accents');
                if (strictCheck) strictCheck.checked = AppState.settings.strictAccents;

                const invertedPuncCheck = document.getElementById('require-inverted-punctuation');
                if (invertedPuncCheck) invertedPuncCheck.checked = AppState.settings.requireInvertedPunctuation;

                const apostropheCheck = document.getElementById('require-apostrophe');
                if (apostropheCheck) apostropheCheck.checked = AppState.settings.requireApostrophe;

                SpeechManager.setGender(AppState.settings.voiceGender);
                SpeechManager.setRandom(AppState.settings.randomVoice);

                updateStatsColumnVisibility();
                updatePracticeStatsColumnVisibility();

                const newWordDelayInput = document.getElementById('new-word-delay');
                if (newWordDelayInput) {
                    newWordDelayInput.value = AppState.settings.newWordDelay;
                    document.getElementById('new-word-delay-val').innerText =
                        `${(AppState.settings.newWordDelay / 1000).toFixed(1)}s`;
                }

                const animInput = document.getElementById('anim-speed');
                if (animInput) {
                    animInput.value = AppState.settings.animSpeed;
                    document.getElementById('anim-speed-val').innerText = AppState.settings.animSpeed + 'x';
                    document.documentElement.style.setProperty('--anim-speed', 1 / AppState.settings.animSpeed);
                }

                document.documentElement.dataset.animPreset = '1';

                const volInput = document.getElementById('voice-volume');
                if (volInput) {
                    volInput.value = AppState.settings.voiceVolume;
                    document.getElementById('voice-volume-val').innerText =
                        Math.round(AppState.settings.voiceVolume * 100) + '%';
                    SpeechManager.setVolume(AppState.settings.voiceVolume);
                }

                const randomVoiceInput = document.getElementById('random-voice');
                if (randomVoiceInput) randomVoiceInput.checked = AppState.settings.randomVoice;

                const audioShortcutInput = document.getElementById('audio-shortcut');
                if (audioShortcutInput) audioShortcutInput.value = getAudioShortcut();

                const autoDownloadInput = document.getElementById('auto-download');
                if (autoDownloadInput) autoDownloadInput.checked = AppState.settings.autoDownload;

                const autoDownloadFreqInput = document.getElementById('auto-download-freq');
                if (autoDownloadFreqInput) {
                    autoDownloadFreqInput.value = AppState.settings.autoDownloadFrequency;
                    document.getElementById('auto-download-freq-val').innerText =
                        AppState.settings.autoDownloadFrequency;
                }

            }
        } catch (e) {
            console.error('Error loading saved data', e);
        }
    }

    // Always re-apply normalised values (even if no saved data)
    AppState.settings.activeBackground = normalizeBackground(AppState.settings.activeBackground);
    AppState.settings.audioShortcut     = getAudioShortcut();

    const normalizedModeGridSize = Math.max(360, Math.min(960, parseInt(AppState.settings.modeGridSize, 10) || 650));
    AppState.settings.modeGridSize = normalizedModeGridSize;
    const modeGridSizeInput = document.getElementById('mode-grid-size');
    if (modeGridSizeInput) {
        modeGridSizeInput.value = normalizedModeGridSize;
        document.getElementById('mode-grid-size-val').innerText = `${normalizedModeGridSize}px`;
    }
    document.documentElement.style.setProperty('--mode-grid-max', `${normalizedModeGridSize}px`);

    const normalizedWordlistCols = Math.max(1, Math.min(6, parseInt(AppState.settings.wordlistCols, 10) || 6));
    AppState.settings.wordlistCols = normalizedWordlistCols;
    const colsInput = document.getElementById('wordlist-cols');
    if (colsInput) {
        colsInput.value = normalizedWordlistCols;
        document.getElementById('wordlist-cols-val').innerText = normalizedWordlistCols;
    }
    document.documentElement.style.setProperty('--wordlist-cols', normalizedWordlistCols);

    setBackground(AppState.settings.activeBackground);
    handleBackgroundCycle();

    updateTimestamp();
    checkStorageQuota();
}
