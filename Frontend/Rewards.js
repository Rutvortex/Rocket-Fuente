/**
 * Rewards.js - Logic for the Vortex Rewards page
 */

document.addEventListener('DOMContentLoaded', () => {
    const categoryBtns = document.querySelectorAll('main > div.flex-wrap button');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => {
                b.classList.remove('bg-slate-900', 'dark:bg-white', 'text-white', 'dark:text-slate-900');
                b.classList.add('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
            });
            btn.classList.add('bg-slate-900', 'dark:bg-white', 'text-white', 'dark:text-slate-900');
            btn.classList.remove('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
            
            alert(`Filtering rewards by: ${btn.textContent.trim()}`);
            // Logic to show/hide cards would go here
        });
    });

    const redeemBtns = document.querySelectorAll('button:contains("Redeem"), button.px-4.py-1\\.5');
    redeemBtns.forEach(btn => {
        if (btn.textContent.trim().toUpperCase() === 'REDEEM') {
            btn.addEventListener('click', () => {
                const card = btn.closest('.group');
                const title = card.querySelector('h5')?.textContent;
                const cost = card.querySelector('.font-bold:not(.text-base)')?.textContent;
                
                if (confirm(`Do you want to redeem "${title}" for ${cost} stars?`)) {
                    alert('Reward redeemed successfully! Check your inventory.');
                }
            });
        }
    });

    // History help buttons
    const historyBtn = document.querySelector('header button:has(.material-symbols-outlined:contains("history"))');
    if (historyBtn) historyBtn.addEventListener('click', () => alert('Showing transaction history...'));
    
    const helpBtn = document.querySelector('header button:has(.material-symbols-outlined:contains("help"))');
    if (helpBtn) helpBtn.addEventListener('click', () => alert('How can we help you today?'));
});
