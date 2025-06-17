document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');
    const transactionForm = document.getElementById('transaction-form');
    const saveButton = document.getElementById('save-button');
    const authMessage = document.getElementById('auth-message');
    const feedbackModal = document.getElementById('feedback-modal');
    const modalContent = document.getElementById('modal-content');

    function showModal(message, isError = false) {
        modalContent.innerHTML = `<p class="text-lg ${isError ? 'text-red-500' : 'text-green-500'} font-semibold">${message}</p>`;
        feedbackModal.classList.remove('opacity-0', 'pointer-events-none');
        setTimeout(() => {
            hideModal();
            if (!isError) {
                window.location.href = 'home.html';
            }
        }, 2000);
    }

    function hideModal() {
        feedbackModal.classList.add('opacity-0', 'pointer-events-none');
    }
    
    //user check
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    
    if (loggedInUser) {
        authContainer.innerHTML = `
            <span class="text-sm font-medium text-gray-700">${loggedInUser.username}</span>
            <button id="logout-button" class="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">Logout</button>
        `;
         document.getElementById('logout-button').addEventListener('click', () => {
            sessionStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        });
        saveButton.disabled = false;
        authMessage.textContent = '';
    } else {
         authContainer.innerHTML = `
            <a href="login.html" class="text-sm font-medium text-gray-600 hover:text-blue-600">Login</a>
            <a href="register.html" class="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Register</a>
        `;
        saveButton.disabled = true;
        authMessage.textContent = 'You must be logged in to add a transaction.';
    }

    //date picker
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;

    //submission form
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!loggedInUser) {
            showModal('You must be logged in to save.', true);
            return;
        }
        
        const dateInput = document.getElementById('date');
        const amountInput = document.getElementById('amount');
        const typeInput = document.getElementById('type');
        const notesInput = document.getElementById('notes');

        if (!dateInput.value || !amountInput.value || !typeInput.value || !notesInput.value) {
             showModal('Error: Please fill out all fields.', true);
             return;
        }

        saveButton.disabled = true;
        saveButton.innerHTML = `<div class="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto"></div>`;

        try {
            const newTransaction = {
                id: `txn_${Date.now()}`, 
                amount: parseFloat(amountInput.value),
                date: dateInput.value,
                type: typeInput.value,
                notes: notesInput.value,
                userEmail: loggedInUser.email
            };

            const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
            transactions.push(newTransaction);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            
            showModal('Transaction saved successfully! Redirecting...');

        } catch (error) {
            console.error("Error saving to local storage: ", error);
            showModal('Error saving transaction. Please try again.', true);
            saveButton.disabled = false;
            saveButton.textContent = 'SAVE TRANSACTION';
        }
    });
});