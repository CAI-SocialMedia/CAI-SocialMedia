import api from "../api/axios.js";
import { auth } from "../auth/firebase.js";

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

export async function fetchUserData(token, username) {
    console.log('fetchUserData çağrıldı, username:', username);
    
    // Eğer username varsa direkt POST isteği yap
    if (username) {
        try {
            console.log('POST /user/me isteği gönderiliyor, username:', username);
            const createResponse = await api.post('/user/me', {
                username: username
            }, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('POST /user/me yanıtı:', createResponse.data);
            return createResponse.data;
        } catch (createError) {
            console.error('POST /user/me hatası:', createError);
            throw new Error('Kullanıcı bilgileri alınamadı veya oluşturulamadı: ' + createError.message);
        }
    }

    // Username yoksa GET isteği yap
    try {
        console.log('GET /user/me isteği gönderiliyor');
        const response = await api.get('/user/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('GET /user/me yanıtı:', response.data);
        return response.data;
    } catch (error) {
        console.error('GET /user/me hatası:', error);
        throw new Error('Kullanıcı bilgileri alınamadı: ' + error.message);
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
