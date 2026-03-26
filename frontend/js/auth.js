// Authentication utilities
function checkAuth() {
    const token = API.getToken();
    if (!token) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

function checkAdmin() {
    if (!checkAuth()) return false;

    const user = API.getUser();
    if (!user || user.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = '/';
        return false;
    }
    return true;
}

function updateNavigation() {
    const user = API.getUser();
    const authLinks = document.getElementById('authLinks');

    if (!authLinks) return;

    if (user) {
        authLinks.innerHTML = `
            <li><a href="/post-problem">Post Problem</a></li>
            ${user.role === 'admin' ? '<li><a href="/admin">Admin Panel</a></li>' : ''}
            <li><span style="color: var(--text-secondary);">Welcome, ${user.username}</span></li>
            <li><a href="#" id="logoutBtn">Logout</a></li>
        `;

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await API.logout();
                window.location.href = '/';
            });
        }
    } else {
        authLinks.innerHTML = `
            <li><a href="/login">Login</a></li>
            <li><a href="/signup">Sign Up</a></li>
        `;
    }
}

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', updateNavigation);
