/* =============================================================================
   modules/ser-estar.js
   Panel-switch helpers, conjugation button builder, and the full SeComp
   competitive-mode engine for the SER / ESTAR grammar view.
   ============================================================================= */

/* --- CONJUGATION CONSTANTS ---
 * Columns map to pronouns: Yo | Tú | Él/Ella | Ellos/Ellas | Usted
 */
const SER_CONJS   = ['soy',   'eres',  'es',   'son',   'es'];
const ESTAR_CONJS = ['estoy', 'estás', 'está', 'están', 'está'];

/* --- SeComp STATE ---
 * Tracks all mutable state for the ser/estar competitive quiz.
 * currentIndex — raw index into allSerEstarPhrases (used by audio.js too)
 */
const SeComp = {
    currentIndex:       -1,
    phraseQueue:        [],      // shuffled raw-index list
    queuePos:           0,
    step:               'answer', // 'answer' | 'result'
    isLocked:           false,
    awaitingNext:       false,
    blockedColumns:     new Set(),
    history:            [],      // [{idx, statSnap, queuePos}] for undo
    stats:              {},      // phraseIndex → {vA, vC, cA, cC, streak, skips}
    expandedBreakdowns: { ser: false, estar: false },
    searchQuery:        '',
    sortCol:            'attempts',
    sortDir:            'desc',
    _timer:             null,
};

function setSerEstarPanel(panelId, instant = false) {
    const validPanels    = ['se-competitive'];
    const normalizedId   = validPanels.includes(panelId) ? panelId : 'se-practice';
    const currentPanel   = document.querySelector('.se-panel:not(.hidden)');
    const nextPanel      = document.getElementById(normalizedId);

    document.querySelectorAll('.se-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.panel === normalizedId);
    });

    if (normalizedId === 'se-practice') UI.mainContainer.classList.add('wide');

    // Animation handled by animations.js — switchPanelAnimated
    switchPanelAnimated({
        allPanels:    document.querySelectorAll('.se-panel'),
        currentPanel,
        nextPanel,
        instant,
        onEnter: normalizedId === 'se-competitive' ? seEnterCompetitive : null
    });

    updateCurrentSectionDisplay(normalizedId);
}

function seBuildAllConjugationButtons() {
    const conjButtonsEl = document.getElementById('se-comp-conj-buttons');
    if (!conjButtonsEl) return;

    conjButtonsEl.innerHTML = '';

    const pronouns  = ['Yo', 'Tú', 'Él/Ella', 'Ellos/Ellas', 'Usted'];
    const pronounRow = document.createElement('div');
    pronounRow.className = 'se-conj-pronoun-row';
    pronouns.forEach((pronoun, colIdx) => {
        const cell = document.createElement('div');
        cell.className        = 'se-conj-pronoun-cell';
        cell.textContent      = pronoun;
        cell.dataset.colIndex = String(colIdx);
        pronounRow.appendChild(cell);
    });
    conjButtonsEl.appendChild(pronounRow);

    const buildRow = (conjs, rowClass) => {
        const row = document.createElement('div');
        row.className = `se-conj-row ${rowClass}`;
        conjs.forEach((conj, colIdx) => {
            const btn = document.createElement('button');
            btn.className        = 'se-conj-btn';
            btn.textContent      = conj;
            btn.dataset.conj     = conj;
            btn.dataset.colIndex = String(colIdx);
            row.appendChild(btn);
        });
        return row;
    };

    conjButtonsEl.appendChild(buildRow(SER_CONJS,   'se-conj-row-ser'));
    conjButtonsEl.appendChild(buildRow(ESTAR_CONJS, 'se-conj-row-estar'));
}

function seApplyBlockedColumns() {
    const blocked = SeComp.blockedColumns || new Set();

    document.querySelectorAll('#se-comp-conj-buttons .se-conj-pronoun-cell').forEach(cell => {
        cell.classList.toggle('se-pronoun-blocked', blocked.has(Number(cell.dataset.colIndex)));
    });

    document.querySelectorAll('#se-comp-conj-buttons .se-conj-btn').forEach(btn => {
        btn.classList.toggle('se-col-blocked', blocked.has(Number(btn.dataset.colIndex)));
    });
}

