document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const feedbackModal = document.getElementById('feedback-modal');
    const modalContent = document.getElementById('modal-content');

    function showModal(message, isError = false) {
        modalContent.innerHTML = `<p class="text-lg ${isError ? 'text-red-500' : 'text-green-500'} font-semibold">${message}</p>`;
        feedbackModal.classList.remove('opacity-0', 'pointer-events-none');
        setTimeout(() => {
            if (!isError) window.location.href = 'login.html';
            else feedbackModal.classList.add('opacity-0', 'pointer-events-none');
        }, 2000);
    }

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            showModal("Passwords do not match.", true);
            return;
        }

        const accounts = JSON.parse(localStorage.getItem('localAccounts')) || [];
        if (accounts.find(account => account.email === email)) {
            showModal('An account with this email already exists.', true);
            return;
        }

        accounts.push({ username, email, password });
        localStorage.setItem('localAccounts', JSON.stringify(accounts));
        showModal('Registration successful! Please log in.');
    });
});