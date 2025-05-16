import axios from 'axios';
import { auth } from '../auth/firebase.js';

const getBaseUrl = () => {
    // Development ortamında

        return 'http://localhost:8042/api';

};

const api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(async (config) => {
    // check-username endpoint'i için token gerekmez
    if (config.url === '/user/check-username') {
        return config;
    }

    // Token'ı localStorage'dan al
    const token = localStorage.getItem('authToken');
    
    // Eğer token varsa header'a ekle
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 401 hatası ve henüz retry yapılmamışsa
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Firebase'den yeni token al
                const user = auth.currentUser;
                if (user) {
                    const newToken = await user.getIdToken(true);
                    localStorage.setItem('authToken', newToken);
                    
                    // Yeni token ile isteği tekrarla
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh error:', refreshError);
            }

            // Login veya register sayfasında değilsek yönlendir
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
