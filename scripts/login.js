document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');
    setupAuthUI(authContainer); 

    const loginForm = document.getElementById('login-form');
    const feedbackModal = document.getElementById('feedback-modal');
    const modalContent = document.getElementById('modal-content');

    function showModal(message, isError = false) {
        modalContent.innerHTML = `<p class="text-lg ${isError ? 'text-red-500' : 'text-green-500'} font-semibold">${message}</p>`;
        feedbackModal.classList.remove('opacity-0', 'pointer-events-none');
        setTimeout(() => {
            if (!isError) window.location.href = 'home.html';
            else feedbackModal.classList.add('opacity-0', 'pointer-events-none');
        }, 2000);
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const accounts = JSON.parse(localStorage.getItem('localAccounts')) || [];
        const foundAccount = accounts.find(account => account.email === email && account.password === password);
        
        if (foundAccount) {
            sessionStorage.setItem('loggedInUser', JSON.stringify({
                username: foundAccount.username,
                email: foundAccount.email
            }));
            showModal('Login successful! Redirecting...');
        } else {
            showModal('Invalid email or password.', true);
        }
    });
});