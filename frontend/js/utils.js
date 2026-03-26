// Utility functions

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);

        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
}

function truncateText(text, maxLength = 200) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    }
}

function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        const loading = container.querySelector('.loading');
        if (loading) loading.remove();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function createProblemCard(problem) {
    const tags = problem.tags ? problem.tags.split(',').map(tag =>
        `<span class="tag">${escapeHtml(tag.trim())}</span>`
    ).join('') : '';

    return `
        <div class="problem-card" onclick="window.location.href='/problem/${problem.id}'">
            <div class="problem-header">
                <div>
                    <h3 class="problem-title">${escapeHtml(problem.title)}</h3>
                    <div class="problem-meta">
                        <span>By ${escapeHtml(problem.username || problem.full_name)}</span>
                        <span>${formatDate(problem.created_at)}</span>
                        <span>${problem.view_count || 0} views</span>
                        <span>${problem.comment_count || 0} comments</span>
                    </div>
                </div>
                <span class="category-badge">${escapeHtml(problem.category)}</span>
            </div>
            <p class="problem-description">${escapeHtml(truncateText(problem.description, 200))}</p>
            <div class="problem-footer">
                <div class="tags">${tags}</div>
            </div>
        </div>
    `;
}

function createCategoryCard(category) {
    return `
        <a href="/category/${category.id}" class="category-card">
            <div class="category-icon">${category.icon}</div>
            <div class="category-name">${category.name}</div>
        </a>
    `;
}
