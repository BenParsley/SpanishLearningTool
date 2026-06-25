/* =============================================================================
   modules/para-por.js
   Panel-switch helper for the PARA / POR grammar view.
   ============================================================================= */

function setParaPorPanel(panelId, instant = false) {
    const validPanels  = ['pp-competitive'];
    const normalizedId = validPanels.includes(panelId) ? panelId : 'pp-practice';
    const currentPanel = document.querySelector('.pp-panel:not(.hidden)');
    const nextPanel    = document.getElementById(normalizedId);

    document.querySelectorAll('.pp-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.panel === normalizedId);
    });

    // Animation handled by animations.js — switchPanelAnimated
    switchPanelAnimated({
        allPanels:    document.querySelectorAll('.pp-panel'),
        currentPanel,
        nextPanel,
        instant,
        onEnter: null
    });

    updateCurrentSectionDisplay(normalizedId);
}
