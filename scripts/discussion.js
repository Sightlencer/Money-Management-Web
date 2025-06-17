document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');
    const discussionTitleEl = document.getElementById('discussion-title');
    const postsArea = document.getElementById('posts-area');
    const replyForm = document.getElementById('reply-form');
    const replyInput = document.getElementById('reply-input');
    const replyButton = document.getElementById('reply-button');

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
        replyInput.disabled = false;
        replyButton.disabled = false;
    } else {
         authContainer.innerHTML = `
            <a href="login.html" class="text-sm font-medium text-gray-600 hover:text-blue-600">Login</a>
            <a href="register.html" class="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Register</a>
        `;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const discussionId = urlParams.get('id');

    function loadDiscussion() {
        if (!discussionId) {
            discussionTitleEl.textContent = 'Discussion not found.';
            return;
        }

        const discussions = JSON.parse(localStorage.getItem('forumDiscussions')) || [];
        const discussion = discussions.find(d => d.id === discussionId);

        if (!discussion) {
            discussionTitleEl.textContent = 'Discussion not found.';
            return;
        }

        discussionTitleEl.textContent = discussion.title;
        postsArea.innerHTML = '';
        discussion.posts.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp)).forEach(post => {
            const isOwnPost = loggedInUser && post.author === loggedInUser.username;
            const postElement = document.createElement('div');
            postElement.className = `flex items-start gap-4 ${isOwnPost ? 'flex-row-reverse' : ''}`;
            postElement.innerHTML = `
                <div class="w-10 h-10 rounded-full ${isOwnPost ? 'bg-gray-500' : 'bg-blue-500'} flex-shrink-0 flex items-center justify-center text-white font-bold">${post.author.charAt(0).toUpperCase()}</div>
                <div class="${isOwnPost ? 'bg-blue-500 text-white' : 'bg-gray-100'} p-4 rounded-lg ${isOwnPost ? 'rounded-tr-none' : 'rounded-tl-none'} max-w-[75%]">
                    <p class="font-bold ${isOwnPost ? '' : 'text-blue-600'}">${post.author}</p>
                    <p>${post.message}</p>
                    <p class="text-xs ${isOwnPost ? 'text-blue-200' : 'text-gray-500'} mt-2">${new Date(post.timestamp).toLocaleString()}</p>
                </div>
            `;
            postsArea.appendChild(postElement);
        });
    }

    replyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!loggedInUser) return;
        
        const message = replyInput.value.trim();
        if (message === '') return;

        const discussions = JSON.parse(localStorage.getItem('forumDiscussions')) || [];
        const discussionIndex = discussions.findIndex(d => d.id === discussionId);
        
        if (discussionIndex > -1) {
            const newPost = {
                author: loggedInUser.username,
                message: message,
                timestamp: new Date().toISOString()
            };
            discussions[discussionIndex].posts.push(newPost);
            localStorage.setItem('forumDiscussions', JSON.stringify(discussions));
            replyInput.value = '';
            loadDiscussion();
        }
    });

    loadDiscussion();
});
