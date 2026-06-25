/* =============================================================================
   modules/practice.js
   Practice mode — start, resume, progress tracking, next-target selection,
   skip, reset, save/clear, grid shuffle, and grid render.
   ============================================================================= */

function startPracticeMode(direction) {
    if (!AppState.words || AppState.words.length === 0) return;

    AppState.practiceDirection = direction;
    AppState.practiceMatched.clear();
    AppState.practiceSkipped.clear();
    AppState.practiceSearch = '';
    AppState.practiceOrder = AppState.words.map((_, i) => i);
    if (UI.practiceSearch) UI.practiceSearch.value = '';

    UI.practiceModeSelection.classList.add('hidden');
    UI.practiceGameArea.classList.remove('hidden');
    UI.btnResetPractice.classList.remove('hidden');
    updatePracticeProgress();

    // Entry animation
    const speed    = getAnimationSpeed();
    const durMult  = getAnimDurMult();
    const easing   = getAnimEasing();
    const duration = 0.4 * durMult / speed;

    const questionArea = document.getElementById('practice-question-area');
    const grid         = document.getElementById('practice-options-grid');

    questionArea.style.opacity   = '0';
    questionArea.style.transform = 'translateY(-20px)';
    grid.style.opacity           = '0';
    grid.style.transform         = 'translateY(20px)';

    requestAnimationFrame(() => {
        questionArea.style.transition = `opacity ${duration}s ${easing}, transform ${duration}s ${easing}`;
        questionArea.style.opacity    = '1';
        questionArea.style.transform  = 'translateY(0)';

        setTimeout(() => {
            grid.style.transition = `opacity ${duration}s ${easing}, transform ${duration}s ${easing}`;
            grid.style.opacity    = '1';
            grid.style.transform  = 'translateY(0)';
        }, 200 * durMult / speed);
    });

    renderPracticeGrid();
    shufflePracticeGrid();
    pickNextPracticeTarget();
    savePracticeProgress();
}

function hasSavedPracticeProgress() {
    const saved = localStorage.getItem('practiceProgress');
    if (!saved) return false;
    try {
        const data = JSON.parse(saved);
        return data.bundleId === AppState.currentBundleId;
    } catch (e) { return false; }
}

function resumePracticeMode() {
    const saved = localStorage.getItem('practiceProgress');
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        if (data.bundleId !== AppState.currentBundleId) return;

        AppState.practiceDirection   = data.direction;
        AppState.practiceMatched     = new Set(data.matched);
        AppState.practiceSkipped     = new Set(data.skipped);
        AppState.practiceWrongGuesses = new Set(data.wrong);
        AppState.practiceWordIndex   = data.currentIndex;
        AppState.practiceOrder       = data.order || AppState.words.map((_, i) => i);

        UI.practiceModeSelection.classList.add('hidden');
        UI.practiceGameArea.classList.remove('hidden');
        UI.btnResetPractice.classList.remove('hidden');
        updatePracticeProgress();

        const targetWord = AppState.words[AppState.practiceWordIndex];
        if (targetWord) {
            if (AppState.practiceDirection === 'en-to-es') {
                UI.practiceWord.innerText = targetWord.en;
                UI.practiceAudio.classList.add('hidden');
                AppState.practiceSpanishPrompt = null;
            } else {
                AppState.practiceSpanishPrompt = pickRandomAlternative(targetWord.es_alts, targetWord.es);
                UI.practiceWord.innerText = AppState.practiceSpanishPrompt;
                UI.practiceAudio.classList.remove('hidden');
            }
        } else {
            pickNextPracticeTarget();
        }

        renderPracticeGrid();
    } catch (e) { console.error('Failed to resume practice', e); }
}

function updatePracticeProgress() {
    if (!AppState.words) return;
    const total   = AppState.words.length;
    const matched = AppState.practiceMatched.size;
    const pct     = total > 0 ? (matched / total) * 100 : 0;
    if (UI.practiceProgressFill) UI.practiceProgressFill.style.width = `${pct}%`;
    if (UI.practiceProgressText) UI.practiceProgressText.innerText   = `${matched} / ${total}`;
}

function pickNextPracticeTarget() {
    AppState.practiceWrongGuesses.clear();

    const allSquares = UI.practiceGrid.querySelectorAll('.word-square.incorrect-gray');
    allSquares.forEach(el => el.classList.remove('incorrect-gray'));

    const availableIndices = AppState.words
        .map((_, idx) => idx)
        .filter(idx => !AppState.practiceMatched.has(idx));

    if (availableIndices.length === 0) {
        UI.practiceWord.innerText = 'All words matched!';
        UI.practiceAudio.classList.add('disabled-audio');
        clearPracticeProgress();
        return;
    }

    let pool = availableIndices.filter(idx => !AppState.practiceSkipped.has(idx));
    if (pool.length === 0) {
        AppState.practiceSkipped.clear();
        pool = availableIndices;
    }

    const randomIndex  = pool[Math.floor(Math.random() * pool.length)];
    AppState.practiceWordIndex = randomIndex;
    const targetWord   = AppState.words[randomIndex];

    if (AppState.practiceDirection === 'en-to-es') {
        AppState.practiceSpanishPrompt = null;
        UI.practiceWord.innerText = targetWord.en;
        UI.practiceAudio.classList.add('hidden');
    } else {
        AppState.practiceSpanishPrompt = pickRandomAlternative(targetWord.es_alts, targetWord.es);
        UI.practiceWord.innerText = AppState.practiceSpanishPrompt;
        UI.practiceAudio.classList.remove('hidden');
        speakSpanish(AppState.practiceSpanishPrompt);
    }

    savePracticeProgress();
}

