import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD
        ? 'https://socialmedia-backend-237279331001.europe-west4.run.app/api'
        : '/api',
    withCredentials: true,
});


// İstek öncesi token ekleme
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Cevap hatası kontrolü
api.interceptors.response.use((response) => response, (error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default api;