function seTogglePronounColumn(colIdx) {
    if (SeComp.isLocked || SeComp.awaitingNext || SeComp.step !== 'answer') return;
    if (!Number.isInteger(colIdx) || colIdx < 0 || colIdx > 4) return;

    if (SeComp.blockedColumns.has(colIdx)) SeComp.blockedColumns.delete(colIdx);
    else SeComp.blockedColumns.add(colIdx);

    seApplyBlockedColumns();
}

function seResetConjugationButtons() {
    document.querySelectorAll('#se-comp-conj-buttons .se-conj-btn').forEach(btn => {
        btn.classList.remove('btn-correct', 'btn-wrong', 'btn-disabled');
    });
}

function seConjugationBelongsToVerb(conj, verb) {
    const v = (verb || '').toLowerCase();
    if (v === 'ser')   return SER_CONJS.includes(conj);
    if (v === 'estar') return ESTAR_CONJS.includes(conj);
    return false;
}

function seMarkConjugationButtons(correctConj, chosenConj) {
    document.querySelectorAll('#se-comp-conj-buttons .se-conj-btn').forEach(btn => {
        const btnConj = btn.dataset.conj;
        if (btnConj === correctConj) btn.classList.add('btn-correct');
        if (btnConj === chosenConj && chosenConj !== correctConj) btn.classList.add('btn-wrong');
        btn.classList.add('btn-disabled');
    });
}

/* =============================================================================
   SeComp COMPETITIVE ENGINE
   ============================================================================= */

/* --- PHRASE CATEGORY LOOKUP ---
 * Determines the sub-category label for a phrase at a given raw index.
 * Groups follow the same order as allSerEstarPhrases (defined in PredictionTypes.js).
 */
function seGetPhraseCategory(idx) {
    if (!Array.isArray(allSerEstarPhrases)) return '';
    const groups = [
        [serDescriptionsNormalized,    'Descriptions'],
        [serOccupationsNormalized,     'Occupations'],
        [serCharacteristicsNormalized, 'Characteristics'],
        [serTimeNormalized,            'Time'],
        [serOriginNormalized,          'Origin'],
        [serRelationshipsNormalized,   'Relationships'],
        [estarPositionNormalized,      'Position'],
        [estarLocationNormalized,      'Location'],
        [estarActionsNormalized,       'Actions'],
        [estarConditionsNormalized,    'Conditions'],
        [estarEmotionsNormalized,      'Emotions'],
    ];
    let offset = 0;
    for (const [arr, label] of groups) {
        if (idx < offset + arr.length) return label;
        offset += arr.length;
    }
    return '';
}

/* Returns (creating if absent) the stats record for a given phrase index. */
function seGetPhraseStat(idx) {
    if (!SeComp.stats[idx]) {
        SeComp.stats[idx] = { vA: 0, vC: 0, cA: 0, cC: 0, streak: 0, skips: 0 };
    }
    return SeComp.stats[idx];
}

/* --- PHRASE RENDERING --- */

/* Renders the current phrase into the DOM.
 * Wraps non-blank tokens in .se-clickable-word spans so they can be tapped to speak.
 */
function seRenderPhrase(idx) {
    const phrase = allSerEstarPhrases[idx];
    if (!phrase) return;

    const spanishRaw = phrase[0] || '';
    const englishRaw = phrase[1] || '';

    const phraseEl = document.getElementById('se-comp-phrase');
    if (phraseEl) {
        phraseEl.innerHTML = spanishRaw.split(/(___)/g).map(part => {
            if (part === '___') return '<span class="se-blank-slot">___</span>';
            return part.split(/(\s+)/g).map(tok =>
                tok.trim() ? `<span class="se-clickable-word">${tok}</span>` : tok
            ).join('');
        }).join('');
    }

    const translationEl = document.getElementById('se-comp-translation');
    if (translationEl) {
        translationEl.innerHTML = englishRaw.replace(/___/g, '___');
        const toggle = document.getElementById('se-show-english-toggle');
        translationEl.classList.toggle('se-hidden-english', toggle ? !toggle.checked : false);
    }

    const feedbackEl = document.getElementById('se-comp-feedback');
    if (feedbackEl) { feedbackEl.textContent = ''; feedbackEl.className = ''; }

    seUpdateStreakBar(idx);
}