function skipPracticeWord() {
    if (AppState.practiceWordIndex === null) return;
    AppState.practiceSkipped.add(AppState.practiceWordIndex);

    const word = AppState.words[AppState.practiceWordIndex];
    word.p_skip     = (word.p_skip     || 0) + 1;
    word.p_attempts = (word.p_attempts || 0) + 1;

    sessionActionCount++;
    checkSessionMilestones();
    pickNextPracticeTarget();
}

function resetPracticeProgress() {
    if (confirm('Reset current practice session?')) {
        clearPracticeProgress();
        UI.practiceGameArea.classList.add('hidden');
        UI.btnResetPractice.classList.add('hidden');
        UI.practiceModeSelection.classList.remove('hidden');
    }
}

function savePracticeProgress() {
    if (!AppState.currentBundleId) return;
    const data = {
        bundleId:     AppState.currentBundleId,
        direction:    AppState.practiceDirection,
        matched:      Array.from(AppState.practiceMatched),
        skipped:      Array.from(AppState.practiceSkipped),
        wrong:        Array.from(AppState.practiceWrongGuesses),
        currentIndex: AppState.practiceWordIndex,
        order:        AppState.practiceOrder
    };
    localStorage.setItem('practiceProgress', JSON.stringify(data));
}

function clearPracticeProgress() {
    localStorage.removeItem('practiceProgress');
}

function shufflePracticeGrid() {
    const grid         = UI.practiceGrid;
    const speed        = getAnimationSpeed();
    const durMult      = getAnimDurMult();
    const easing       = getAnimEasing();
    const flyInDuration  = 0.4 * durMult / speed;
    const flyOutDuration = 0.3 * durMult / speed;
    const rowDelay     = 100 * durMult / speed;

    const children = Array.from(grid.children);
    if (children.length === 0) return;

    grid.style.overflowY = 'hidden';
    grid.style.overflowX = 'hidden';
    grid.scrollTop = 0;

    const gridRect    = grid.getBoundingClientRect();
    const gridCenterX = gridRect.width  / 2;
    const gridCenterY = gridRect.height / 2;

    children.forEach(child => {
        const rect        = child.getBoundingClientRect();
        const childCenterX = (rect.left - gridRect.left) + rect.width  / 2;
        const childCenterY = (rect.top  - gridRect.top)  + rect.height / 2;
        const tx = gridCenterX - childCenterX;
        const ty = gridCenterY - childCenterY;

        child.style.transition = `transform ${flyInDuration}s ${easing}, opacity ${flyInDuration}s ${easing}`;
        child.style.transform  = `translate(${tx}px, ${ty}px) scale(0.1)`;
        child.style.opacity    = '0';
        child.style.zIndex     = '10';
    });

    setTimeout(() => {
        const unmatched = [];
        const matched   = [];
        Array.from(grid.children).forEach(child => {
            if (child.classList.contains('matched')) matched.push(child);
            else unmatched.push(child);
        });

        const shuffle = arr => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        };

        shuffle(unmatched);
        shuffle(matched);
        unmatched.forEach(child => grid.appendChild(child));
        matched.forEach(child   => grid.appendChild(child));

        AppState.practiceOrder = Array.from(grid.children).map(child => parseInt(child.dataset.index));
        savePracticeProgress();

        const shuffledChildren = Array.from(grid.children);
        shuffledChildren.forEach(child => {
            child.style.transition = 'none';
            child.style.transform  = 'scale(0)';
            child.style.opacity    = '0';
        });

        void grid.offsetWidth;

        let currentRowY    = -10000;
        let currentRowIndex = -1;
        const rows = new Map();

        shuffledChildren.forEach(child => {
            if (child.offsetTop > currentRowY + 10) {
                currentRowY = child.offsetTop;
                currentRowIndex++;
            }
            if (!rows.has(currentRowIndex)) rows.set(currentRowIndex, []);
            rows.get(currentRowIndex).push(child);
        });

        rows.forEach((rowChildren, rIndex) => {
            const delay = rIndex * rowDelay;
            rowChildren.forEach(child => {
                setTimeout(() => {
                    child.style.transition = `transform ${flyOutDuration}s ${easing}, opacity ${flyOutDuration}s ${easing}`;
                    child.style.transform  = 'scale(1)';
                    child.style.opacity    = '1';
                    child.style.zIndex     = '';
                }, delay);
            });
        });

        const totalTime = (currentRowIndex * rowDelay) + (flyOutDuration * 1000);
        setTimeout(() => { grid.style.overflowY = ''; }, totalTime);

    }, flyInDuration * 1000);
}

