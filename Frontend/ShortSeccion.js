/**
 * ShortSeccion.js - Logic for the Shorts Trending/Section page
 */

document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.querySelector('button:has(.material-symbols-outlined:contains("play_arrow"))');
    const videoImg = document.querySelector('.video-container img');
    
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            const icon = playBtn.querySelector('.material-symbols-outlined');
            if (icon.textContent === 'play_arrow') {
                icon.textContent = 'pause';
                alert('Video playing...');
            } else {
                icon.textContent = 'play_arrow';
                alert('Video paused.');
            }
        });
    }

    const followBtn = document.querySelector('button:contains("Follow")');
    if (followBtn) {
        followBtn.addEventListener('click', () => {
            if (followBtn.textContent === 'Follow') {
                followBtn.textContent = 'Following';
                followBtn.classList.add('bg-slate-200', 'text-slate-900');
                followBtn.classList.remove('text-white');
            } else {
                followBtn.textContent = 'Follow';
                followBtn.classList.remove('bg-slate-200', 'text-slate-900');
                followBtn.classList.add('text-white');
            }
        });
    }

    const actionBtns = document.querySelectorAll('main div.flex-col > div > button');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const icon = btn.querySelector('.material-symbols-outlined')?.textContent;
            const count = btn.parentElement.querySelector('span')?.textContent;
            alert(`${icon} action performed. Current count: ${count}`);
        });
    });
});
