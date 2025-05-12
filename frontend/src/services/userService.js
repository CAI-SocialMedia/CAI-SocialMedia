import api from "../api/axios.js";
import { auth } from "../auth/firebase.js";
import { generateSafeUsername } from "../utils/stringUtils.js";

// Token yenileme için interval (5 dakika)
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000;
let tokenRefreshInterval = null;

// Token'ı yenile ve localStorage'a kaydet
const refreshToken = async () => {
    try {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken(true); // force refresh
            localStorage.setItem('authToken', token);
            return token;
        }
    } catch (error) {
        console.error('Token yenileme hatası:', error);
    }
    return null;
};

// Oturum durumunu kontrol et
export const checkAuthState = () => {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Kullanıcı oturum açmış
                const token = await refreshToken();
                if (token) {
                    // Token yenileme interval'ini başlat
                    if (!tokenRefreshInterval) {
                        tokenRefreshInterval = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);
                    }
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                // Kullanıcı oturum açmamış
                localStorage.removeItem('authToken');
                if (tokenRefreshInterval) {
                    clearInterval(tokenRefreshInterval);
                    tokenRefreshInterval = null;
                }
                resolve(false);
            }
            unsubscribe();
        });
    });
};

export async function fetchUserData(token) {
    try {
        // Google kayıt sayfasındaysak null döndür
        if (window.location.pathname === '/google-register') {
            return null;
        }

        const response = await api.get('/user/me', {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('GET /user/me hatası:', error);
        
        // Google kayıt sayfasındaysak hatayı fırlatma
        if (window.location.pathname === '/google-register') {
            return null;
        }
        
        // Backend'den gelen hata mesajını kullan
        const errorMessage = error.response?.data?.Message || error.response?.data?.message || error.message;
        
        // 401 hatası değilse direkt hatayı fırlat
        if (error.response?.status !== 401) {
            throw new Error(errorMessage);
        }
        
        // 401 hatası ise ve login/register sayfasında değilsek yönlendir
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        throw new Error(errorMessage);
    }
}

// Oturumu kapat
export const signOut = async () => {
    try {
        await auth.signOut();
        localStorage.removeItem('authToken');
        if (tokenRefreshInterval) {
            clearInterval(tokenRefreshInterval);
            tokenRefreshInterval = null;
        }
    } catch (error) {
        console.error('Çıkış yapılırken hata oluştu:', error);
        throw error;
    }
};
