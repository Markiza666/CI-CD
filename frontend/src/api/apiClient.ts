import axios from 'axios';

// 1. Define the base URL using Vite's environment variable syntax (import.meta.env).
// We assume the base URL for the backend API is defined in the .env file as VITE_API_BASE_URL.
// Example: VITE_API_BASE_URL=http://localhost:3000/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach the JWT token to every request if available
apiClient.interceptors.request.use(
    (config) => {
        // Check local storage for the authentication token
        const token = localStorage.getItem('authToken');

        // If the token exists, attach it to the Authorization header (Bearer scheme)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Handle request errors
        return Promise.reject(error);
    }
);

export default apiClient;
