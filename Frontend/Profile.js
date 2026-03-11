/**
 * Profile.js - Logic for the Profile page
 */

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('nav button');
    const sections = document.querySelectorAll('main > div > div, aside > div'); // Simplified selector for sections

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab style
            tabs.forEach(t => {
                t.classList.remove('border-b-2', 'border-white', 'text-white');
                t.classList.add('text-[#A0A0A0]');
            });
            tab.classList.add('border-b-2', 'border-white', 'text-white');
            tab.classList.remove('text-[#A0A0A0]');

            const tabName = tab.textContent.trim().toLowerCase();
            if (tabName === 'yo') {
                alert('Showing Posts section');
                // Normally you would filter elements here
            } else if (tabName === 'acerca de mí') {
                alert('Showing About section');
            } else if (tabName === 'logros') {
                window.location.href = 'Archivenments.html';
            }
        });
    });

    // Profile buttons
    const profileButtons = document.querySelectorAll('main section button');
    profileButtons.forEach(btn => {
        if (btn.textContent.trim() === 'Seguír' || btn.textContent.trim() === 'Seguir') {
            btn.addEventListener('click', () => {
                const isFollowing = btn.getAttribute('data-following') === 'true';
                if (isFollowing) {
                    btn.textContent = 'Seguir';
                    btn.classList.remove('bg-slate-200');
                    btn.classList.add('bg-white');
                    btn.setAttribute('data-following', 'false');
                } else {
                    btn.textContent = 'Siguiendo';
                    btn.classList.toggle('bg-white');
                    btn.classList.add('bg-slate-200');
                    btn.setAttribute('data-following', 'true');
                }
            });
        } else if (btn.textContent.trim() === 'Mensaje') {
            btn.addEventListener('click', () => alert('Direct messages not yet available'));
        }
    });
});
