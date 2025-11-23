import axios from "axios";

// 1. Define the base URL using Vite's environment variable syntax.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log("API_BASE_URL =", API_BASE_URL);

const apiClient = axios.create({
    baseURL: API_BASE_URL, 
    withCredentials: false,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor to attach the JWT token to every request if available
apiClient.interceptors.request.use(config => {
    const tokenWithQuotes = localStorage.getItem('authToken'); 
    
    if (tokenWithQuotes) {
        let token;
        try {
            token = JSON.parse(tokenWithQuotes); 
        } catch (e) {
            token = tokenWithQuotes;
        }

        if (typeof token === 'string') {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    return config;
}, error => {
    return Promise.reject(error);
});

export default apiClient;
