document.addEventListener('DOMContentLoaded', () => {
            const authContainer = document.getElementById('auth-container');
            const loginOverlay = document.getElementById('login-overlay');
            const calendarGrid = document.getElementById('calendar-grid');
            const calendarTitle = document.getElementById('calendar-title');
            const prevMonthBtn = document.getElementById('prev-month');
            const nextMonthBtn = document.getElementById('next-month');
            const transactionModal = document.getElementById('transaction-modal');
            const closeModalBtn = document.getElementById('close-modal');
            const transactionForm = document.getElementById('transaction-form');

            let currentDate = new Date();
            let loggedInUser = null;

            function checkAuthStatus() {
                loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
                if (loggedInUser) {
                    authContainer.innerHTML = `
                        <span class="text-sm font-medium text-gray-700">${loggedInUser.username}</span>
                        <button id="logout-button" class="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">Logout</button>
                    `;
                    document.getElementById('logout-button').addEventListener('click', () => {
                        sessionStorage.removeItem('loggedInUser');
                        window.location.href = 'login.html';
                    });
                    loginOverlay.classList.add('hidden');
                } else {
                    loginOverlay.classList.remove('hidden');
                }
                renderCalendar();
            }

            function openTransactionModal(date) {
                if(!loggedInUser) return;
                document.getElementById('modal-date').value = date.toISOString().split('T')[0];
                document.getElementById('modal-date-display').textContent = date.toLocaleDateString('en-CA');
                transactionModal.classList.remove('opacity-0', 'pointer-events-none');
            }

            function closeTransactionModal() {
                transactionModal.classList.add('opacity-0', 'pointer-events-none');
                transactionForm.reset();
            }

            closeModalBtn.addEventListener('click', closeTransactionModal);

            prevMonthBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar();
            });

            nextMonthBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar();
            });

            function renderCalendar() {
                const allTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
                const userTransactions = loggedInUser ? allTransactions.filter(t => t.userEmail === loggedInUser.email) : [];
                
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                calendarTitle.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
                
                const monthlyData = {};
                userTransactions.forEach(t => {
                    const transactionDate = new Date(t.date);
                    if (transactionDate.getFullYear() === year && transactionDate.getMonth() === month) {
                        const day = transactionDate.getDate();
                        if (!monthlyData[day]) monthlyData[day] = { income: 0, expense: 0 };
                        if (t.type === 'income') monthlyData[day].income += t.amount;
                        else monthlyData[day].expense += t.amount;
                    }
                });

                buildCalendarGrid(monthlyData);
            }

            function buildCalendarGrid(monthlyData) {
                let calendarHtml = '';
                const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const firstDayOfMonth = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                daysOfWeek.forEach(day => {
                    calendarHtml += `<div class="text-center font-bold py-3 bg-gray-50 border-b border-r border-gray-200 text-sm">${day}</div>`;
                });
                
                for (let i = 0; i < firstDayOfMonth; i++) {
                    calendarHtml += `<div class="border-b border-r border-gray-200 bg-gray-50"></div>`;
                }

                for (let i = 1; i <= daysInMonth; i++) {
                    const data = monthlyData[i];
                    const today = new Date();
                    const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    
                    calendarHtml += `<div class="day-cell border-b border-r border-gray-200 p-2 flex flex-col" data-day="${i}">
                        <span class="font-semibold ${isToday ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : ''}">${i}</span>
                        <div class="mt-1 text-xs sm:text-sm flex-grow overflow-y-auto">`;
                    
                    if(data) {
                        if(data.income > 0) calendarHtml += `<p class="text-green-600 font-bold truncate">+${data.income.toLocaleString()}</p>`;
                        if(data.expense > 0) calendarHtml += `<p class="text-red-600 font-bold truncate">-${data.expense.toLocaleString()}</p>`;
                    }
                    calendarHtml += `</div></div>`;
                }
                calendarGrid.innerHTML = calendarHtml;

                document.querySelectorAll('.day-cell').forEach(cell => {
                    cell.addEventListener('click', () => {
                        if(!loggedInUser) return;
                        const day = parseInt(cell.dataset.day);
                        const selectedDate = new Date(year, month, day);
                        openTransactionModal(selectedDate);
                    });
                });
            }
            
            transactionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if(!loggedInUser) return;
                
                const newTransaction = {
                    id: `txn_${Date.now()}`, 
                    amount: parseFloat(document.getElementById('modal-amount').value),
                    date: document.getElementById('modal-date').value,
                    type: document.getElementById('modal-type').value,
                    notes: document.getElementById('modal-notes').value,
                    userEmail: loggedInUser.email
                };
                const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
                transactions.push(newTransaction);
                localStorage.setItem('transactions', JSON.stringify(transactions));
                
                closeTransactionModal();
                renderCalendar();
            });

            checkAuthStatus();
        });