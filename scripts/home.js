document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');
    const balanceAmountEl = document.getElementById('balance-amount');
    const todaysEarningEl = document.getElementById('todays-earning');
    const todaysSpendingEl = document.getElementById('todays-spending');
    const todaysActivityEl = document.getElementById('todays-activity');
    const pieChartEl = document.getElementById('pie-chart');
    const legendEl = document.getElementById('pie-chart-legend');

    const loggedInUser = setupAuthUI(authContainer);

    const allTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const transactions = loggedInUser ? allTransactions.filter(t => t.userEmail === loggedInUser.email) : [];

    function formatCurrency(value) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    }

    let totalBalance = 0;
    let todaysEarning = 0;
    let todaysSpending = 0;
    const todayISO = new Date().toISOString().split('T')[0];
    const monthlySpendingByCategory = {};

    transactions.forEach(t => {
        const amount = parseFloat(t.amount);
        if (t.type === 'income') totalBalance += amount;
        else totalBalance -= amount;

        if (t.date === todayISO) {
            if (t.type === 'income') todaysEarning += amount;
            else todaysSpending += amount;
        }
        
        if (t.type === 'expense') {
            const category = t.notes || 'Uncategorized';
            monthlySpendingByCategory[category] = (monthlySpendingByCategory[category] || 0) + amount;
        }
    });

    balanceAmountEl.textContent = new Intl.NumberFormat('id-ID').format(totalBalance);
    todaysEarningEl.textContent = formatCurrency(todaysEarning);
    todaysSpendingEl.textContent = formatCurrency(todaysSpending);
    todaysActivityEl.textContent = formatCurrency(todaysEarning - todaysSpending);

    const categories = Object.keys(monthlySpendingByCategory);
    const totalSpending = Object.values(monthlySpendingByCategory).reduce((sum, val) => sum + val, 0);
    legendEl.innerHTML = '';

    if (totalSpending > 0) {
        const colors = ['#42A5F5', '#EF5350', '#FFEE58', '#66BB6A', '#AB47BC', '#FF7043'];
        let gradientString = 'conic-gradient(';
        let currentPercentage = 0;
        categories.sort((a, b) => monthlySpendingByCategory[b] - monthlySpendingByCategory[a]);

        categories.forEach((category, index) => {
            const amount = monthlySpendingByCategory[category];
            const percentage = (amount / totalSpending) * 100;
            const color = colors[index % colors.length];
            gradientString += `${color} ${currentPercentage}% ${currentPercentage + percentage}%, `;
            currentPercentage += percentage;

            const legendItem = document.createElement('div');
            legendItem.className = 'flex items-center justify-between text-sm py-1';
            legendItem.innerHTML = `
                <div class="flex items-center">
                    <span class="w-4 h-4 rounded-sm mr-3" style="background-color: ${color};"></span>
                    <span class="text-gray-600">${category}</span>
                </div>
                <div class="text-right">
                    <div class="font-semibold text-gray-800">${percentage.toFixed(1)}%</div>
                    <div class="text-xs text-gray-500">${formatCurrency(amount)}</div>
                </div>
            `;
            legendEl.appendChild(legendItem);
        });
        gradientString = gradientString.slice(0, -2) + ')';
        pieChartEl.style.backgroundImage = gradientString;
    } else {
         pieChartEl.style.backgroundColor = '#E5E7EB';
         legendEl.innerHTML = '<p class="text-center text-gray-500">No spending data to display.</p>';
    }
});