/* =============================================================================
   modules/init.js
   App bootstrap: DOMContentLoaded and beforeunload handlers.
   Must be the last module loaded.
   ============================================================================= */

window.addEventListener('DOMContentLoaded', () => {
    loadDataFromLocalStorage();
    loadAudioSettings();
    loadDebugSettings();
    loadGrid();
    loadGridContent();
    userControls();
    loadStatsPage();
    loadPractice();
    loadBackgroundParticles();

    // Ensure animation preset is applied on load
    document.documentElement.dataset.animPreset = '1';

    // Close bundle filter menu on outside click
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('bundle-filter-menu');
        const btn  = document.getElementById('btn-bundle-filter');
        if (menu && !menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== btn) {
            menu.classList.add('hidden');
        }
    });

    loadStatsSorting();

    // Fade in welcome screen first
    setTimeout(() => UI.welcome.classList.add('fade-in'), 10);
});

window.addEventListener('beforeunload', () => {
    saveData();
});
