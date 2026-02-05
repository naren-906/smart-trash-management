const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000/api';

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const config = {
        ...options,
        headers,
        credentials: 'include' // Important for cookies
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            // Check if it's an auth error and redirect if needed
            if (response.status === 401 || response.status === 403) {
                const currentPath = window.location.pathname;
                if (!['/', '/login', '/signup', '/driver-login', '/admin-login'].includes(currentPath)) {
                    // Only redirect if we're on a protected page
                    if (currentPath.startsWith('/admin')) window.location.href = '/admin-login';
                    else if (currentPath.startsWith('/driver')) window.location.href = '/driver-login';
                    else window.location.href = '/login';
                }
            }
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}
