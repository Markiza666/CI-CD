import axios from "axios";
// Vi behöver inte importera decodeJwt här, då den inte används direkt i interceptorn.

// 1. Define the base URL using Vite's environment variable syntax.
// Fallback till http://localhost:5000/api om VITE_API_BASE_URL inte är satt.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log("API_BASE_URL =", API_BASE_URL);

const apiClient = axios.create({
    // FIX: Använder den konfigurerade bas-URL:en
    baseURL: API_BASE_URL, 
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor to attach the JWT token to every request if available
apiClient.interceptors.request.use(config => {
    // Läs token från LocalStorage
    const token = localStorage.getItem('authToken'); 
    
    if (token) {
        // Lägg till token i Authorization-headern
        config.headers.Authorization = `Bearer ${token}`; 
    }
    
    return config;
}, error => {
    return Promise.reject(error);
});

export default apiClient;