/* Reveals the blank in the phrase with the given conjugation, coloured by result. */
function seRevealBlank(conj, result) {
    const blankSlot = document.querySelector('#se-comp-phrase .se-blank-slot');
    if (blankSlot) {
        blankSlot.outerHTML = `<span class="se-revealed-blank" data-result="${result}">${conj}</span>`;
    }
}

/* Updates the streak progress bar (hidden until the phrase has been attempted). */
function seUpdateStreakBar(idx) {
    const wrapper = document.getElementById('se-comp-streak-wrapper');
    const fill    = document.getElementById('se-comp-streak-fill');
    if (!wrapper || !fill) return;

    const stat = SeComp.stats[idx];
    if (!stat || stat.cA === 0) {
        wrapper.classList.add('hidden');
        return;
    }
    wrapper.classList.remove('hidden');
    fill.style.width = Math.min(100, (stat.streak / 5) * 100) + '%';
}

/* Shows/hides controls based on current step and lock state. */
function seUpdateControls() {
    const skipBtn      = document.getElementById('se-comp-skip');
    const undoBtn      = document.getElementById('se-comp-undo');
    const nextBtn      = document.getElementById('se-comp-next');
    const hasHistory   = SeComp.history.length > 0;
    const showNext     = SeComp.step === 'result' && !SeComp.isLocked;

    if (skipBtn) skipBtn.classList.toggle('hidden', SeComp.step !== 'answer');
    if (undoBtn) undoBtn.classList.toggle('hidden', !hasHistory);
    if (nextBtn) nextBtn.classList.toggle('hidden', !showNext);
}

/* --- ENTER COMPETITIVE --- */

/* Called by switchPanelAnimated (via setSerEstarPanel) whenever the competitive
 * panel becomes visible. Builds the button grid and loads the first phrase.
 */
function seEnterCompetitive() {
    // Build a shuffled queue of phrase indices, excluding somos/estamos
    // (no Nosotros column exists in the 5-column button grid)
    if (!SeComp.phraseQueue.length) {
        const available = [];
        allSerEstarPhrases.forEach((phrase, i) => {
            const norm = seNormalizeConjugationKey(phrase[3]);
            const inButtons = SER_CONJS.some(c => seNormalizeConjugationKey(c) === norm)
                           || ESTAR_CONJS.some(c => seNormalizeConjugationKey(c) === norm);
            if (inButtons) available.push(i);
        });
        // Fisher-Yates shuffle
        for (let i = available.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [available[i], available[j]] = [available[j], available[i]];
        }
        SeComp.phraseQueue = available;
        SeComp.queuePos    = 0;
    }

    seBuildAllConjugationButtons();
    seApplyBlockedColumns();
    seResetConjugationButtons();

    SeComp.step        = 'answer';
    SeComp.isLocked    = false;
    SeComp.awaitingNext = false;
    SeComp.currentIndex = SeComp.phraseQueue[SeComp.queuePos] ?? 0;

    seRenderPhrase(SeComp.currentIndex);
    seUpdateControls();
}

/* --- ANSWER HANDLING --- */

/* Handles a conjugation button click.
 * Checks both verb family (SER vs ESTAR) and exact conjugation form.
 */
