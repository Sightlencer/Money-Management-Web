function setupAuthUI(authContainer) {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        authContainer.innerHTML = `
            <span class="text-sm font-medium text-gray-700">Welcome, ${loggedInUser.username}</span>
            <button id="logout-button" class="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">Logout</button>
        `;
        document.getElementById('logout-button').addEventListener('click', () => {
            sessionStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        });
        return loggedInUser;
    } else {
        authContainer.innerHTML = `
            <a href="login.html" class="text-sm font-medium text-gray-600 hover:text-blue-600">Login</a>
            <a href="register.html" class="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Register</a>
        `;
        return null;
    }
}