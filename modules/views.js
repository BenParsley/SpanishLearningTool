/* =============================================================================
   modules/views.js
   Navigation state, the mode-select grid, the landing-page bundle grid,
   loadBundle, switchView, updateCurrentSectionDisplay, and the wordlist renderer.
   View crossfade animation (crossfadeViews) is in modules/animations.js.
   ============================================================================= */

/* --- BUNDLE EMOJI MAP --- */

function getBundleEmoji(bundleId) {
    const map = {
        'bundle_1':  '🦴',  // Body Parts
        'bundle_2':  '🐾',  // Animals
        'bundle_3':  '😊',  // Emotions
        'bundle_4':  '💬',  // Filler Words
        'bundle_5':  '🇵🇦', // Panamanian Phrases
        'bundle_6':  '🏃',  // Infinitive Verbs 1-30
        'bundle_7':  '🏃',  // Infinitive Verbs 31-60
        'bundle_8':  '🏃',  // Infinitive Verbs 61-90
        'bundle_9':  '🏃',  // Infinitive Verbs 91-120
        'bundle_10': '🏃',  // Infinitive Verbs 121-150
        'bundle_11': '🏃',  // Infinitive Verbs 151-180
        'bundle_12': '🏃',  // Infinitive Verbs 181-210
        'bundle_13': '🏃',  // Infinitive Verbs 211-240
    };
    return map[bundleId] || '📚';
}

/* --- NAV STATE --- */

