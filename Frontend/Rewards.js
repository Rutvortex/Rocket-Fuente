/**
 * Rewards.js - Logic for the Vortex Rewards page
 */

document.addEventListener('DOMContentLoaded', () => {
    // Category filtering
    const filterIds = ['filter-all-rewards', 'filter-digital-rewards', 'filter-subscriptions-rewards', 'filter-exclusive-rewards'];
    const filterBtns = filterIds.map(id => document.getElementById(id)).filter(el => el);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('bg-slate-900', 'dark:bg-white', 'text-white', 'dark:text-slate-900');
                b.classList.add('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
                b.classList.remove('font-semibold');
                b.classList.add('font-medium');
            });
            btn.classList.add('bg-slate-900', 'dark:bg-white', 'text-white', 'dark:text-slate-900', 'font-semibold');
            btn.classList.remove('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300', 'font-medium');
            
            alert(`Filtering rewards by: ${btn.textContent.trim()}`);
        });
    });

    // Redemption logic
    const redeemIds = ['btn-redeem-frames', 'btn-redeem-badges', 'btn-redeem-themes', 'btn-redeem-ads', 'btn-redeem-support'];
    redeemIds.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
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

    // Header buttons
    const historyBtn = document.getElementById('btn-history-rewards');
    const helpBtn = document.getElementById('btn-help-rewards');

    if (historyBtn) historyBtn.addEventListener('click', () => alert('Showing transaction history...'));
    if (helpBtn) helpBtn.addEventListener('click', () => alert('How can we help you today?'));

    // Transaction History
    const viewAllTransactionsBtn = document.getElementById('btn-view-all-transactions');
    if (viewAllTransactionsBtn) {
        viewAllTransactionsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Loading full transaction history...');
        });
    }
});
