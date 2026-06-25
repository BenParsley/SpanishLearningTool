/* =============================================================================
   modules/stats.js
   Sorting helpers, stats-table renderers (competitive + practice), column-
   visibility menus, and the wordlist bundle-filter menu.
   ============================================================================= */

/* --- SORTING --- */

function sortStats(column) {
    if (AppState.sort.column === column) {
        AppState.sort.order = AppState.sort.order === 'asc' ? 'desc' : 'asc';
    } else {
        AppState.sort.column = column;
        AppState.sort.order  = (column === 'en' || column === 'es') ? 'asc' : 'desc';
    }
    loadStatsSorting();
    renderStats();
}

function sortPracticeStats(column) {
    if (AppState.practiceSort.column === column) {
        AppState.practiceSort.order = AppState.practiceSort.order === 'asc' ? 'desc' : 'asc';
    } else {
        AppState.practiceSort.column = column;
        AppState.practiceSort.order  = (column === 'p_en' || column === 'p_es') ? 'asc' : 'desc';
    }
    updatePracticeSortHeaderStyles();
    renderPracticeStats();
}

function loadStatsSorting() {
    UI.tableHeaders.forEach(th => {
        th.classList.remove('active-sort', 'asc', 'desc');
        if (th.dataset.sort === AppState.sort.column) {
            th.classList.add('active-sort', AppState.sort.order);
        }
    });
}

function updatePracticeSortHeaderStyles() {
    document.querySelectorAll('#view-practice-stats th[data-sort]').forEach(th => {
        th.classList.remove('active-sort', 'asc', 'desc');
        if (th.dataset.sort === AppState.practiceSort.column) {
            th.classList.add('active-sort', AppState.practiceSort.order);
        }
    });
}

/* --- STATS RENDER (COMPETITIVE) --- */

function renderStats() {
    UI.stats.scrollTop   = 0;
    UI.statsBody.innerHTML = '';

    const totalW = AppState.words.reduce((a, b) => a + b.weight, 0);

    const maxAttempts  = Math.max(...AppState.words.map(w => w.attempts),       1);
    const maxStreak    = Math.max(...AppState.words.map(w => w.streak),          1);
    const maxCorrect   = Math.max(...AppState.words.map(w => w.correct   || 0), 1);
    const maxIncorrect = Math.max(...AppState.words.map(w => (w.wrong || 0) + (w.skip || 0)), 1);
    const maxWeight    = Math.max(...AppState.words.map(w => w.weight),          1);

    const isDebug = AppState.isStatsDebug;

    let filteredWords = [...AppState.words].filter(w => {
        if (!AppState.statsSearch) return true;
        return w.en.toLowerCase().includes(AppState.statsSearch) ||
               w.es.toLowerCase().includes(AppState.statsSearch);
    });

    const { column: col, order } = AppState.sort;
    filteredWords.sort((a, b) => {
        let valA = col === 'incorrect' ? (a.wrong || 0) + (a.skip || 0) : a[col];
        let valB = col === 'incorrect' ? (b.wrong || 0) + (b.skip || 0) : b[col];
        if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
        if (valA < valB) return order === 'asc' ? -1 :  1;
        if (valA > valB) return order === 'asc' ?  1 : -1;
        return 0;
    });

    filteredWords.forEach(word => {
        const index = AppState.words.indexOf(word);
        const tr    = document.createElement('tr');

        let rankIcon = '&nbsp;';
        if      (word.streak >= 15) rankIcon = '🥇';
        else if (word.streak >= 10) rankIcon = '🥈';
        else if (word.streak >=  5) rankIcon = '🥉';

        if      (word.streak >= 15) tr.classList.add('streak-15');
        else if (word.streak >= 10) tr.classList.add('streak-10');
        else if (word.streak >=  5) tr.classList.add('streak-5');

        const weightPerc   = ((word.weight / totalW) * 100).toFixed(1);
        const incorrectVal = (word.wrong || 0) + (word.skip || 0);

        const createBar = (val, max, type, label = val, field = null) => {
            let spanAttrs = 'class="stat-value"';
            if (isDebug && field) {
                spanAttrs = `contenteditable="true" class="editable-stat stat-value" data-idx="${index}" data-field="${field}"`;
            }
            return `<div class="stat-cell"><span ${spanAttrs}>${label}</span></div>`;
        };

        tr.innerHTML = `
            <td>${word.en}</td>
            <td class="clickable-cell" title="Click to listen">${word.es}</td>
            <td>${createBar(word.attempts,    maxAttempts,  'attempts',  word.attempts,    'attempts')}</td>
            <td>${createBar(word.streak,      maxStreak,    'streak',    (rankIcon !== '&nbsp;' ? rankIcon + ' ' : '') + word.streak, 'streak')}</td>
            <td>${createBar(word.correct || 0, maxCorrect,  'correct',   word.correct || 0, 'correct')}</td>
            <td>${createBar(incorrectVal,     maxIncorrect, 'incorrect', incorrectVal)}</td>
            <td>${createBar(word.weight,      maxWeight,    'weight',    weightPerc + '%')}</td>
        `;
        UI.statsBody.appendChild(tr);

        const esCell = tr.querySelector('.clickable-cell');
        if (esCell) esCell.addEventListener('click', () => speakSpanish(word.es));
    });
}

