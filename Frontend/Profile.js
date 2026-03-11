/**
 * Profile.js - Logic for the Profile page
 */

document.addEventListener('DOMContentLoaded', () => {
    // Tab switching logic
    const tabIds = ['tab-posts', 'tab-about', 'tab-achievements'];
    const tabs = tabIds.map(id => document.getElementById(id)).filter(el => el);

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('border-b-2', 'border-white', 'text-white', 'font-bold');
                t.classList.add('text-[#A0A0A0]', 'font-medium');
            });
            tab.classList.add('border-b-2', 'border-white', 'text-white', 'font-bold');
            tab.classList.remove('text-[#A0A0A0]', 'font-medium');

            const id = tab.id;
            if (id === 'tab-posts') {
                console.log('Showing Posts');
            } else if (id === 'tab-about') {
                console.log('Showing About');
            } else if (id === 'tab-achievements') {
                window.location.href = 'Archivenments.html';
            }
        });
    });

    // Profile Actions
    const followBtn = document.getElementById('btn-follow-profile');
    const messageBtn = document.getElementById('btn-message-profile');
    const moreBtn = document.getElementById('btn-more-options-profile');

    if (followBtn) {
        followBtn.addEventListener('click', () => {
            const isFollowing = followBtn.getAttribute('data-following') === 'true';
            if (isFollowing) {
                followBtn.textContent = 'Seguir';
                followBtn.classList.remove('bg-slate-200');
                followBtn.classList.add('bg-white');
                followBtn.setAttribute('data-following', 'false');
            } else {
                followBtn.textContent = 'Siguiendo';
                followBtn.classList.remove('bg-white');
                followBtn.classList.add('bg-slate-200');
                followBtn.setAttribute('data-following', 'true');
            }
        });
    }

    if (messageBtn) {
        messageBtn.addEventListener('click', () => alert('Direct messages interface would open here.'));
    }

    if (moreBtn) {
        moreBtn.addEventListener('click', () => alert('Showing more profile options...'));
    }

    // Header buttons
    const searchBtn = document.getElementById('btn-search-profile');
    const notifyBtn = document.getElementById('btn-notifications-profile');

    if (searchBtn) searchBtn.addEventListener('click', () => alert('Search profile content...'));
    if (notifyBtn) notifyBtn.addEventListener('click', () => alert('Showing profile notifications...'));

    // Achievements Section
    const viewAllBadgesBtn = document.getElementById('btn-view-all-badges');
    if (viewAllBadgesBtn) {
        viewAllBadgesBtn.addEventListener('click', () => {
            window.location.href = 'Archivenments.html';
        });
    };
});
