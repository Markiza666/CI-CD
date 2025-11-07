import axios from 'axios';

// 1. Define the base URL using Vite's environment variable syntax (import.meta.env).
// We assume the base URL for the backend API is defined in the .env file as VITE_API_BASE_URL.
// Example: VITE_API_BASE_URL=http://localhost:5000/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach the JWT token to every request if available
apiClient.interceptors.request.use(
    (config) => {
        const rawToken = localStorage.getItem('authToken'); 
        if (rawToken) {
            config.headers.Authorization = `Bearer ${rawToken}`;
        }
        return config;
    },
    // ...
);

export default apiClient;
