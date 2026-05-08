/**
 * Config.js - Handles theme and font size persistence for the settings page
 */

document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontSizeProgress = document.getElementById('font-size-progress');
    const fontSizeHandle = document.getElementById('font-size-handle');
    const fontSizeValueDisplay = document.querySelector('.bg-slate-100.dark\:bg-slate-800.text-xs.font-semibold');

    // Load initial values
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const currentFontSize = localStorage.getItem('fontSize') || '16';

    if (darkModeToggle) {
        darkModeToggle.checked = (currentTheme === 'dark');
        darkModeToggle.addEventListener('change', (e) => {
            const isDark = e.target.checked;
            const theme = isDark ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
            
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });
    }

    if (fontSizeSlider) {
        fontSizeSlider.value = currentFontSize;
        updateFontSizeUI(currentFontSize);

        fontSizeSlider.addEventListener('input', (e) => {
            const size = e.target.value;
            updateFontSizeUI(size);
        });

        fontSizeSlider.addEventListener('change', (e) => {
            const size = e.target.value;
            localStorage.setItem('fontSize', size);
            document.documentElement.style.fontSize = size + 'px';
        });
    }

    function updateFontSizeUI(size) {
        if (fontSizeValueDisplay) fontSizeValueDisplay.textContent = size + 'px';
        
        // Calculate percentage for progress bar and handle
        const min = 12;
        const max = 24;
        const percent = ((size - min) / (max - min)) * 100;
        
        if (fontSizeProgress) fontSizeProgress.style.width = percent + '%';
        if (fontSizeHandle) fontSizeHandle.style.left = percent + '%';
    }

    // Save Preferences
    const saveBtn = document.getElementById('btn-save-preferences');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            alert('Preferences saved successfully!');
        });
    }

    // Security buttons
    const enable2faBtn = document.getElementById('btn-enable-2fa');
    const changePasswordBtn = document.getElementById('btn-change-password');
    const discardBtn = document.getElementById('btn-discard-changes');

    if (enable2faBtn) {
        enable2faBtn.addEventListener('click', () => alert('Two-Factor Authentication setup started...'));
    }
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => alert('Password change interface would open here.'));
    }
    if (discardBtn) {
        discardBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to discard changes?')) {
                window.location.reload();
            }
        });
    }

    // Search settings filtering
    const searchInput = document.getElementById('search-settings-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const sections = document.querySelectorAll('main section');
            sections.forEach(section => {
                const text = section.textContent.toLowerCase();
                section.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }
});
