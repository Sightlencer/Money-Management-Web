document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');
    const discussionList = document.getElementById('discussion-list');
    const makeDiscussionBtn = document.getElementById('make-discussion-btn');
    const discussionModal = document.getElementById('discussion-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const newDiscussionForm = document.getElementById('new-discussion-form');

    const loggedInUser = setupAuthUI(authContainer);

    if (!loggedInUser) {
         makeDiscussionBtn.disabled = true;
         makeDiscussionBtn.classList.add('cursor-not-allowed', 'opacity-50');
    }

    makeDiscussionBtn.addEventListener('click', () => {
        if(loggedInUser) discussionModal.classList.remove('opacity-0', 'pointer-events-none');
        else alert('Please log in to create a new discussion.');
    });
    closeModalBtn.addEventListener('click', () => {
        discussionModal.classList.add('opacity-0', 'pointer-events-none');
    });

    function loadDiscussions() {
        const discussions = JSON.parse(localStorage.getItem('forumDiscussions')) || [];
        discussionList.innerHTML = '';
        if (discussions.length === 0) {
            discussionList.innerHTML = `<p class="text-center text-gray-500 py-8">No discussions yet. Start one!</p>`;
            return;
        }
        discussions.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(d => {
            const item = document.createElement('a');
            item.href = `discussion.html?id=${d.id}`;
            item.className = 'discussion-item block bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow';
            item.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <span class="font-semibold text-lg text-gray-800">${d.title}</span>
                        <p class="text-sm text-gray-500">by ${d.author} &middot; ${new Date(d.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div class="flex items-center space-x-4 text-gray-500">
                        <span class="font-medium">${d.posts.length} posts</span>
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
            `;
            discussionList.appendChild(item);
        });
    }
    
    newDiscussionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!loggedInUser) return;

        const discussions = JSON.parse(localStorage.getItem('forumDiscussions')) || [];
        const newDiscussion = {
            id: `disc_${Date.now()}`,
            title: document.getElementById('discussion-title').value,
            author: loggedInUser.username,
            timestamp: new Date().toISOString(),
            posts: [{
                author: loggedInUser.username,
                message: document.getElementById('discussion-post').value,
                timestamp: new Date().toISOString()
            }]
        };

        discussions.push(newDiscussion);
        localStorage.setItem('forumDiscussions', JSON.stringify(discussions));
        
        discussionModal.classList.add('opacity-0', 'pointer-events-none');
        newDiscussionForm.reset();
        loadDiscussions();
    });

    loadDiscussions();
});