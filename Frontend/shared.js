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
        'home': 'MainHub.html',
        'hub': 'MainHub.html',
        'mail': 'DMI.html',
        'chat_bubble': 'DMI.html',
        'groups': '#',
        'play_circle': 'ShortSeccion.html', // Fixed mapping
        'bookmark': '#',
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

    document.querySelectorAll('.material-symbols-outlined, button, a, div[onclick]').forEach(el => {
        const text = el.textContent.trim().toLowerCase();
        const iconText = el.classList.contains('material-symbols-outlined') ? text : null;

        // Match by icon text
        if (iconText && navMapping[iconText]) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', () => {
                if (navMapping[iconText] !== '#') {
                    window.location.href = navMapping[iconText];
                }
            });
        }

        // Match by element text content
        for (const [key, path] of Object.entries(navMapping)) {
            if (text.includes(key) && path !== '#') {
                el.style.cursor = 'pointer';
                el.addEventListener('click', () => window.location.href = path);
                break;
            }
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