function seHandleConjClick(conj) {
    if (SeComp.isLocked || SeComp.step !== 'answer') return;

    const idx    = SeComp.currentIndex;
    const phrase = allSerEstarPhrases[idx];
    if (!phrase) return;

    const correctConj = seNormalizeConjugationKey(phrase[3]);
    const chosenConj  = seNormalizeConjugationKey(conj);
    const conjCorrect = (chosenConj === correctConj);

    const correctVerb = (phrase[2] || '').toLowerCase();
    const chosenVerb  = SER_CONJS.some(c => seNormalizeConjugationKey(c) === chosenConj)  ? 'ser'
                      : ESTAR_CONJS.some(c => seNormalizeConjugationKey(c) === chosenConj) ? 'estar'
                      : '';
    const verbCorrect = (chosenVerb === correctVerb);

    // Save undo snapshot before modifying stats
    const stat = seGetPhraseStat(idx);
    SeComp.history.push({ idx, statSnap: { ...stat }, queuePos: SeComp.queuePos });

    stat.vA++;
    stat.cA++;
    if (verbCorrect) stat.vC++;
    if (conjCorrect) { stat.cC++; stat.streak++; } else { stat.streak = 0; }

    // Mark buttons and reveal blank
    seMarkConjugationButtons(phrase[3], conj);
    seRevealBlank(phrase[3], conjCorrect ? 'correct' : 'wrong');

    // Feedback text
    const feedbackEl = document.getElementById('se-comp-feedback');
    if (feedbackEl) {
        if (conjCorrect) {
            feedbackEl.textContent = '✓ Correct!';
            feedbackEl.style.color = '#276749';
        } else {
            feedbackEl.textContent = `✗ The answer was: ${phrase[3]}`;
            feedbackEl.style.color = '#e53e3e';
        }
    }

    seUpdateStreakBar(idx);

    if (conjCorrect) {
        // Auto-advance: show thin progress bar, then load next phrase
        SeComp.isLocked = true;
        SeComp.step     = 'result';
        seUpdateControls();

        const progContainer = document.getElementById('se-comp-progress-container');
        const progBar       = document.getElementById('se-comp-progress-bar');
        const delay = (AppState && AppState.settings && AppState.settings.newWordDelay) || 1000;

        if (progContainer) progContainer.classList.remove('hidden');
        if (progBar) {
            progBar.style.transition = 'none';
            progBar.style.width      = '0%';
            void progBar.offsetWidth;
            progBar.style.transition = `width ${delay / 1000}s linear`;
            progBar.style.width      = '100%';
        }

        SeComp._timer = setTimeout(() => {
            SeComp._timer = null;
            if (progBar)       { progBar.style.transition = 'none'; progBar.style.width = '0%'; }
            if (progContainer) progContainer.classList.add('hidden');
            seAdvancePhrase();
        }, delay);
    } else {
        // Wrong — show Next button, wait for user
        SeComp.step     = 'result';
        SeComp.isLocked = false;
        seUpdateControls();
    }
}

/* Handles the "Don't Know" skip button. Shows the correct answer, then waits. */
function seHandleSkip() {
    if (SeComp.isLocked) return;

    const idx    = SeComp.currentIndex;
    const phrase = allSerEstarPhrases[idx];
    if (!phrase) return;

    const stat = seGetPhraseStat(idx);
    SeComp.history.push({ idx, statSnap: { ...stat }, queuePos: SeComp.queuePos });

    stat.skips++;
    stat.streak = 0;

    seMarkConjugationButtons(phrase[3], '');
    seRevealBlank(phrase[3], 'skip');

    const feedbackEl = document.getElementById('se-comp-feedback');
    if (feedbackEl) {
        feedbackEl.textContent = `The answer was: ${phrase[3]}`;
        feedbackEl.style.color = '#718096';
    }

    SeComp.step = 'result';
    seUpdateControls();
}

/* Advances to the next phrase (called by the Next button after a wrong answer). */
function seLoadNextPhrase() {
    if (SeComp._timer) { clearTimeout(SeComp._timer); SeComp._timer = null; }
    seAdvancePhrase();
}