/* --- STATS RENDER (PRACTICE) --- */

function renderPracticeStats() {
    UI.practiceStats.scrollTop    = 0;
    UI.practiceStatsBody.innerHTML = '';

    const maxAttempts  = Math.max(...AppState.words.map(w => w.p_attempts || 0), 1);
    const maxStreak    = Math.max(...AppState.words.map(w => w.p_streak   || 0), 1);
    const maxCorrect   = Math.max(...AppState.words.map(w => w.p_correct  || 0), 1);
    const maxIncorrect = Math.max(...AppState.words.map(w => (w.p_wrong || 0) + (w.p_skip || 0)), 1);

    let filteredWords = [...AppState.words].filter(w => {
        if (!AppState.practiceStatsSearch) return true;
        return w.en.toLowerCase().includes(AppState.practiceStatsSearch) ||
               w.es.toLowerCase().includes(AppState.practiceStatsSearch);
    });

    const { column: col, order } = AppState.practiceSort;
    filteredWords.sort((a, b) => {
        let valA = col === 'p_incorrect' ? (a.p_wrong || 0) + (a.p_skip || 0) : a[col];
        let valB = col === 'p_incorrect' ? (b.p_wrong || 0) + (b.p_skip || 0) : b[col];
        if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
        if (valA < valB) return order === 'asc' ? -1 :  1;
        if (valA > valB) return order === 'asc' ?  1 : -1;
        return 0;
    });

    filteredWords.forEach(word => {
        const tr = document.createElement('tr');
        const incorrectVal = (word.p_wrong || 0) + (word.p_skip || 0);

        const createBar = (val, max, type, label = val) =>
            `<div class="stat-cell"><span class="stat-value">${label}</span></div>`;

        tr.innerHTML = `
            <td>${word.en}</td>
            <td class="clickable-cell" title="Click to listen">${word.es}</td>
            <td>${createBar(word.p_attempts || 0, maxAttempts,  'attempts',  word.p_attempts || 0)}</td>
            <td>${createBar(word.p_streak   || 0, maxStreak,    'streak',    word.p_streak   || 0)}</td>
            <td>${createBar(word.p_correct  || 0, maxCorrect,   'correct',   word.p_correct  || 0)}</td>
            <td>${createBar(incorrectVal,          maxIncorrect, 'incorrect', incorrectVal)}</td>
        `;
        UI.practiceStatsBody.appendChild(tr);

        const esCell = tr.querySelector('.clickable-cell');
        if (esCell) esCell.addEventListener('click', () => speakSpanish(word.es));
    });
}

/* --- COLUMN VISIBILITY MENUS --- */

function loadStatsPage() {
    const btn  = document.getElementById('btn-stats-cols');
    const menu = document.getElementById('stats-cols-menu');
    if (!btn || !menu) return;

    const columns = [
        { key: 'en',        label: 'English' },
        { key: 'es',        label: 'Spanish' },
        { key: 'attempts',  label: 'Attempts' },
        { key: 'streak',    label: 'Streak' },
        { key: 'correct',   label: 'Correct' },
        { key: 'incorrect', label: 'Incorrect' },
        { key: 'weight',    label: 'Weight' }
    ];

    menu.innerHTML = '';
    columns.forEach(col => {
        const label    = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type    = 'checkbox';
        checkbox.checked = AppState.settings.statsColumns[col.key];

        if (['en', 'es'].includes(col.key)) {
            checkbox.disabled      = true;
            label.style.opacity    = '0.6';
            label.style.cursor     = 'not-allowed';
        }

        checkbox.addEventListener('change', e => {
            AppState.settings.statsColumns[col.key] = e.target.checked;
            updateStatsColumnVisibility();
            saveData();
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(col.label));
        menu.appendChild(label);
    });

    btn.addEventListener('click', e => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });

    document.addEventListener('click', e => {
        if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== btn) {
            menu.classList.add('hidden');
        }
    });
}