function setSelectorNavState(state) {
    const leftGroup   = document.querySelector('.nav-group.left');
    const centerGroup = document.querySelector('.nav-group.center');
    const rightGroup  = document.querySelector('.nav-group.right');
    const backBtn     = document.getElementById('global-back-btn');
    const navSelectorTitle = document.getElementById('nav-selector-title');
    const tabButtons  = document.querySelectorAll('.tab-btn');

    const setCenteredTitle = (titleText) => {
        tabButtons.forEach(btn => { btn.style.display = 'none'; });
        if (navSelectorTitle) {
            navSelectorTitle.textContent = titleText;
            navSelectorTitle.classList.remove('hidden');
        }
    };

    const seTabBar = document.querySelector('#view-ser-estar .se-tab-bar');
    const ppTabBar = document.querySelector('#view-para-por .pp-tab-bar');

    const setMainTabConfig = (firstLabel, firstTarget, secondLabel, secondTarget, thirdLabel, thirdTarget) => {
        if (tabButtons[0]) { tabButtons[0].innerHTML = firstLabel; tabButtons[0].dataset.target = firstTarget; }
        if (tabButtons[1]) { tabButtons[1].textContent = secondLabel; tabButtons[1].dataset.target = secondTarget; }
        if (tabButtons[2]) {
            if (thirdLabel && thirdTarget) {
                tabButtons[2].textContent = thirdLabel;
                tabButtons[2].dataset.target = thirdTarget;
                tabButtons[2].style.display = '';
            } else {
                tabButtons[2].style.display = 'none';
            }
        }
    };

    const showTabs = () => {
        setMainTabConfig('Wordlist', 'view-wordlist', 'Competitive', 'view-competitive');
        tabButtons.forEach((btn, i) => {
            btn.style.display = i < 2 ? '' : 'none';
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
        if (leftGroup)  { leftGroup.style.display = ''; leftGroup.style.visibility = 'hidden'; }
        if (centerGroup) centerGroup.style.display = '';
        if (rightGroup)  { rightGroup.style.display = ''; rightGroup.style.visibility = ''; }
        setCenteredTitle('Choose Your Topic');
        if (backBtn) { backBtn.textContent = '←'; backBtn.classList.remove('mode-placeholder'); backBtn.disabled = false; }
        return;
    }

    if (state === 'landing') {
        UI.mainContainer.classList.add('wide');
        if (seTabBar) seTabBar.classList.remove('hidden');
        if (ppTabBar) ppTabBar.classList.remove('hidden');
        UI.nav.classList.remove('mode-nav-muted');
        if (leftGroup)  { leftGroup.style.display = ''; leftGroup.style.visibility = ''; }
        if (centerGroup) centerGroup.style.display = '';
        if (rightGroup)  { rightGroup.style.display = ''; rightGroup.style.visibility = ''; }
        setCenteredTitle('Choose Your Vocabulary');
        if (backBtn) { backBtn.textContent = '←'; backBtn.classList.remove('mode-placeholder'); backBtn.disabled = false; }
        return;
    }

    if (state === 'ser-estar') {
        UI.mainContainer.classList.add('wide');
        UI.nav.classList.remove('mode-nav-muted');
        if (leftGroup)  { leftGroup.style.display = ''; leftGroup.style.visibility = ''; }
        if (centerGroup) centerGroup.style.display = '';
        if (rightGroup)  { rightGroup.style.display = ''; rightGroup.style.visibility = ''; }
        setMainTabConfig('Practice <span class="se-tab-subtitle">(Prediction Types)</span>', 'se-practice', 'Competitive', 'se-competitive');
        tabButtons.forEach(btn => { btn.style.display = ''; btn.classList.remove('active'); });
        if (tabButtons[0]) tabButtons[0].classList.add('active');
        if (navSelectorTitle) { navSelectorTitle.classList.add('hidden'); navSelectorTitle.textContent = ''; }
        setSerEstarPanel('se-practice', true);
        if (seTabBar) seTabBar.classList.add('hidden');
        if (ppTabBar) ppTabBar.classList.remove('hidden');
        if (backBtn) { backBtn.textContent = '←'; backBtn.classList.remove('mode-placeholder'); backBtn.disabled = false; }
        return;
    }

    if (state === 'para-por') {
        UI.mainContainer.classList.add('wide');
        UI.nav.classList.remove('mode-nav-muted');
        if (leftGroup)  { leftGroup.style.display = ''; leftGroup.style.visibility = ''; }
        if (centerGroup) centerGroup.style.display = '';
        if (rightGroup)  { rightGroup.style.display = ''; rightGroup.style.visibility = ''; }
        setMainTabConfig('Practice <span class="se-tab-subtitle">(Thematic Roles)</span>', 'pp-practice', 'Competitive', 'pp-competitive');
        tabButtons.forEach(btn => { btn.style.display = ''; btn.classList.remove('active'); });
        if (tabButtons[0]) tabButtons[0].classList.add('active');
        if (navSelectorTitle) { navSelectorTitle.classList.add('hidden'); navSelectorTitle.textContent = ''; }
        setParaPorPanel('pp-practice', true);
        if (seTabBar) seTabBar.classList.remove('hidden');
        if (ppTabBar) ppTabBar.classList.add('hidden');
        const aqTabBar = document.querySelector('#view-aqui-alla .aq-tab-bar');
        if (aqTabBar) aqTabBar.classList.remove('hidden');
        if (backBtn) { backBtn.textContent = '←'; backBtn.classList.remove('mode-placeholder'); backBtn.disabled = false; }
        return;
    }

    if (state === 'aqui-alla') {
        UI.mainContainer.classList.add('wide');
        UI.nav.classList.remove('mode-nav-muted');
        if (leftGroup)  { leftGroup.style.display = ''; leftGroup.style.visibility = ''; }
        if (centerGroup) centerGroup.style.display = '';
        if (rightGroup)  { rightGroup.style.display = ''; rightGroup.style.visibility = ''; }
        setMainTabConfig('Practice <span class="se-tab-subtitle">(Spatial Deixis)</span>', 'aq-practice', 'Competitive', 'aq-competitive');
        tabButtons.forEach(btn => { btn.style.display = ''; btn.classList.remove('active'); });
        if (tabButtons[0]) tabButtons[0].classList.add('active');
        if (navSelectorTitle) { navSelectorTitle.classList.add('hidden'); navSelectorTitle.textContent = ''; }
        setAquiAllaPanel('aq-practice', true);
        if (seTabBar) seTabBar.classList.remove('hidden');
        if (ppTabBar) ppTabBar.classList.remove('hidden');
        const aqTabBar = document.querySelector('#view-aqui-alla .aq-tab-bar');
        if (aqTabBar) aqTabBar.classList.add('hidden');
        if (backBtn) { backBtn.textContent = '←'; backBtn.classList.remove('mode-placeholder'); backBtn.disabled = false; }
        return;
    }

    if (state === 'infinitive-verbs') {
        UI.mainContainer.classList.add('wide');
        UI.nav.classList.remove('mode-nav-muted');
        if (leftGroup)  { leftGroup.style.display = ''; leftGroup.style.visibility = ''; }
        if (centerGroup) centerGroup.style.display = '';
        if (rightGroup)  { rightGroup.style.display = ''; rightGroup.style.visibility = ''; }
        setCenteredTitle('Choose Your Infinitive Verb Bundle');
        if (backBtn) { backBtn.textContent = '←'; backBtn.classList.remove('mode-placeholder'); backBtn.disabled = false; }
        return;
    }

    // Default "learning" state
    if (seTabBar) seTabBar.classList.remove('hidden');
    if (ppTabBar) ppTabBar.classList.remove('hidden');
    const aqTabBarDefault = document.querySelector('#view-aqui-alla .aq-tab-bar');
    if (aqTabBarDefault) aqTabBarDefault.classList.remove('hidden');
    UI.nav.classList.remove('mode-nav-muted');
    if (leftGroup)  { leftGroup.style.display = ''; leftGroup.style.visibility = ''; }
    if (centerGroup) centerGroup.style.display = '';
    if (rightGroup)  { rightGroup.style.display = ''; rightGroup.style.visibility = ''; }
    showTabs();
    if (backBtn) { backBtn.textContent = '←'; backBtn.classList.remove('mode-placeholder'); backBtn.disabled = false; }
}

/* --- MODE SELECT --- */

function loadGrid() {
    UI.modeGrid.innerHTML = '';

    const modesPage0 = [
        { name: 'Random Vocabulary', active: true,  action: 'vocabulary' },
        { name: 'Infinitive Verbs',  active: true,  action: 'infinitive-verbs' },
        { name: '',                  active: false },
        { name: '',                  active: false },
        { name: '',                  active: false }
    ];
    while (modesPage0.length < 9) modesPage0.push({ name: '', active: false });

    const modesPage1 = [
        { name: 'SER or ESTAR',        active: true, action: 'ser-estar' },
        { name: 'PARA or POR',         active: true, action: 'para-por' },
        { name: 'Locational Phrasing', active: true, action: 'aqui-alla' }
    ];
    while (modesPage1.length < 9) modesPage1.push({ name: '', active: false });

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
                        loadGridContent();
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
                } else if (mode.action === 'aqui-alla') {
                    crossfadeViews(UI.modeSelect, document.getElementById('view-aqui-alla'), () => {
                        UI.mainContainer.classList.add('wide');
                        setSelectorNavState('aqui-alla');
                        updateCurrentSectionDisplay('view-aqui-alla');
                    });
                } else if (mode.action === 'infinitive-verbs') {
                    crossfadeViews(UI.modeSelect, UI.infinitiveVerbLanding, () => {
                        AppState.infinitiveVerbPage = 0;
                        setSelectorNavState('infinitive-verbs');
                        loadInfinitiveVerbGridContent();
                        updateCurrentSectionDisplay('view-infinitive-verb-landing');
                    });
                }
            };
        }
        UI.modeGrid.appendChild(btn);
    });

    if (UI.modePagePrev) UI.modePagePrev.disabled = AppState.modePage === 0;
    if (UI.modePageNext) UI.modePageNext.disabled = AppState.modePage === 1;
}

