const user = JSON.parse(localStorage.getItem('user'));

// Check if logged in
if (!user) {
    window.location.href = 'CreateAccount.html';
}

// Fetch and display posts
async function fetchPosts() {
    try {
        const response = await fetch('http://localhost:5000/api/posts');
        const posts = await response.json();
        const container = document.getElementById('feed-container');
        if (!container) return;
        container.innerHTML = '';

        posts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm';
            article.innerHTML = `
            <div class="p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="size-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-sm">
                        ${post.author.username[0].toUpperCase()}
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">${post.author.username}</h4>
                        <p class="text-xs text-slate-500">${new Date(post.createdAt).toLocaleString()} • <span class="material-symbols-outlined text-[12px] align-middle">public</span></p>
                    </div>
                </div>
            </div>
            <div class="px-4 pb-3">
                <p class="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">${post.content}</p>
            </div>
            ${post.image ? `<div class="w-full aspect-video bg-cover bg-center" style="background-image: url('${post.image}')"></div>` : ''}
            <div class="p-4 flex flex-col gap-3">
                <div class="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px] fill-1">star</span><span>${post.stars} stars</span></div>
                </div>
            </div>
        `;
            container.appendChild(article);
        });
    } catch (err) {
        console.error('Error fetching posts:', err);
    }
}

// Create post
const submitBtn = document.getElementById('submit-post');
if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
        const content = document.getElementById('post-content').value;
        if (!content) return;

        try {
            const response = await fetch('http://localhost:5000/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ authorId: user.id, content })
            });

            if (response.ok) {
                document.getElementById('post-content').value = '';
                fetchPosts();
            }
        } catch (err) {
            console.error('Error creating post:', err);
        }
    });
}

// Social Interactions Handling
document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const icon = btn.querySelector('.material-symbols-outlined');
    if (icon && (icon.textContent.includes('star') || icon.textContent.includes('favorite'))) {
        const countSpan = btn.nextElementSibling?.tagName === 'SPAN' ? btn.nextElementSibling : null;
        const isLiked = icon.style.fontVariationSettings && icon.style.fontVariationSettings.includes("'FILL' 1");

        if (isLiked) {
            icon.style.fontVariationSettings = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
            icon.classList.remove('text-yellow-500', 'text-red-500');
            if (countSpan && !isNaN(parseFloat(countSpan.textContent))) {
                countSpan.textContent = (parseFloat(countSpan.textContent) - 0.1).toFixed(1);
            }
        } else {
            icon.style.fontVariationSettings = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";
            icon.classList.add(icon.textContent.includes('star') ? 'text-yellow-500' : 'text-red-500');
            if (countSpan && !isNaN(parseFloat(countSpan.textContent))) {
                countSpan.textContent = (parseFloat(countSpan.textContent) + 0.1).toFixed(1);
            }
        }
    }

    if (btn.textContent.trim().toLowerCase() === 'follow' || btn.textContent.trim().toLowerCase() === 'seguir') {
        const isFollowing = btn.getAttribute('data-following') === 'true';
        if (isFollowing) {
            btn.textContent = btn.className.includes('Profile.html') ? 'Seguir' : 'Follow';
            btn.className = "bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90";
            btn.setAttribute('data-following', 'false');
        } else {
            btn.textContent = btn.className.includes('Profile.html') ? 'Siguiendo' : 'Following';
            btn.className = "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white px-5 py-2 rounded-lg text-sm font-bold";
            btn.setAttribute('data-following', 'true');
        }
    }
});

// Navigation and Sidebar Logic
const sidebarItems = {
    'sidebar-home': () => window.location.reload(),
    'sidebar-messaging': () => alert('Messaging feature coming soon!'),
    'sidebar-groups': () => alert('Groups feature coming soon!'),
    'sidebar-videos': () => window.location.href = 'ShortSeccion.html',
    'sidebar-saved': () => alert('Saved posts coming soon!'),
    // Your Pages
    'nav-dmi': () => window.location.href = 'DMI.html',
    'nav-achievements': () => window.location.href = 'Archivenments.html',
    'nav-rewards': () => window.location.href = 'Rewards.html',
    'nav-shorts': () => window.location.href = 'ShortSeccion.html',
    'nav-profile': () => window.location.href = 'Profile.html'
};

Object.entries(sidebarItems).forEach(([id, handler]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', handler);
});

// Header Buttons
const notificationsBtn = document.getElementById('btn-notifications');
const messagesBtn = document.getElementById('btn-messages');
const settingsBtn = document.getElementById('btn-settings');

if (notificationsBtn) notificationsBtn.addEventListener('click', () => alert('No new notifications'));
if (messagesBtn) messagesBtn.addEventListener('click', () => alert('Messages coming soon!'));
if (settingsBtn) settingsBtn.addEventListener('click', () => {
    window.location.href = 'Config.html';
});

// Create Post Sidebar Button
const createPostSidebarBtn = document.getElementById('btn-create-post-sidebar');
if (createPostSidebarBtn) {
    createPostSidebarBtn.addEventListener('click', () => {
        document.getElementById('post-content')?.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Upload Image Button
const uploadImageBtn = document.getElementById('btn-upload-image');
if (uploadImageBtn) {
    uploadImageBtn.addEventListener('click', () => {
        alert('Image upload feature is currently in development.');
    });
}

// Search functionality
const searchInput = document.querySelector('header input[placeholder="Search"]');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const posts = document.querySelectorAll('#feed-container article');
        posts.forEach(post => {
            const content = post.textContent.toLowerCase();
            if (content.includes(query)) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
    });
}

// Initial load
fetchPosts();