/* Core advance logic: moves the queue position and loads the next phrase. */
function seAdvancePhrase() {
    SeComp.queuePos++;
    if (SeComp.queuePos >= SeComp.phraseQueue.length) {
        // Reshuffle
        const q = SeComp.phraseQueue.slice();
        for (let i = q.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [q[i], q[j]] = [q[j], q[i]];
        }
        SeComp.phraseQueue = q;
        SeComp.queuePos    = 0;
    }

    SeComp.currentIndex = SeComp.phraseQueue[SeComp.queuePos];
    SeComp.step         = 'answer';
    SeComp.isLocked     = false;
    SeComp.awaitingNext = false;

    seResetConjugationButtons();
    seApplyBlockedColumns();
    seRenderPhrase(SeComp.currentIndex);
    seUpdateControls();
}

/* Undoes the last answered phrase, restoring stats and re-showing the question. */
function seUndoAction() {
    if (!SeComp.history.length) return;
    if (SeComp._timer) { clearTimeout(SeComp._timer); SeComp._timer = null; }

    const last = SeComp.history.pop();
    SeComp.currentIndex    = last.idx;
    SeComp.queuePos        = last.queuePos;
    SeComp.stats[last.idx] = last.statSnap;
    SeComp.step            = 'answer';
    SeComp.isLocked        = false;
    SeComp.awaitingNext    = false;

    const progContainer = document.getElementById('se-comp-progress-container');
    const progBar       = document.getElementById('se-comp-progress-bar');
    if (progBar)       { progBar.style.transition = 'none'; progBar.style.width = '0%'; }
    if (progContainer) progContainer.classList.add('hidden');

    seResetConjugationButtons();
    seApplyBlockedColumns();
    seRenderPhrase(SeComp.currentIndex);
    seUpdateControls();
}

/* --- SECTION / VIEW SWITCHING --- */

/* Switches between the Play and Statistics sub-sections of the competitive panel. */
function seShowSection(section) {
    const playEl  = document.getElementById('se-comp-play');
    const statsEl = document.getElementById('se-comp-stats');
    if (playEl)  playEl.classList.toggle('hidden',  section !== 'play');
    if (statsEl) statsEl.classList.toggle('hidden', section !== 'stats');

    document.querySelectorAll('.se-comp-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
    });

    if (section === 'stats') {
        renderSeStandardStats();
        renderSeStats();
    }
}

/* Switches between Standard and Advanced stats sub-views. */
function seShowStatsView(view) {
    const standardEl = document.getElementById('se-stats-standard');
    const advancedEl = document.getElementById('se-stats-advanced');
    if (standardEl) standardEl.classList.toggle('hidden', view !== 'standard');
    if (advancedEl) advancedEl.classList.toggle('hidden', view !== 'advanced');

    document.querySelectorAll('.se-stats-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.statsview === view);
    });
}

/* --- STATS RENDERING --- */

/* Renders the SER and ESTAR accuracy circles (Standard stats view). */
function renderSeStandardStats() {
    let serTotal = 0, serCorrect = 0, estarTotal = 0, estarCorrect = 0;
    const serBreakdown = {}, estarBreakdown = {};

    allSerEstarPhrases.forEach((phrase, idx) => {
        const stat = SeComp.stats[idx];
        if (!stat || stat.cA === 0) return;

        const verb = (phrase[2] || '').toLowerCase();
        const cat  = seGetPhraseCategory(idx);

        if (verb === 'ser') {
            serTotal   += stat.cA; serCorrect   += stat.cC;
            if (!serBreakdown[cat]) serBreakdown[cat] = { a: 0, c: 0 };
            serBreakdown[cat].a += stat.cA; serBreakdown[cat].c += stat.cC;
        } else {
            estarTotal += stat.cA; estarCorrect += stat.cC;
            if (!estarBreakdown[cat]) estarBreakdown[cat] = { a: 0, c: 0 };
            estarBreakdown[cat].a += stat.cA; estarBreakdown[cat].c += stat.cC;
        }
    });

    seRenderCircle('ser',   serTotal,   serCorrect,   serBreakdown);
    seRenderCircle('estar', estarTotal, estarCorrect, estarBreakdown);
}