/* --- LANDING PAGE --- */

function loadGridContent() {
    UI.bundleGrid.innerHTML = '';
    const savedJSON  = localStorage.getItem('wordBundleStats');
    const savedData  = savedJSON ? JSON.parse(savedJSON) : {};
    const allBundles = getAvailableBundles();
    const totalSlots = getVocabPageSize();
    const maxPage    = getMaxVocabPage();
    if (AppState.vocabPage > maxPage) AppState.vocabPage = maxPage;

    const start = AppState.vocabPage * totalSlots;
    const selectableBundles = allBundles.slice(start, start + totalSlots);

    selectableBundles.forEach(bundle => {
        const btn = document.createElement('button');
        btn.className = 'bundle-btn';

        if (bundle) {
            const isCustomBundle = bundle.id === getCustomVocabBundleId();

            if (isCustomBundle) {
                btn.classList.add('bundle-btn-custom');
                if (AppState.isCustomSelectionMode) btn.classList.add('bundle-btn-custom-armed');
            }

            if (AppState.isCustomSelectionMode && !isCustomBundle && getSelectableCustomBundleIds().includes(bundle.id)) {
                btn.classList.add('bundle-btn-selectable');
                if (isBundleSelectedForCustom(bundle.id)) btn.classList.add('bundle-btn-selected');
                else btn.classList.add('bundle-btn-unselected');
            }

            // Stats
            const runtimeData  = getRuntimeBundleData(bundle);
            const freshWords   = runtimeData ? parseBundleData(runtimeData) : [];
            let words = freshWords;
            if (savedData.bundles && savedData.bundles[bundle.id]) {
                const savedWords = savedData.bundles[bundle.id];
                words = freshWords.length > 0 ? mergeSavedWords(freshWords, savedWords) : savedWords;
            }

            const total      = words.length;
            const encounters = words.filter(w => w.attempts > 0).length;
            const bronze     = words.filter(w => w.streak >= 5  && w.streak < 10).length;
            const silver     = words.filter(w => w.streak >= 10 && w.streak < 15).length;
            const gold       = words.filter(w => w.streak >= 15).length;

            if (!isCustomBundle && encounters > 0) btn.classList.add('bundle-btn-static-stats');

            const pctEncounters = total > 0 ? ((encounters / total) * 100).toFixed(1) : '0.0';
            const pctBronze     = total > 0 ? ((bronze     / total) * 100).toFixed(1) : '0.0';
            const pctSilver     = total > 0 ? ((silver     / total) * 100).toFixed(1) : '0.0';
            const pctGold       = total > 0 ? ((gold       / total) * 100).toFixed(1) : '0.0';

            const statsTitleLine = !isCustomBundle
                ? `<div class="bundle-stats-title">${bundle.name}</div>`
                : '';

            if (isCustomBundle && AppState.isCustomSelectionMode) {
                const selectedIds = getCustomSelectedBundleIds();
                let selectedListHTML = '';
                if (selectedIds.length === 0) {
                    selectedListHTML = '<div class="bundle-custom-list-empty">No bundles selected</div>';
                } else {
                    const names = selectedIds.map(id => {
                        const b = allBundles.find(x => x && x.id === id);
                        return b ? b.name : id;
                    });
                    selectedListHTML = '<div class="bundle-custom-list">'
                        + names.map(n => `<div class="bundle-custom-list-item">${n}</div>`).join('')
                        + '</div>';
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
            } else if (encounters === 0) {
                btn.innerHTML = `
                    <span class="bundle-name">${bundle.name}</span>
                    <span class="bundle-virgin-emoji">${getBundleEmoji(bundle.id)}</span>`;
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
                const cancelBtn   = btn.querySelector('.custom-action-cancel');

                if (continueBtn) {
                    continueBtn.addEventListener('click', e => {
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
                    cancelBtn.addEventListener('click', e => {
                        e.preventDefault();
                        e.stopPropagation();
                        AppState.isCustomSelectionMode = false;
                        AppState.customSelectedBundleIds = [];
                        loadGridContent();
                    });
                }
            }

            btn.onclick = () => {
                if (isCustomBundle) {
                    if (!AppState.isCustomSelectionMode) {
                        AppState.isCustomSelectionMode = true;
                        loadGridContent();
                        return;
                    }
                    return; // handled by Continue/Cancel buttons
                }
                if (AppState.isCustomSelectionMode && getSelectableCustomBundleIds().includes(bundle.id)) {
                    toggleCustomBundleSelection(bundle.id);
                    loadGridContent();
                    return;
                }
                loadBundle(bundle);
            };
        } else {
            btn.innerText = 'Vocabulary Unavailable';
            btn.disabled  = true;
        }

        UI.bundleGrid.appendChild(btn);
    });

    // Fill remaining slots with disabled placeholders.
    for (let i = selectableBundles.length; i < totalSlots; i++) {
        const btn = document.createElement('button');
        btn.className = 'bundle-btn';
        btn.innerText = '';
        btn.disabled  = true;
        UI.bundleGrid.appendChild(btn);
    }

    if (UI.vocabPagePrev) UI.vocabPagePrev.disabled = AppState.vocabPage === 0;
    if (UI.vocabPageNext) UI.vocabPageNext.disabled = AppState.vocabPage >= maxPage;
}

/* --- LOAD BUNDLE --- */

function loadBundle(bundle, sourceLanding = 'vocab') {
    // Determine which individual bundle scripts need to be loaded first.
    // For the custom multi-bundles every selected sub-bundle must be ready
    // before buildCustomBundleData / buildInfinitiveVerbBundleData can run.
    const isCustomVocab      = bundle.id === getCustomVocabBundleId();
    const isCustomInfinitive = bundle.id === getCustomInfinitiveVerbBundleId();

    let bundlesToLoad;
    if (isCustomVocab) {
        bundlesToLoad = getCustomSelectedBundleIds()
            .map(id => availableBundles.find(b => b && b.id === id))
            .filter(Boolean);
    } else if (isCustomInfinitive) {
        bundlesToLoad = getInfinitiveVerbSelectedBundleIds()
            .map(id => availableBundles.find(b => b && b.id === id))
            .filter(Boolean);
    } else {
        bundlesToLoad = [bundle];
    }

    const unloaded = bundlesToLoad.filter(b => b.data === null);
    if (unloaded.length > 0) {
        Promise.all(unloaded.map(ensureBundleDataLoaded))
            .then(() => loadBundle(bundle, sourceLanding))
            .catch(err => {
                console.error('Failed to load bundle data:', err);
                alert('Could not load bundle data. Please check your connection and refresh.');
            });
        return;
    }

    AppState.currentBundleId = bundle.id;
    const runtimeBundle = getRuntimeBundle(bundle);
    let freshWords = runtimeBundle.data ? parseBundleData(runtimeBundle.data) : [];

    if (bundle.id === getCustomVocabBundleId() && freshWords.length === 0) {
        alert('Custom has no selected bundles. Click Custom, choose bundles, then click Custom again.');
        return;
    }

    if (bundle.id === getCustomInfinitiveVerbBundleId() && freshWords.length === 0) {
        alert('Select at least one infinitive verb bundle before continuing.');
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
        } catch (e) { console.warn('Failed to merge saved stats'); }
    }

    AppState.words = freshWords;

    const filterIds = bundle.id === getCustomVocabBundleId()
        ? getCustomSelectedBundleIds()
        : bundle.id === getCustomInfinitiveVerbBundleId()
            ? getInfinitiveVerbSelectedBundleIds()
            : [bundle.id];
    AppState.wordlistBundleFilter = {};
    filterIds.forEach(id => { AppState.wordlistBundleFilter[id] = true; });
    setupBundleFilterMenu();

    AppState.activeLanding = sourceLanding;
    const landingEl = sourceLanding === 'infinitive-verb' ? UI.infinitiveVerbLanding : UI.landing;
    landingEl.classList.remove('fade-in');
    setTimeout(() => {
        landingEl.classList.add('hidden');
        setSelectorNavState('learning');
        renderWordlist();
        renderStats();
        switchView('view-wordlist');
        loadDebugSettings();
        loadNextWord();
    }, getViewFadeDuration());
}

/* --- INFINITIVE VERB LANDING PAGE --- */

function loadInfinitiveVerbGridContent() {
    UI.infinitiveVerbBundleGrid.innerHTML = '';
    const savedJSON   = localStorage.getItem('wordBundleStats');
    const savedData   = savedJSON ? JSON.parse(savedJSON) : {};
    const allBundles  = getInfinitiveVerbBundles();
    const totalSlots  = getVocabPageSize();
    const maxPage     = Math.max(0, Math.ceil(allBundles.length / totalSlots) - 1);
    if (AppState.infinitiveVerbPage > maxPage) AppState.infinitiveVerbPage = maxPage;

    const start = AppState.infinitiveVerbPage * totalSlots;
    const selectableBundles = allBundles.slice(start, start + totalSlots);
    const customInfinitiveVerbId = getCustomInfinitiveVerbBundleId();

    selectableBundles.forEach(bundle => {
        const btn = document.createElement('button');
        btn.className = 'bundle-btn';

        if (bundle) {
            const isCustomBundle = bundle.id === customInfinitiveVerbId;

            if (isCustomBundle) {
                btn.classList.add('bundle-btn-custom');
                if (AppState.isInfinitiveVerbSelectionMode) btn.classList.add('bundle-btn-custom-armed');
            }

            if (AppState.isInfinitiveVerbSelectionMode && !isCustomBundle) {
                btn.classList.add('bundle-btn-selectable');
                if (isInfinitiveVerbBundleSelected(bundle.id)) btn.classList.add('bundle-btn-selected');
                else btn.classList.add('bundle-btn-unselected');
            }

            const runtimeData = bundle.data || '';
            const freshWords  = runtimeData ? parseBundleData(runtimeData) : [];
            let words = freshWords;
            if (savedData.bundles && savedData.bundles[bundle.id]) {
                const savedWords = savedData.bundles[bundle.id];
                words = freshWords.length > 0 ? mergeSavedWords(freshWords, savedWords) : savedWords;
            }

            const total      = words.length;
            const encounters = words.filter(w => w.attempts > 0).length;
            const bronze     = words.filter(w => w.streak >= 5  && w.streak < 10).length;
            const silver     = words.filter(w => w.streak >= 10 && w.streak < 15).length;
            const gold       = words.filter(w => w.streak >= 15).length;

            if (!isCustomBundle && encounters > 0) btn.classList.add('bundle-btn-static-stats');

            const pctEncounters = total > 0 ? ((encounters / total) * 100).toFixed(1) : '0.0';
            const pctBronze     = total > 0 ? ((bronze     / total) * 100).toFixed(1) : '0.0';
            const pctSilver     = total > 0 ? ((silver     / total) * 100).toFixed(1) : '0.0';
            const pctGold       = total > 0 ? ((gold       / total) * 100).toFixed(1) : '0.0';

            const statsTitleLine = !isCustomBundle
                ? `<div class="bundle-stats-title">${bundle.name}</div>`
                : '';

            if (isCustomBundle && AppState.isInfinitiveVerbSelectionMode) {
                const selectedIds = getInfinitiveVerbSelectedBundleIds();
                let selectedListHTML = '';
                if (selectedIds.length === 0) {
                    selectedListHTML = '<div class="bundle-custom-list-empty">No bundles selected</div>';
                } else {
                    const names = selectedIds.map(id => {
                        const b = allBundles.find(x => x && x.id === id);
                        return b ? b.name : id;
                    });
                    selectedListHTML = '<div class="bundle-custom-list">'
                        + names.map(n => `<div class="bundle-custom-list-item">${n}</div>`).join('')
                        + '</div>';
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
            } else if (encounters === 0) {
                btn.innerHTML = `
                    <span class="bundle-name">${bundle.name}</span>
                    <span class="bundle-virgin-emoji">${getBundleEmoji(bundle.id)}</span>`;
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

            if (isCustomBundle && AppState.isInfinitiveVerbSelectionMode) {
                const continueBtn = btn.querySelector('.custom-action-continue');
                const cancelBtn   = btn.querySelector('.custom-action-cancel');

                if (continueBtn) {
                    continueBtn.addEventListener('click', e => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (getInfinitiveVerbSelectedBundleIds().length === 0) {
                            alert('Select at least one bundle before continuing.');
                            return;
                        }
                        AppState.isInfinitiveVerbSelectionMode = false;
                        loadBundle(getRuntimeBundle(bundle), 'infinitive-verb');
                    });
                }
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', e => {
                        e.preventDefault();
                        e.stopPropagation();
                        AppState.isInfinitiveVerbSelectionMode = false;
                        AppState.infinitiveVerbSelectedBundleIds = [];
                        loadInfinitiveVerbGridContent();
                    });
                }
            }

            btn.onclick = () => {
                if (isCustomBundle) {
                    if (!AppState.isInfinitiveVerbSelectionMode) {
                        AppState.isInfinitiveVerbSelectionMode = true;
                        loadInfinitiveVerbGridContent();
                        return;
                    }
                    return;
                }
                if (AppState.isInfinitiveVerbSelectionMode) {
                    toggleInfinitiveVerbBundleSelection(bundle.id);
                    loadInfinitiveVerbGridContent();
                    return;
                }
                loadBundle(bundle, 'infinitive-verb');
            };
        } else {
            btn.innerText = 'Unavailable';
            btn.disabled  = true;
        }

        UI.infinitiveVerbBundleGrid.appendChild(btn);
    });

    for (let i = selectableBundles.length; i < totalSlots; i++) {
        const btn = document.createElement('button');
        btn.className = 'bundle-btn';
        btn.innerText = '';
        btn.disabled  = true;
        UI.infinitiveVerbBundleGrid.appendChild(btn);
    }

    if (UI.infinitiveVerbPagePrev) UI.infinitiveVerbPagePrev.disabled = AppState.infinitiveVerbPage === 0;
    if (UI.infinitiveVerbPageNext) UI.infinitiveVerbPageNext.disabled = AppState.infinitiveVerbPage >= maxPage;
}

