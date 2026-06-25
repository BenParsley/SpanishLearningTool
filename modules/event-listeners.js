/* =============================================================================
   modules/event-listeners.js
   All DOM event listener wiring for the app.  Called once from init.js
   after the DOM is ready and all modules have been loaded.
   ============================================================================= */

function userControls() {
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
                    loadGrid();
                });
            }
        });
    }

    if (UI.modePageNext) {
        UI.modePageNext.addEventListener('click', () => {
            if (AppState.modePage < 1) {
                swipeGrid(UI.modeGrid, 'left', () => {
                    AppState.modePage += 1;
                    loadGrid();
                });
            }
        });
    }

    if (UI.vocabPagePrev) {
        UI.vocabPagePrev.addEventListener('click', () => {
            if (AppState.vocabPage > 0) {
                swipeGrid(UI.bundleGrid, 'right', () => {
                    AppState.vocabPage -= 1;
                    loadGridContent();
                });
            }
        });
    }

    if (UI.vocabPageNext) {
        UI.vocabPageNext.addEventListener('click', () => {
            if (AppState.vocabPage < getMaxVocabPage()) {
                swipeGrid(UI.bundleGrid, 'left', () => {
                    AppState.vocabPage += 1;
                    loadGridContent();
                });
            }
        });
    }

    if (UI.infinitiveVerbPagePrev) {
        UI.infinitiveVerbPagePrev.addEventListener('click', () => {
            if (AppState.infinitiveVerbPage > 0) {
                swipeGrid(UI.infinitiveVerbBundleGrid, 'right', () => {
                    AppState.infinitiveVerbPage -= 1;
                    loadInfinitiveVerbGridContent();
                });
            }
        });
    }

    if (UI.infinitiveVerbPageNext) {
        const infinitiveVerbMaxPage = Math.max(0, Math.ceil(getInfinitiveVerbBundles().length / getVocabPageSize()) - 1);
        UI.infinitiveVerbPageNext.addEventListener('click', () => {
            if (AppState.infinitiveVerbPage < infinitiveVerbMaxPage) {
                swipeGrid(UI.infinitiveVerbBundleGrid, 'left', () => {
                    AppState.infinitiveVerbPage += 1;
                    loadInfinitiveVerbGridContent();
                });
            }
        });
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.dataset.target;

            const serEstarView = document.getElementById('view-ser-estar');
            const isSerEstarActive = !!serEstarView && !serEstarView.classList.contains('hidden');
            if (isSerEstarActive && (target === 'se-practice' || target === 'se-competitive')) {
                setSerEstarPanel(target);
                document.querySelectorAll('.tab-btn').forEach(t => t.classList.toggle('active', t.dataset.target === target));
                return;
            }

            const paraPorView = document.getElementById('view-para-por');
            const isParaPorActive = !!paraPorView && !paraPorView.classList.contains('hidden');
            if (isParaPorActive && (target === 'pp-practice' || target === 'pp-competitive')) {
                setParaPorPanel(target);
                document.querySelectorAll('.tab-btn').forEach(t => t.classList.toggle('active', t.dataset.target === target));
                return;
            }

            const aquiAllaView = document.getElementById('view-aqui-alla');
            const isAquiAllaActive = !!aquiAllaView && !aquiAllaView.classList.contains('hidden');
            if (isAquiAllaActive && (target === 'aq-practice' || target === 'aq-competitive')) {
                setAquiAllaPanel(target);
                document.querySelectorAll('.tab-btn').forEach(t => t.classList.toggle('active', t.dataset.target === target));
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

    document.querySelectorAll('.se-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => setSerEstarPanel(e.currentTarget.dataset.panel));
    });

    document.querySelectorAll('.se-comp-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => seShowSection(e.currentTarget.dataset.section));
    });

    const conjButtons = document.getElementById('se-comp-conj-buttons');
    if (conjButtons) {
        conjButtons.addEventListener('click', (e) => {
            const pronounCell = e.target.closest('.se-conj-pronoun-cell');
            if (pronounCell) {
                seTogglePronounColumn(Number(pronounCell.dataset.colIndex));
                return;
            }
            const btn = e.target.closest('.se-conj-btn');
            if (!btn || btn.classList.contains('se-col-blocked')) return;
            seHandleConjClick(btn.dataset.conj);
        });
    }

    const seSkipBtn = document.getElementById('se-comp-skip');
    if (seSkipBtn) seSkipBtn.addEventListener('click', seHandleSkip);
    const seUndoBtn = document.getElementById('se-comp-undo');
    if (seUndoBtn) seUndoBtn.addEventListener('click', seUndoAction);
    const seNextBtn = document.getElementById('se-comp-next');
    if (seNextBtn) seNextBtn.addEventListener('click', seLoadNextPhrase);
    const seAudioBtn = document.getElementById('se-comp-audio-btn');
    if (seAudioBtn) seAudioBtn.addEventListener('click', playSerEstarQuestionAudio);

    const seShowEnglishToggle = document.getElementById('se-show-english-toggle');
    if (seShowEnglishToggle) {
        seShowEnglishToggle.addEventListener('change', () => {
            const translationEl = document.getElementById('se-comp-translation');
            if (translationEl) translationEl.classList.toggle('se-hidden-english', !seShowEnglishToggle.checked);
        });
    }

    const sePhraseEl = document.getElementById('se-comp-phrase');
    if (sePhraseEl) {
        sePhraseEl.addEventListener('click', (e) => {
            const clickedWord = e.target.closest('.se-clickable-word');
            if (!clickedWord) return;
            const spokenWord = (clickedWord.textContent || '').trim();
            if (spokenWord) speakSpanish(spokenWord);
        });
    }

    document.querySelectorAll('.se-stats-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => seShowStatsView(e.currentTarget.dataset.statsview));
    });

    const seSerCircle = document.getElementById('se-ser-circle-wrap');
    if (seSerCircle) seSerCircle.addEventListener('click', () => {
        SeComp.expandedBreakdowns.ser = !SeComp.expandedBreakdowns.ser;
        renderSeStandardStats();
    });

    const seEstarCircle = document.getElementById('se-estar-circle-wrap');
    if (seEstarCircle) seEstarCircle.addEventListener('click', () => {
        SeComp.expandedBreakdowns.estar = !SeComp.expandedBreakdowns.estar;
        renderSeStandardStats();
    });

    const seStatsSearch = document.getElementById('se-stats-search');
    if (seStatsSearch) seStatsSearch.addEventListener('input', (e) => {
        SeComp.searchQuery = e.target.value;
        renderSeStats();
    });

    document.querySelectorAll('#se-stats-table th[data-se-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.seSort;
            if (SeComp.sortCol === col) {
                SeComp.sortDir = SeComp.sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                SeComp.sortCol = col;
                SeComp.sortDir = col === 'phrase' || col === 'category' ? 'asc' : 'desc';
            }
            renderSeStats();
        });
    });

    document.querySelectorAll('.pp-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => setParaPorPanel(e.currentTarget.dataset.panel));
    });

    document.querySelectorAll('.aq-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => setAquiAllaPanel(e.currentTarget.dataset.panel));
    });

    if (UI.btnPracticeEn)      UI.btnPracticeEn.addEventListener('click', () => startPracticeMode('en-to-es'));
    if (UI.btnPracticeEs)      UI.btnPracticeEs.addEventListener('click', () => startPracticeMode('es-to-en'));
    if (UI.btnPracticeShuffle) UI.btnPracticeShuffle.addEventListener('click', shufflePracticeGrid);
    if (UI.btnPracticeSkip)    UI.btnPracticeSkip.addEventListener('click', skipPracticeWord);

    if (UI.practiceSearch) {
        UI.practiceSearch.addEventListener('input', (e) => {
            AppState.practiceSearch = e.target.value.toLowerCase();
            renderPracticeGrid();
        });

        UI.practiceSearch.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;

            const visibleItems = Array.from(UI.practiceGrid.children).filter(child =>
                !child.classList.contains('search-dimmed') &&
                !child.classList.contains('matched') &&
                !child.classList.contains('incorrect-gray')
            );

            const searchTerm = e.target.value.trim().toLowerCase();
            const exactMatch = visibleItems.find(child => {
                const index = parseInt(child.dataset.index);
                const word  = AppState.words[index];
                if (!word) return false;
                const text = AppState.practiceDirection === 'en-to-es' ? word.es : word.en;
                return text.toLowerCase() === searchTerm;
            });

            if (exactMatch) { exactMatch.click(); e.preventDefault(); return; }
            if (visibleItems.length === 1) { visibleItems[0].click(); e.preventDefault(); }
        });
    }

    if (UI.btnResetPractice) UI.btnResetPractice.addEventListener('click', resetPracticeProgress);

    document.querySelectorAll('.settings-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => UI.testingContainer.classList.toggle('hidden'));
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

        if (!UI.landing.classList.contains('hidden')) {
            crossfadeViews(UI.landing, UI.modeSelect, () => {
                setSelectorNavState('mode');
                updateCurrentSectionDisplay('view-mode-select');
            });
            return;
        }

        if (UI.infinitiveVerbLanding && !UI.infinitiveVerbLanding.classList.contains('hidden')) {
            crossfadeViews(UI.infinitiveVerbLanding, UI.modeSelect, () => {
                setSelectorNavState('mode');
                updateCurrentSectionDisplay('view-mode-select');
            });
            return;
        }

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

        const aquiAllaView = document.getElementById('view-aqui-alla');
        if (aquiAllaView && !aquiAllaView.classList.contains('hidden')) {
            crossfadeViews(aquiAllaView, UI.modeSelect, () => {
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
        AppState.isLocked        = false;
        AppState.currentBundleId = null;
        AppState.words           = [];
        AppState.currentWordIndex = null;
        AppState.practiceWordIndex = null;
        UI.subNav.classList.add('hidden');

        const currentView = document.querySelector('.view:not(.hidden)');
        if (AppState.activeLanding === 'infinitive-verb') {
            crossfadeViews(currentView, UI.infinitiveVerbLanding, () => {
                AppState.infinitiveVerbPage = 0;
                setSelectorNavState('infinitive-verbs');
                loadInfinitiveVerbGridContent();
                updateCurrentSectionDisplay('view-infinitive-verb-landing');
            });
        } else {
            crossfadeViews(currentView, UI.landing, () => {
                AppState.vocabPage = 0;
                setSelectorNavState('landing');
                loadGridContent();
                updateCurrentSectionDisplay('view-landing');
            });
        }
    });

    document.getElementById('random-voice').addEventListener('change', (e) => {
        AppState.settings.randomVoice = e.target.checked;
        SpeechManager.setRandom(e.target.checked);
        loadAudioSettings();
        saveData();
    });

    document.querySelectorAll('.voice-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const gender = e.target.dataset.gender;
            AppState.settings.voiceGender = gender;
            SpeechManager.setGender(gender);
            loadAudioSettings();
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

    document.getElementById('require-apostrophe').addEventListener('change', (e) => {
        AppState.settings.requireApostrophe = e.target.checked;
        saveData();
    });

    document.getElementById('new-word-delay').addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        AppState.settings.newWordDelay = val;
        document.getElementById('new-word-delay-val').innerText = `${(val / 1000).toFixed(1)}s`;
    });
    document.getElementById('new-word-delay').addEventListener('change', saveData);

    const audioShortcutInput = document.getElementById('audio-shortcut');
    if (audioShortcutInput) {
        audioShortcutInput.value = getAudioShortcut();

        audioShortcutInput.addEventListener('keydown', (e) => {
            if (['Tab', 'Escape'].includes(e.key)) return;
            e.preventDefault();

            if (e.key === 'Backspace' || e.key === 'Delete') {
                AppState.settings.audioShortcut = '';
                audioShortcutInput.value = '';
                saveData();
                return;
            }

            const shortcut = eventToShortcut(e);
            if (!shortcut || ['Ctrl', 'Alt', 'Shift', 'Meta'].includes(shortcut)) return;
            AppState.settings.audioShortcut = shortcut;
            audioShortcutInput.value = shortcut;
            saveData();
        });

        audioShortcutInput.addEventListener('blur', () => {
            audioShortcutInput.value = getAudioShortcut();
        });
    }

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
        document.documentElement.style.setProperty('--anim-speed', 1 / val);
    });
    document.getElementById('anim-speed').addEventListener('change', saveData);

    document.getElementById('rec-anim-speed').addEventListener('click', () => {
        const val = 1.2;
        document.getElementById('anim-speed').value = val;
        AppState.settings.animSpeed = val;
        document.getElementById('anim-speed-val').innerText = val + 'x';
        document.documentElement.style.setProperty('--anim-speed', 1 / val);
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
                AppState.wordlistSort.key   = key;
                AppState.wordlistSort.order = (key === 'skip' || key === 'wrong') ? 'desc' : 'asc';
            }
            renderWordlist();
        });
    });

    document.getElementById('btn-export').addEventListener('click', () => triggerExport(false));
    document.getElementById('btn-import-trigger').addEventListener('click', () => {
        document.getElementById('file-import').click();
    });
    document.getElementById('file-import').addEventListener('change', handleFileImport);

    document.getElementById('btn-delete-all-data-debug').addEventListener('click', () => {
        if (confirm("Are you sure you want to delete ALL statistics across ALL bundles? Settings will be preserved.")) {
            AppState.isDeleting = true;
            const dataToKeep = { settings: AppState.settings, lastSaved: new Date().toISOString() };
            _setLocalStorageSafe('wordBundleStats', JSON.stringify(dataToKeep));
            location.reload();
        }
    });

    UI.quickSaveBtn.addEventListener('click', () => {
        saveData();
        UI.savePrompt.classList.remove('visible');
        sessionActionCount = 0;
    });

    UI.progressContainer.addEventListener('click', () => {
        if (UI.competitive.classList.contains('wrong-state')) undoAction();
    });

    UI.questionAudioBtn.addEventListener('click', playCurrentQuestionAudio);

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
        th.addEventListener('click', () => sortStats(th.dataset.sort));
    });

    document.querySelectorAll('#view-practice-stats th[data-sort]').forEach(th => {
        th.addEventListener('click', () => sortPracticeStats(th.dataset.sort));
    });

    document.addEventListener('keydown', (e) => {
        if (isAudioShortcutPressed(e) && !shouldIgnoreAudioShortcut(e)) {
            e.preventDefault();
            playCurrentQuestionAudio();
            return;
        }
        if (handleSerEstarCompetitiveKeydown(e)) { e.preventDefault(); return; }

        if (UI.competitive.classList.contains('hidden')) return;

        if (e.key === 'Enter') {
            if (!AppState.isLocked) submitAnswer();
        } else if (e.code === 'Space') {
            if (document.activeElement === UI.input) return;
            e.preventDefault();
            if (AppState.isLocked && !UI.btnUndo.classList.contains('hidden')) undoAction();
            else if (!AppState.isLocked) showHint();
        }
    });

    document.getElementById('btn-debug-enable').addEventListener('click', enableDebugMode);
    document.getElementById('btn-debug-disable').addEventListener('click', disableDebugMode);
    document.getElementById('btn-debug-recalibrate').addEventListener('click', recalibrateWeights);
    document.getElementById('btn-debug-randomize').addEventListener('click', randomizeBundleData);

    // Testing Utilities
    document.getElementById('btn-test-confetti-burst').addEventListener('click', () => {
        triggerConfetti('burst');
    });
    document.getElementById('btn-test-confetti-implode').addEventListener('click', () => {
        triggerConfetti('implode');
    });
    document.getElementById('btn-test-confetti-badge').addEventListener('click', () => {
        const tier = document.getElementById('sel-test-confetti-badge').value;
        const colorMap = {
            bronze: ['#f8e3cc', '#ed8936', '#c05621'],
            silver: ['#e2e8f0', '#a0aec0', '#718096'],
            gold:   ['#fff5b1', '#ecc94b', '#b7791f'],
        };
        const colors = colorMap[tier];
        triggerConfetti('implode', 5, 2, colors);
        setTimeout(() => triggerConfetti('burst', 2, 2, colors), 1000);
    });
    document.getElementById('btn-test-storage-near-full').addEventListener('click', () => {
        const el     = document.getElementById('storage-warning');
        const textEl = document.getElementById('storage-warning-text');
        if (textEl) textEl.textContent = '⚠️ [Test] Storage nearly full — 4.2 MB used (~84% of the ~5 MB limit). Download a backup now to avoid losing progress.';
        if (el) el.classList.remove('hidden');
    });
    document.getElementById('btn-test-storage-save-failed').addEventListener('click', () => {
        const el     = document.getElementById('storage-warning');
        const textEl = document.getElementById('storage-warning-text');
        if (textEl) textEl.textContent = '⚠️ Storage full — save failed! Download a backup and clear old data to continue saving progress.';
        if (el) el.classList.remove('hidden');
    });
    document.getElementById('btn-test-storage-dismiss').addEventListener('click', () => {
        document.getElementById('storage-warning').classList.add('hidden');
    });
    document.getElementById('btn-test-storage-size').addEventListener('click', () => {
        const raw     = localStorage.getItem('wordBundleStats') || '';
        const bytes   = raw.length;
        const mb      = bytes / (1024 * 1024);
        const pct     = (bytes / (5 * 1024 * 1024) * 100).toFixed(1);
        const el      = document.getElementById('storage-warning');
        const textEl  = document.getElementById('storage-warning-text');
        if (textEl) textEl.textContent = `ℹ️ [Test] Current storage: ${mb.toFixed(2)} MB used (${pct}% of 5 MB limit).`;
        if (el) el.classList.remove('hidden');
    });

    document.getElementById('btn-toggle-debug-stats').addEventListener('click', () => {
        const debugContent = document.getElementById('debug-content');
        const toggleBtn    = document.getElementById('btn-toggle-debug-stats');
        if (debugContent.classList.contains('hidden')) {
            debugContent.classList.remove('hidden');
            AppState.isActiveStatsVisible = true;
            toggleBtn.innerText = 'Hide Active Stats';
            renderDebugInfo();
        } else {
            debugContent.classList.add('hidden');
            AppState.isActiveStatsVisible = false;
            toggleBtn.innerText = 'Show Active Stats';
        }
    });

    // Collapsible settings groups
    const SETTINGS_COLLAPSE_KEY = 'settingsGroupCollapsed';

    function loadCollapsedGroups() {
        try { return JSON.parse(localStorage.getItem(SETTINGS_COLLAPSE_KEY)) || {}; } catch { return {}; }
    }
    function saveCollapsedGroups(state) {
        localStorage.setItem(SETTINGS_COLLAPSE_KEY, JSON.stringify(state));
    }
    // applyGroupCollapse is defined in modules/animations.js

    const collapsedState = loadCollapsedGroups();
    document.querySelectorAll('.settings-group h3[data-group]').forEach(h3 => {
        const group   = h3.dataset.group;
        const groupEl = h3.closest('.settings-group');
        applyGroupCollapse(groupEl, !!collapsedState[group], false);
        h3.addEventListener('click', () => {
            const nowCollapsed = groupEl.classList.contains('collapsed');
            applyGroupCollapse(groupEl, !nowCollapsed, true);
            const state = loadCollapsedGroups();
            state[group] = !nowCollapsed;
            saveCollapsedGroups(state);
        });
    });

    UI.statsBody.addEventListener('input', (e) => {
        if (!AppState.isStatsDebug) return;
        const target = e.target;
        if (target.classList.contains('editable-stat')) {
            const idx   = parseInt(target.dataset.idx);
            const field = target.dataset.field;
            const val   = parseInt(target.innerText);
            if (!isNaN(val) && AppState.words[idx]) AppState.words[idx][field] = val;
        }
    });

    document.getElementById('btn-settings-undo').addEventListener('click', performSettingsUndo);
    document.getElementById('btn-settings-redo').addEventListener('click', performSettingsRedo);
}
