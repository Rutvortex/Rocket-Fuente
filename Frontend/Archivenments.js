/**
 * Archivenments.js - Logic for the Achievements page
 */

document.addEventListener('DOMContentLoaded', () => {
    const categoryBtns = document.querySelectorAll('main > div.flex-wrap > button');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => {
                b.classList.remove('bg-slate-900', 'dark:bg-slate-100', 'text-slate-100', 'dark:text-slate-900');
                b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
            });
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
