/**
 * LargePlayer.js - Logic for the Long-form Video Player page
 */

document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.querySelector('.absolute.bottom-0 .material-symbols-outlined:contains("play_arrow")')?.parentElement;
    const centralPlayBtn = document.querySelector('button:has(.material-symbols-outlined.text-5xl)');
    
    function togglePlay() {
        const icon = playBtn?.querySelector('.material-symbols-outlined') || centralPlayBtn?.querySelector('.material-symbols-outlined');
        if (icon.textContent === 'play_arrow') {
            icon.textContent = 'pause';
            alert('Video playing...');
        } else {
            icon.textContent = 'play_arrow';
            alert('Video paused.');
        }
    }

    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (centralPlayBtn) centralPlayBtn.addEventListener('click', togglePlay);

    const progressBar = document.querySelector('.relative.h-1\\.5.w-full');
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            progressBar.querySelector('.bg-white').style.width = (pos * 100) + '%';
            progressBar.querySelector('.left-\\[45\\%\\]').style.left = (pos * 100) + '%';
            alert(`Seeking to ${(pos * 100).toFixed(0)}%`);
        });
    }

    const volumeBar = document.querySelector('.group\\/vol .w-16');
    if (volumeBar) {
        volumeBar.addEventListener('click', (e) => {
            const rect = volumeBar.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            volumeBar.querySelector('.bg-white').style.width = (pos * 100) + '%';
            alert(`Volume set to ${(pos * 100).toFixed(0)}%`);
        });
    }

    const starBtn = document.querySelector('.flex.items-center.gap-1\\.5.bg-slate-100');
    if (starBtn) {
        starBtn.addEventListener('click', () => {
            alert('Opening rating interface...');
        });
    }

    const commentArea = document.querySelector('textarea');
    const commentBtnArr = document.querySelectorAll('main div.flex.justify-end.gap-3 button');
    let commentBtn;
    commentBtnArr.forEach(b => { if (b.textContent.trim() === 'Comment') commentBtn = b; });

    if (commentArea && commentBtn) {
        commentArea.addEventListener('input', () => {
            if (commentArea.value.trim() !== '') {
                commentBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                commentBtn.classList.add('bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900');
            } else {
                commentBtn.classList.add('opacity-50', 'cursor-not-allowed');
                commentBtn.classList.remove('bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900');
            }
        });

        commentBtn.addEventListener('click', () => {
            if (commentArea.value.trim() !== '') {
                alert(`Comment posted: ${commentArea.value}`);
                commentArea.value = '';
                commentBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });
    }
});
