/**
 * DMI.js - Logic for the Community/Chat Interface
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('DMI (Community) page loaded');
    
    // Mobile sidebar toggle
    const menuBtn = document.querySelector('header button.lg\\:hidden');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    
    if (menuBtn && mobileSidebar) {
        menuBtn.addEventListener('click', () => {
            mobileSidebar.classList.toggle('-translate-x-full');
        });
    }

    // Channel switching
    const channelIds = ['channel-general', 'channel-announcements', 'channel-showcase'];
    const channels = channelIds.map(id => document.getElementById(id)).filter(el => el);

    channels.forEach(channel => {
        channel.addEventListener('click', () => {
            channels.forEach(ch => {
                ch.classList.remove('bg-primary/10', 'text-primary', 'bg-white/10', 'text-white');
                ch.classList.add('hover:bg-slate-200', 'dark:hover:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
            });
            channel.classList.add('bg-primary/10', 'text-primary', 'bg-white/10', 'text-white');
            channel.classList.remove('hover:bg-slate-200', 'dark:hover:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
            
            const channelName = channel.querySelector('span.text-sm')?.textContent;
            const headerTitle = document.querySelector('main header h2');
            if (headerTitle) headerTitle.textContent = channelName;
            alert(`Switched to channel: #${channelName}`);
        });
    });

    // Message Input
    const msgInput = document.getElementById('chat-input');
    if (msgInput) {
        msgInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && msgInput.value.trim() !== '') {
                const msg = msgInput.value;
                alert(`Message sent to #${document.querySelector('main header h2').textContent}: ${msg}`);
                msgInput.value = '';
            }
        });
    }

    // User Controls
    const micBtn = document.getElementById('btn-mic-toggle');
    const audioBtn = document.getElementById('btn-audio-toggle');
    const settingsBtn = document.getElementById('btn-settings-dmi');

    if (micBtn) micBtn.addEventListener('click', () => alert('Microphone toggled'));
    if (audioBtn) audioBtn.addEventListener('click', () => alert('Audio toggled'));
    if (settingsBtn) settingsBtn.addEventListener('click', () => window.location.href = 'Config.html');

    // Server Buttons
    const addServerBtn = document.getElementById('btn-add-server');
    const exploreBtn = document.getElementById('btn-explore-servers');

    if (addServerBtn) addServerBtn.addEventListener('click', () => alert('Add a new server...'));
    if (exploreBtn) exploreBtn.addEventListener('click', () => alert('Explore community servers...'));

    // Chat Header Buttons
    const searchChatBtn = document.getElementById('btn-search-chat');
    const membersToggleBtn = document.getElementById('btn-members-toggle');

    if (searchChatBtn) searchChatBtn.addEventListener('click', () => alert('Search in this channel...'));
    if (membersToggleBtn) membersToggleBtn.addEventListener('click', () => {
        const rightSidebar = document.querySelector('aside.w-64.bg-slate-100.dark\\:bg-slate-900\\/80.border-l');
        if (rightSidebar) rightSidebar.classList.toggle('hidden');
    });
});