function loadPractice() {
    const btn  = document.getElementById('btn-practice-stats-cols');
    const menu = document.getElementById('practice-stats-cols-menu');
    if (!btn || !menu) return;

    const columns = [
        { key: 'p_en',        label: 'English' },
        { key: 'p_es',        label: 'Spanish' },
        { key: 'p_attempts',  label: 'Attempts' },
        { key: 'p_streak',    label: 'Streak' },
        { key: 'p_correct',   label: 'Correct' },
        { key: 'p_incorrect', label: 'Incorrect' }
    ];

    menu.innerHTML = '';
    columns.forEach(col => {
        const label    = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type    = 'checkbox';
        checkbox.checked = AppState.settings.practiceStatsColumns[col.key];

        if (['p_en', 'p_es'].includes(col.key)) {
            checkbox.disabled      = true;
            label.style.opacity    = '0.6';
            label.style.cursor     = 'not-allowed';
        }

        checkbox.addEventListener('change', e => {
            AppState.settings.practiceStatsColumns[col.key] = e.target.checked;
            updatePracticeStatsColumnVisibility();
            saveData();
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(col.label));
        menu.appendChild(label);
    });

    btn.addEventListener('click', e => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });

    document.addEventListener('click', e => {
        if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== btn) {
            menu.classList.add('hidden');
        }
    });
}

function setupBundleFilterMenu() {
    const btn  = document.getElementById('btn-bundle-filter');
    const menu = document.getElementById('bundle-filter-menu');
    if (!btn || !menu) return;

    menu.innerHTML = '';
    const bundleIds = Object.keys(AppState.wordlistBundleFilter);

    const updateCheckboxStates = () => {
        const checkedCount = Object.values(AppState.wordlistBundleFilter).filter(v => v !== false).length;
        menu.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (cb.checked && checkedCount <= 1) {
                cb.disabled                  = true;
                cb.parentElement.style.opacity = '0.5';
                cb.parentElement.style.cursor  = 'not-allowed';
            } else {
                cb.disabled                  = false;
                cb.parentElement.style.opacity = '';
                cb.parentElement.style.cursor  = '';
            }
        });
    };

    bundleIds.forEach(id => {
        const bundleInfo = getAvailableBundles().find(b => b.id === id);
        if (!bundleInfo) return;

        const label    = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type    = 'checkbox';
        checkbox.checked = AppState.wordlistBundleFilter[id] !== false;

        checkbox.addEventListener('change', e => {
            AppState.wordlistBundleFilter[id] = e.target.checked;
            updateCheckboxStates();
            renderWordlist();
        });

        label.appendChild(checkbox);
        const plainName = bundleInfo.name
            .replace(/^\p{Emoji_Presentation}\s*/u, '')
            .replace(/^\p{So}\s*/u, '');
        label.appendChild(document.createTextNode(plainName));
        menu.appendChild(label);
    });

    updateCheckboxStates();

    // Replace button node to remove stale listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', e => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });
}

/* --- COLUMN VISIBILITY APPLIERS --- */

function updateStatsColumnVisibility() {
    const table = document.querySelector('#view-stats table');
    if (!table) return;
    const cols = AppState.settings.statsColumns;
    for (const [key, visible] of Object.entries(cols)) {
        table.classList.toggle(`hide-col-${key}`, !visible);
    }
}

function updatePracticeStatsColumnVisibility() {
    const table = document.querySelector('#view-practice-stats table');
    if (!table) return;
    const cols = AppState.settings.practiceStatsColumns;
    for (const [key, visible] of Object.entries(cols)) {
        table.classList.toggle(`hide-col-${key}`, !visible);
    }
}
