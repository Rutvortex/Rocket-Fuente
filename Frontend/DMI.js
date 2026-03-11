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
    const channels = document.querySelectorAll('.space-y-1 > div');
    channels.forEach(channel => {
        channel.addEventListener('click', () => {
            channels.forEach(ch => {
                ch.classList.remove('bg-primary/10', 'text-primary', 'bg-white/10', 'text-white');
                ch.classList.add('hover:bg-slate-200', 'dark:hover:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
            });
            channel.classList.add('bg-primary/10', 'text-primary', 'bg-white/10', 'text-white');
            channel.classList.remove('hover:bg-slate-200', 'dark:hover:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
            
            const channelName = channel.querySelector('span.text-sm')?.textContent;
            document.querySelector('main header h2').textContent = channelName;
            alert(`Switched to channel: #${channelName}`);
        });
    });

    // Message Input
    const msgInput = document.querySelector('footer input[placeholder^="Message"]');
    if (msgInput) {
        msgInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && msgInput.value.trim() !== '') {
                const msg = msgInput.value;
                alert(`Message sent: ${msg}`);
                msgInput.value = '';
                // In a real app, you'd prepend a new message element to the chat container
            }
        });
    }

    // User Controls
    const controlBtns = document.querySelectorAll('footer button');
    controlBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const icon = btn.querySelector('.material-symbols-outlined')?.textContent;
            if (icon === 'mic') alert('Microphone toggled');
            else if (icon === 'headphones') alert('Audio toggled');
            else if (icon === 'settings') window.location.href = 'Config.html';
        });
    });
});
