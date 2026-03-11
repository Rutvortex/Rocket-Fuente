document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Check
    const user = JSON.parse(localStorage.getItem('user'));
    const isLoginPage = window.location.pathname.includes('Crear_cuenta');

    if (!user && !isLoginPage) {
        window.location.href = '../Crear_cuenta/code.html';
        return;
    }

    // 2. Navigation Interconnectivity
    const navMapping = {
        // ID-based mapping (Higher priority)
        'nav-dmi': 'DMI.html',
        'nav-achievements': 'Archivenments.html',
        'nav-rewards': 'Rewards.html',
        'nav-shorts': 'ShortSeccion.html',
        'nav-profile': 'Profile.html',
        'nav-config': 'Config.html',
        'nav-home': 'MainHub.html',
        'nav-live': 'LivePlayer.html',
        'nav-large': 'LargePlayer.html',

        // Icon/Text-based fallback
        'home': 'MainHub.html',
        'hub': 'MainHub.html',
        'mail': 'DMI.html',
        'chat_bubble': 'DMI.html',
        'play_circle': 'ShortSeccion.html',
        'settings': 'Config.html',
        'person': 'Profile.html',
        'stars': 'Rewards.html',
        'reward': 'Rewards.html',
        'redeem': 'Rewards.html',
        'workspace_premium': 'Archivenments.html',
        'movie': 'LargePlayer.html',
        'video_library': 'LargePlayer.html',
        'short_text': 'ShortSeccion.html',
        'bolt': 'ShortPlayer.html',
        'live_tv': 'LivePlayer.html'
    };

    // Priority 1: Direct ID Match
    Object.keys(navMapping).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = navMapping[id];
            });
        }
    });

    // Priority 2: Class/Icon/Text Match (Fallback for elements without IDs)
    document.querySelectorAll('.material-symbols-outlined, button:not([id]), a:not([id]), div[onclick]').forEach(el => {
        const text = el.textContent.trim().toLowerCase();
        const iconText = el.classList.contains('material-symbols-outlined') ? text : null;

        if (iconText && navMapping[iconText] && navMapping[iconText] !== '#') {
            el.style.cursor = 'pointer';
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = navMapping[iconText];
            });
        }
    });

    // 3. Theme & Font Size Persistence
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    const savedFontSize = localStorage.getItem('fontSize') || '16';
    document.documentElement.style.fontSize = savedFontSize + 'px';

    // 4. Logo / Branding Home Link
    const branding = document.querySelector('h2');
    if (branding && (branding.textContent.includes('Vortex') || branding.textContent.includes('SocialNet'))) {
        const parent = branding.parentElement;
        parent.style.cursor = 'pointer';
        parent.addEventListener('click', () => window.location.href = 'MainHub.html');
    }
});
