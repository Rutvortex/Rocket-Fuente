/**
 * VideoPlayer.js - Consolidated logic for LargePlayer, LivePlayer, and ShortPlayer Hub.
 */

document.addEventListener('DOMContentLoaded', () => {
    // === SHARED / GLOBAL ELEMENTS ===
    const sharedSearch = document.getElementById('search-large-player') || 
                         document.getElementById('search-live-player') || 
                         document.getElementById('search-short-player');
    
    if (sharedSearch) {
        sharedSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') alert(`Searching for: ${sharedSearch.value}`);
        });
    }

    const notifyBtn = document.getElementById('btn-notifications-large') || 
                       document.getElementById('btn-notifications-live');
    if (notifyBtn) notifyBtn.addEventListener('click', () => alert('Showing notifications...'));

    // === LARGE PLAYER LOGIC ===
    const playPauseBtnLarge = document.getElementById('btn-play-pause-large');
    const centralPlayBtnLarge = document.getElementById('btn-central-play-large');
    
    function togglePlayLarge() {
        const icon = playPauseBtnLarge?.querySelector('.material-symbols-outlined') || 
                     centralPlayBtnLarge?.querySelector('.material-symbols-outlined');
        if (icon) {
            if (icon.textContent === 'play_arrow') {
                icon.textContent = 'pause';
                alert('Video playing...');
            } else {
                icon.textContent = 'play_arrow';
                alert('Video paused.');
            }
        }
    }

    if (playPauseBtnLarge) playPauseBtnLarge.addEventListener('click', togglePlayLarge);
    if (centralPlayBtnLarge) centralPlayBtnLarge.addEventListener('click', togglePlayLarge);

    const progressBarLarge = document.getElementById('progress-bar-large');
    if (progressBarLarge) {
        progressBarLarge.addEventListener('click', (e) => {
            const rect = progressBarLarge.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const filledPart = progressBarLarge.querySelector('.bg-white');
            const handle = progressBarLarge.querySelector('.absolute.size-3');
            if (filledPart) filledPart.style.width = (pos * 100) + '%';
            if (handle) handle.style.left = (pos * 100) + '%';
            alert(`Seeking to ${(pos * 100).toFixed(0)}%`);
        });
    }

    const volumeBarLarge = document.getElementById('volume-bar-large');
    if (volumeBarLarge) {
        volumeBarLarge.addEventListener('click', (e) => {
            const rect = volumeBarLarge.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const filledPart = volumeBarLarge.querySelector('.bg-white');
            if (filledPart) filledPart.style.width = (pos * 100) + '%';
            alert(`Volume set to ${(pos * 100).toFixed(0)}%`);
        });
    }

    // Commenting Logic (Large)
    const commentAreaLarge = document.getElementById('comment-textarea-large');
    const postCommentBtnLarge = document.getElementById('btn-post-comment-large');
    const cancelCommentBtnLarge = document.getElementById('btn-cancel-comment-large');

    if (commentAreaLarge && postCommentBtnLarge) {
        commentAreaLarge.addEventListener('input', () => {
            if (commentAreaLarge.value.trim() !== '') {
                postCommentBtnLarge.classList.remove('opacity-50', 'cursor-not-allowed');
                postCommentBtnLarge.classList.add('bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900');
            } else {
                postCommentBtnLarge.classList.add('opacity-50', 'cursor-not-allowed');
                postCommentBtnLarge.classList.remove('bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900');
            }
        });

        postCommentBtnLarge.addEventListener('click', () => {
            if (commentAreaLarge.value.trim() !== '') {
                alert(`Comment posted: ${commentAreaLarge.value}`);
                commentAreaLarge.value = '';
                postCommentBtnLarge.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });

        if (cancelCommentBtnLarge) {
            cancelCommentBtnLarge.addEventListener('click', () => {
                commentAreaLarge.value = '';
                postCommentBtnLarge.classList.add('opacity-50', 'cursor-not-allowed');
            });
        }
    }

    // === LIVE PLAYER LOGIC ===
    const playBtnLive = document.getElementById('btn-play-live');
    if (playBtnLive) {
        playBtnLive.addEventListener('click', () => {
            const icon = playBtnLive.querySelector('.material-symbols-outlined');
            if (icon.textContent === 'play_arrow') {
                icon.textContent = 'pause';
                alert('Live stream playing...');
            } else {
                icon.textContent = 'play_arrow';
                alert('Live stream paused.');
            }
        });
    }

    const chatInputLive = document.getElementById('chat-input-live');
    const sendBtnLive = document.getElementById('btn-send-chat-live');
    const chatContainerLive = document.querySelector('.overflow-y-auto');

    function sendChatMessageLive() {
        if (chatInputLive && chatContainerLive) {
            const text = chatInputLive.value.trim();
            if (text !== '') {
                const msgDiv = document.createElement('div');
                msgDiv.className = 'flex gap-3';
                msgDiv.innerHTML = `
                    <div class="h-8 w-8 shrink-0 rounded-full bg-slate-700"></div>
                    <div class="flex flex-col">
                        <span class="text-xs font-bold text-slate-500">@You</span>
                        <p class="text-sm text-slate-700 dark:text-slate-300">${text}</p>
                    </div>
                `;
                chatContainerLive.appendChild(msgDiv);
                chatInputLive.value = '';
                chatContainerLive.scrollTop = chatContainerLive.scrollHeight;
            }
        }
    }

    if (sendBtnLive) sendBtnLive.addEventListener('click', sendChatMessageLive);
    if (chatInputLive) {
        chatInputLive.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessageLive();
        });
    }

    // === SHORT PLAYER (HUB) LOGIC ===
    const filterRecommended = document.getElementById('btn-filter-recommended');
    const filterNew = document.getElementById('btn-filter-new');

    if (filterRecommended && filterNew) {
        const toggleFilters = (active, inactive) => {
            active.classList.add('bg-slate-900', 'dark:bg-slate-100', 'text-white', 'dark:text-slate-900');
            active.classList.remove('bg-slate-100', 'dark:bg-slate-900', 'text-slate-500', 'dark:text-slate-400');
            
            inactive.classList.remove('bg-slate-900', 'dark:bg-slate-100', 'text-white', 'dark:text-slate-900');
            inactive.classList.add('bg-slate-100', 'dark:bg-slate-900', 'text-slate-500', 'dark:text-slate-400');
        };

        filterRecommended.addEventListener('click', () => {
            toggleFilters(filterRecommended, filterNew);
            alert('Filtering by Recommended content...');
        });

        filterNew.addEventListener('click', () => {
            toggleFilters(filterNew, filterRecommended);
            alert('Filtering by New content...');
        });
    }

    const showMoreStreamsBtn = document.getElementById('btn-show-more-streams');
    if (showMoreStreamsBtn) {
        showMoreStreamsBtn.addEventListener('click', () => {
            showMoreStreamsBtn.textContent = 'Loading...';
            setTimeout(() => {
                alert('More streams loaded!');
                showMoreStreamsBtn.textContent = 'Show More Streams';
            }, 1000);
        });
    }

    // === INTERACTION BUTTONS (SHARED CLASSES OR IDs) ===
    const followBtns = [
        document.getElementById('btn-follow-creator-large'),
        document.getElementById('btn-follow-creator-live')
    ];

    followBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (btn.textContent.trim() === 'Follow') {
                    btn.textContent = 'Following';
                    btn.classList.add('opacity-70');
                } else {
                    btn.textContent = 'Follow';
                    btn.classList.remove('opacity-70');
                }
            });
        }
    });

    const rateBtns = [
        document.getElementById('btn-rate-large'),
        document.getElementById('btn-rate-live')
    ];
    rateBtns.forEach(btn => { if (btn) btn.addEventListener('click', () => alert('Opening rating...')); });

    const shareBtns = [
        document.getElementById('btn-share-large'),
        document.getElementById('btn-share-live')
    ];
    shareBtns.forEach(btn => { if (btn) btn.addEventListener('click', () => alert('Opening share options...')); });

    const saveBtns = [
        document.getElementById('btn-save-large'),
        document.getElementById('btn-bookmark-live')
    ];
    saveBtns.forEach(btn => { if (btn) btn.addEventListener('click', () => alert('Saved to library!')); });
});
