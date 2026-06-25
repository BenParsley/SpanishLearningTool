/* =============================================================================
   modules/aqui-alla.js
   Word-card highlight helper and panel-switch helper for the
   AQUÍ / ALLÁ grammar view.
   ============================================================================= */

function highlightAqWord(word) {
    const card = document.querySelector(`[data-aq-word="${word}"]`);
    if (!card) return;

    document.querySelectorAll('.aq-word-card').forEach(c => {
        c.classList.remove('aq-highlight', 'aq-highlight-fade');
        clearTimeout(c._aqHighlightTimer);
    });

    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    card.classList.add('aq-highlight');

    card._aqHighlightTimer = setTimeout(() => {
        card.classList.remove('aq-highlight');
        card.classList.add('aq-highlight-fade');
        card._aqHighlightTimer = setTimeout(() => {
            card.classList.remove('aq-highlight-fade');
        }, 1000);
    }, 4000);
}

function setAquiAllaPanel(panelId, instant = false) {
    const validPanels  = ['aq-competitive'];
    const normalizedId = validPanels.includes(panelId) ? panelId : 'aq-practice';
    const currentPanel = document.querySelector('.aq-panel:not(.hidden)');
    const nextPanel    = document.getElementById(normalizedId);

    document.querySelectorAll('.aq-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.panel === normalizedId);
    });

    // Animation handled by animations.js — switchPanelAnimated
    switchPanelAnimated({
        allPanels:    document.querySelectorAll('.aq-panel'),
        currentPanel,
        nextPanel,
        instant,
        onEnter: null
    });

    updateCurrentSectionDisplay(normalizedId);
}