function renderPracticeGrid() {
    UI.practiceGrid.innerHTML = '';

    let displayItems = AppState.words.map((word, index) => ({ word, index }));
    const orderMap   = new Map(AppState.practiceOrder.map((idx, i) => [idx, i]));

    displayItems.sort((a, b) => {
        const term = AppState.practiceSearch;

        if (term) {
            const aMatch = a.word.en.toLowerCase().includes(term) || a.word.es.toLowerCase().includes(term);
            const bMatch = b.word.en.toLowerCase().includes(term) || b.word.es.toLowerCase().includes(term);
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
        }

        const aMatched = AppState.practiceMatched.has(a.index);
        const bMatched = AppState.practiceMatched.has(b.index);
        if (!aMatched &&  bMatched) return -1;
        if ( aMatched && !bMatched) return  1;

        const posA = orderMap.has(a.index) ? orderMap.get(a.index) : a.index;
        const posB = orderMap.has(b.index) ? orderMap.get(b.index) : b.index;
        return posA - posB;
    });

    displayItems.forEach(({ word, index }) => {
        const term    = AppState.practiceSearch;
        const isDimmed = term && !word.en.toLowerCase().includes(term) && !word.es.toLowerCase().includes(term);

        const div = document.createElement('div');
        div.className     = 'word-square';
        div.dataset.index = index;
        if (isDimmed) div.classList.add('search-dimmed');

        const displayText = AppState.practiceDirection === 'en-to-es' ? word.es : word.en;
        let htmlContent = displayText;
        if (term) {
            htmlContent = displayText.replace(
                new RegExp(`(${term})`, 'gi'),
                '<span class="highlight-text">$1</span>'
            );
        }
        div.innerHTML = `<strong>${htmlContent}</strong>`;

        if (term &&
            displayText.toLowerCase() === term &&
            !AppState.practiceMatched.has(index) &&
            !AppState.practiceWrongGuesses.has(index)) {
            div.classList.add('exact-match');
        }

        if (AppState.practiceMatched.has(index))    div.classList.add('matched');
        if (AppState.practiceWrongGuesses.has(index)) div.classList.add('incorrect-gray');

        div.addEventListener('click', () => {
            if (AppState.practiceMatched.has(index)) {
                // Flip card to show alternate translation
                const flipDur    = getScaledDuration(300);
                const flipEasing = getAnimEasing();
                div.style.transition = `transform ${flipDur / 1000}s ${flipEasing}`;
                div.style.transform  = 'perspective(600px) rotateY(90deg)';

                setTimeout(() => {
                    const currentText = div.querySelector('strong').innerText;
                    const altText     = (currentText === word.en) ? word.es : word.en;
                    let html = altText;
                    if (term) {
                        html = altText.replace(new RegExp(`(${term})`, 'gi'), '<span class="highlight-text">$1</span>');
                    }
                    div.innerHTML = `<strong>${html}</strong>`;

                    div.style.transition = 'none';
                    div.style.transform  = 'perspective(600px) rotateY(-90deg)';
                    void div.offsetWidth;

                    div.style.transition = `transform ${flipDur / 1000}s ${flipEasing}`;
                    div.style.transform  = 'perspective(600px) rotateY(0deg)';

                    setTimeout(() => {
                        div.style.transition = '';
                        div.style.transform  = '';
                    }, flipDur);
                }, flipDur);
                return;
            }

            if (AppState.practiceWrongGuesses.has(index)) return;

            if (index === AppState.practiceWordIndex) {
                div.classList.add('matched');
                AppState.practiceMatched.add(index);

                word.p_correct  = (word.p_correct  || 0) + 1;
                word.p_attempts = (word.p_attempts || 0) + 1;
                word.p_streak   = AppState.practiceWrongGuesses.has(index) ? 0 : (word.p_streak || 0) + 1;

                updatePracticeProgress();
                playSuccessSound();

                if (AppState.practiceDirection === 'en-to-es') speakSpanish(word.es);

                if (AppState.practiceSearch) {
                    AppState.practiceSearch = '';
                    if (UI.practiceSearch) UI.practiceSearch.value = '';
                    renderPracticeGrid();
                }

                sessionActionCount++;
                checkSessionMilestones();
                savePracticeProgress();
                pickNextPracticeTarget();
            } else {
                AppState.practiceWrongGuesses.add(index);

                const targetWord = AppState.words[AppState.practiceWordIndex];
                targetWord.p_wrong  = (targetWord.p_wrong  || 0) + 1;
                targetWord.p_streak = 0;

                div.classList.add('wrong-shake', 'incorrect-gray');
                setTimeout(() => div.classList.remove('wrong-shake'), 500);
                sessionActionCount++;
                checkSessionMilestones();
                savePracticeProgress();
            }
        });

        UI.practiceGrid.appendChild(div);
    });
}
