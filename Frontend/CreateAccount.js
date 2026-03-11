/**
 * CreateAccount.js - Handles user role selection and signup logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Role-based logic
    const roleSelector = document.getElementById('role-selector');
    const infantilOption = document.querySelector('input[value="Infantil"]')?.closest('label');

    if (roleSelector && infantilOption) {
        roleSelector.addEventListener('change', (e) => {
            const selectedRole = e.target.value;
            
            if (selectedRole === 'Creator') {
                infantilOption.style.display = 'none';
                // If Infantil was selected, switch to Personal
                const infantilInput = document.querySelector('input[value="Infantil"]');
                if (infantilInput && infantilInput.checked) {
                    const personalInput = document.querySelector('input[value="Personal"]');
                    if (personalInput) personalInput.checked = true;
                }
            } else {
                infantilOption.style.display = 'flex';
            }
        });
    }

    // Sign In Modal Logic
    const signInModal = document.getElementById('signin-modal');
    const signInBtn = document.querySelector('header button.font-semibold');
    const closeSignIn = document.getElementById('close-signin');
    const switchToSignup = document.getElementById('switch-to-signup');

    if (signInBtn && signInModal) {
        signInBtn.addEventListener('click', () => {
            signInModal.classList.remove('hidden');
        });
    }

    if (closeSignIn && signInModal) {
        closeSignIn.addEventListener('click', () => {
            signInModal.classList.add('hidden');
        });
    }

    if (switchToSignup && signInModal) {
        switchToSignup.addEventListener('click', () => {
            signInModal.classList.add('hidden');
        });
    }

    // Modal click outside to close
    signInModal?.addEventListener('click', (e) => {
        if (e.target === signInModal) {
            signInModal.classList.add('hidden');
        }
    });

    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signin-email')?.value;
            const password = document.getElementById('signin-password')?.value;

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Login successful!');
                    localStorage.setItem('user', JSON.stringify({ id: data.userId, username: data.username }));
                    window.location.href = 'MainHub.html';
                } else {
                    alert('Error: ' + (data.message || 'Check your credentials'));
                }
            } catch (err) {
                console.error('Login Error:', err);
                alert('Could not connect to the server');
            }
        });
    }

    // Close button
    const closeBtn = document.querySelector('header button.bg-slate-200');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.location.href = 'MainHub.html';
        });
    }

    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', async () => {
            const username = document.getElementById('username')?.value;
            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;
            const userTypeInput = document.querySelector('input[name="user_type"]:checked');
            const subTypeInput = document.querySelector('input[name="sub_type"]:checked');

            if (!username || !email || !password || !userTypeInput || !subTypeInput) {
                alert('Please fill in all fields');
                return;
            }

            const userType = userTypeInput.value;
            const subType = subTypeInput.value;

            try {
                const response = await fetch('http://localhost:5000/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password, userType, subType })
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Registration successful!');
                    localStorage.setItem('user', JSON.stringify({ id: data.userId, username }));
                    window.location.href = 'MainHub.html'; // Changed to relative for consistency
                } else {
                    alert('Error: ' + (data.message || 'Unknown error'));
                }
            } catch (err) {
                console.error('Error:', err);
                alert('Could not connect to the server');
            }
        });
    }
});