/* --- SWITCH VIEW --- */

function switchView(viewId) {
    if (AppState.viewTransitionTimer) {
        clearTimeout(AppState.viewTransitionTimer);
        AppState.viewTransitionTimer = null;
    }

    const currentView   = document.querySelector('.view:not(.hidden)');
    const currentViewId = currentView ? currentView.id : null;

    document.querySelectorAll('.view').forEach(v => {
        v.classList.add('hidden');
        if ([
            'view-stats', 'view-wordlist', 'view-competitive', 'view-practice',
            'view-landing', 'view-infinitive-verb-landing', 'view-practice-stats', 'view-mode-select', 'view-welcome',
            'view-ser-estar', 'view-para-por', 'view-aqui-alla'
        ].includes(v.id)) {
            v.classList.remove('fade-in');
            v.style.transition = '';
        }
    });

    if (viewId === 'view-competitive' && AppState.settings.focusMode) {
        document.body.classList.add('focus-mode-active');
    } else {
        document.body.classList.remove('focus-mode-active');
    }

    // Sub-nav visibility
    if (['view-competitive', 'view-stats', 'view-practice', 'view-practice-stats'].includes(viewId)) {
        UI.subNav.classList.remove('hidden');

        if (viewId === 'view-practice' || viewId === 'view-practice-stats') {
            UI.btnSubPlay.innerText          = 'Play';
            UI.btnSubPlay.dataset.target     = 'view-practice';
            UI.btnSubStats.innerText         = 'Statistics';
            UI.btnSubStats.dataset.target    = 'view-practice-stats';
        } else {
            UI.btnSubPlay.innerText          = 'Play';
            UI.btnSubPlay.dataset.target     = 'view-competitive';
            UI.btnSubStats.innerText         = 'Statistics';
            UI.btnSubStats.dataset.target    = 'view-stats';
        }

        document.querySelectorAll('.sub-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.target === viewId);
        });
    } else {
        UI.subNav.classList.add('hidden');
    }

    if (['view-stats', 'view-wordlist', 'view-practice', 'view-practice-stats'].includes(viewId)) {
        UI.mainContainer.classList.add('wide');
        const view = document.getElementById(viewId);
        view.classList.remove('hidden');

        if (viewId === 'view-stats')          renderStats();
        if (viewId === 'view-wordlist')        renderWordlist();
        if (viewId === 'view-practice-stats')  renderPracticeStats();
        if (viewId === 'view-practice') {
            if (hasSavedPracticeProgress()) {
                resumePracticeMode();
            } else {
                UI.practiceModeSelection.classList.remove('hidden');
                UI.practiceGameArea.classList.add('hidden');
                UI.btnResetPractice.classList.add('hidden');
            }
        }

        const wasAlreadyWide = [
            'view-stats', 'view-wordlist', 'view-practice', 'view-practice-stats'
        ].includes(currentViewId);

        if (wasAlreadyWide) {
            view.classList.remove('fade-in');
            void view.offsetWidth;
            view.classList.add('fade-in');
        } else {
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
            void view.offsetWidth;
            view.classList.add('fade-in');
            loadDebugSettings();
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

    loadDebugSettings();
    updateCurrentSectionDisplay(viewId);
}

/* --- SECTION BREADCRUMB --- */

function updateCurrentSectionDisplay(viewId) {
    const sectionDisplay = document.getElementById('current-section-display');
    if (!sectionDisplay) return;

    let displayText = 'Current Location: ';

    if (viewId === 'view-mode-select' || viewId === 'view-welcome') {
        displayText += 'Home';
    } else if (viewId === 'view-landing') {
        displayText += 'Vocabulary > Topic Selection';
    } else if (viewId === 'view-infinitive-verb-landing') {
        displayText += 'Infinitive Verbs > Bundle Selection';
    } else if (['view-competitive', 'view-wordlist', 'view-stats'].includes(viewId)) {
        const isVerbBundle = AppState.currentBundleId &&
            (getInfinitiveVerbBundleIds().includes(AppState.currentBundleId) || AppState.currentBundleId === getCustomInfinitiveVerbBundleId());
        displayText += isVerbBundle ? 'Infinitive Verbs' : 'Vocabulary';
        if (AppState.currentBundleId) {
            const allBundleSearch = isVerbBundle ? getInfinitiveVerbBundles() : getAvailableBundles();
            const bundle = allBundleSearch.find(b => b.id === AppState.currentBundleId);
            const bundleName = bundle ? bundle.name : 'Unknown Topic';

            if (AppState.currentBundleId === getCustomVocabBundleId()) {
                const ids = getCustomSelectedBundleIds();
                if (ids.length > 0) {
                    const names = ids
                        .map(id => getAvailableBundles().find(b => b.id === id)?.name)
                        .filter(Boolean);
                    displayText += ` > Custom (${names.join(', ')})`;
                } else {
                    displayText += ' > Custom';
                }
            } else if (AppState.currentBundleId === getCustomInfinitiveVerbBundleId()) {
                const ids = getInfinitiveVerbSelectedBundleIds();
                if (ids.length > 0) {
                    const names = ids
                        .map(id => getInfinitiveVerbBundles().find(b => b.id === id)?.name)
                        .filter(Boolean);
                    displayText += ` > Multi (${names.join(', ')})`;
                } else {
                    displayText += ' > Multi';
                }
            } else {
                displayText += ` > ${bundleName}`;
            }

            const viewTypeMap = {
                'view-competitive': 'Competitive',
                'view-wordlist':    'Wordlist',
                'view-stats':       'Statistics'
            };
            if (viewTypeMap[viewId]) displayText += ` > ${viewTypeMap[viewId]}`;
        } else {
            displayText += ' > Topic Selection';
        }
    } else if (viewId === 'view-practice' || viewId === 'view-practice-stats') {
        displayText += 'Practice';
        if (viewId === 'view-practice')       displayText += ' > Play';
        if (viewId === 'view-practice-stats') displayText += ' > Statistics';
    } else if (['view-ser-estar', 'se-practice', 'se-competitive'].includes(viewId)) {
        displayText += 'Grammar > Ser/Estar';
        if (viewId === 'se-practice')    displayText += ' > Practice';
        if (viewId === 'se-competitive') displayText += ' > Competitive';
    } else if (['view-para-por', 'pp-practice', 'pp-competitive'].includes(viewId)) {
        displayText += 'Grammar > Para/Por';
        if (viewId === 'pp-practice')    displayText += ' > Practice';
        if (viewId === 'pp-competitive') displayText += ' > Competitive';
    } else if (['view-aqui-alla', 'aq-practice', 'aq-competitive'].includes(viewId)) {
        displayText += 'Grammar > Locational Phrasing';
        if (viewId === 'aq-practice')    displayText += ' > Practice';
        if (viewId === 'aq-competitive') displayText += ' > Competitive';
    } else {
        displayText += 'Unknown Section';
    }

    sectionDisplay.textContent = displayText;
}

/* --- WORDLIST --- */

function renderWordlist() {
    UI.wordlist.scrollTop = 0;
    UI.wordlistContainer.innerHTML = '';

    let wordsToRender = [...AppState.words].filter(word => {
        const bundleId = getCategoryBundleId(word.category);
        if (bundleId && AppState.wordlistBundleFilter[bundleId] === false) return false;
        return true;
    });

    wordsToRender = wordsToRender.filter(word => {
        if (!AppState.wordlistSearch) return true;
        return word.en.toLowerCase().includes(AppState.wordlistSearch) ||
               word.es.toLowerCase().includes(AppState.wordlistSearch);
    });

    if (AppState.wordlistSort.key !== 'default') {
        const { key, order } = AppState.wordlistSort;
        wordsToRender.sort((a, b) => {
            let valA = a[key];
            let valB = b[key];
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ?  1 : -1;
            return 0;
        });
    }

    // Update sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
        if (!btn.dataset.key) return;
        btn.classList.remove('active');
        let label = btn.dataset.key;
        if      (label === 'default') label = 'Default';
        else if (label === 'en')      label = 'English';
        else if (label === 'es')      label = 'Spanish';
        else if (label === 'skip')    label = "Don't Know";
        else if (label === 'wrong')   label = 'Wrong';

        if (btn.dataset.key === AppState.wordlistSort.key) {
            btn.classList.add('active');
            if (btn.dataset.key !== 'default') label += AppState.wordlistSort.order === 'asc' ? ' ↑' : ' ↓';
        }
        btn.innerText = label;
    });

    wordsToRender.forEach(word => {
        const div = document.createElement('div');
        div.className = 'word-square';

        if (AppState.wordlistSort.key === 'skip'  && word.skip  === 0) div.classList.add('dimmed');
        if (AppState.wordlistSort.key === 'wrong' && word.wrong === 0) div.classList.add('dimmed');

        let content = `<strong>${word.en}</strong><span>${word.es}</span>`;
        if (AppState.wordlistSort.key === 'skip')  content += `<span class="skip-badge">Don't Know: ${word.skip}</span>`;
        if (AppState.wordlistSort.key === 'wrong') content += `<span class="wrong-badge">Wrong: ${word.wrong}</span>`;

        const bundleId   = getCategoryBundleId(word.category);
        const bundleInfo = bundleId ? getAvailableBundles().find(b => b.id === bundleId) : null;
        if (bundleInfo) {
            const plainName = bundleInfo.name
                .replace(/^\p{Emoji_Presentation}\s*/u, '')
                .replace(/^\p{So}\s*/u, '');
            content += `<span class="bundle-label">${plainName}</span>`;
        }

        div.innerHTML = content;
        div.addEventListener('click', () => speakSpanish(word.es));
        UI.wordlistContainer.appendChild(div);
    });
}