/* Renders one accuracy circle (ring SVG + percentage + optional breakdown rows). */
function seRenderCircle(verb, total, correct, breakdown) {
    const pct    = total > 0 ? Math.round((correct / total) * 100) : null;
    const pctEl  = document.getElementById(`se-${verb}-pct`);
    const ringEl = document.getElementById(`se-${verb}-ring`);
    const wrapEl = document.getElementById(`se-${verb}-circle-wrap`);

    if (pctEl)  pctEl.textContent  = pct !== null ? `${pct}%` : '—';
    if (wrapEl) wrapEl.dataset.tooltip = pct !== null ? `${correct}/${total} correct` : 'No attempts yet';

    if (ringEl) {
        const circumference = 2 * Math.PI * 50;
        ringEl.style.strokeDasharray  = circumference;
        ringEl.style.strokeDashoffset = pct !== null
            ? circumference * (1 - pct / 100)
            : circumference;
    }

    const breakdownEl = document.getElementById(`se-${verb}-breakdown`);
    if (!breakdownEl) return;

    if (!SeComp.expandedBreakdowns[verb]) {
        breakdownEl.innerHTML = '';
        return;
    }

    const rows = Object.entries(breakdown).map(([cat, d]) => {
        const p = d.a > 0 ? Math.round((d.c / d.a) * 100) : 0;
        return `<div class="se-breakdown-row"><span>${cat}</span><span>${p}% (${d.c}/${d.a})</span></div>`;
    }).join('');
    breakdownEl.innerHTML = rows || '<div class="se-breakdown-row">No data yet</div>';
}

/* Renders the Advanced stats table, filtered and sorted per SeComp state. */
function renderSeStats() {
    const tbody = document.getElementById('se-stats-body');
    if (!tbody) return;

    const q = (SeComp.searchQuery || '').toLowerCase();

    const rows = allSerEstarPhrases.map((phrase, idx) => {
        const stat = SeComp.stats[idx] || { vA: 0, vC: 0, cA: 0, cC: 0, streak: 0, skips: 0 };
        return {
            phraseText: (phrase[0] || '').replace(/___/g, '___'),
            cat:        seGetPhraseCategory(idx),
            verbPct:    stat.vA > 0 ? Math.round((stat.vC / stat.vA) * 100) : null,
            conjPct:    stat.cA > 0 ? Math.round((stat.cC / stat.cA) * 100) : null,
            streak:     stat.streak,
            attempts:   stat.cA,
            skips:      stat.skips,
        };
    });

    const filtered = q
        ? rows.filter(r => r.phraseText.toLowerCase().includes(q) || r.cat.toLowerCase().includes(q))
        : rows;

    const col = SeComp.sortCol || 'attempts';
    const dir = SeComp.sortDir === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
        let va, vb;
        switch (col) {
            case 'phrase':    va = a.phraseText;         vb = b.phraseText;         break;
            case 'category':  va = a.cat;                vb = b.cat;                break;
            case 'verb_pct':  va = a.verbPct ?? -1;      vb = b.verbPct ?? -1;      break;
            case 'conj_pct':  va = a.conjPct ?? -1;      vb = b.conjPct ?? -1;      break;
            case 'streak':    va = a.streak;              vb = b.streak;             break;
            case 'skip':      va = a.skips;               vb = b.skips;              break;
            default:          va = a.attempts;            vb = b.attempts;           break;
        }
        if (typeof va === 'string') return dir * va.localeCompare(vb);
        return dir * (va - vb);
    });

    tbody.innerHTML = filtered.slice(0, 300).map(r => `
        <tr>
            <td>${r.phraseText}</td>
            <td>${r.cat}</td>
            <td>${r.verbPct !== null ? r.verbPct + '%' : '—'}</td>
            <td>${r.conjPct !== null ? r.conjPct + '%' : '—'}</td>
            <td>${r.streak}</td>
            <td>${r.attempts}</td>
            <td>${r.skips}</td>
        </tr>
    `).join('');
}
