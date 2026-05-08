/**
 * Archivenments.js - Logic for the Achievements page
 */

document.addEventListener('DOMContentLoaded', () => {
    // Header Buttons
    const searchBtn = document.getElementById('btn-search-achievements');
    const settingsBtn = document.getElementById('btn-settings-achievements');

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            alert('Search achievements feature coming soon!');
        });
    }

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            window.location.href = 'Config.html';
        });
    }

    // Category Filtering
    const categoryIds = ['filter-all', 'filter-social', 'filter-content', 'filter-security', 'filter-events'];
    const categoryBtns = categoryIds.map(id => document.getElementById(id)).filter(el => el);

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Reset all buttons
            categoryBtns.forEach(b => {
                b.classList.remove('bg-slate-900', 'dark:bg-slate-100', 'text-slate-100', 'dark:text-slate-900');
                b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
            });
            // Highlight selected
            btn.classList.add('bg-slate-900', 'dark:bg-slate-100', 'text-slate-100', 'dark:text-slate-900');
            btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
            
            alert(`Filtering by: ${btn.textContent.trim()}`);
        });
    });

    const badges = document.querySelectorAll('.grid > div');
    badges.forEach(badge => {
        badge.addEventListener('click', () => {
            const title = badge.querySelector('h4')?.textContent || 'Badge';
            const desc = badge.querySelector('p')?.textContent || 'Description';
            alert(`${title}: ${desc}`);
        });
    });
});
