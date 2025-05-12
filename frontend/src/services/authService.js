import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup,
    signOut as firebaseSignOut,
    updateProfile,
    GoogleAuthProvider
} from "firebase/auth";
import { auth } from "../auth/firebase.js";
import { generateSafeUsername } from "../utils/stringUtils.js";
import api from "../api/axios.js";

class AuthService {
    async register(email, password, username) {
        try {
            localStorage.setItem('tempUsername', username);

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: username });

            const token = await user.getIdToken(true);
            localStorage.setItem('authToken', token); // tutarlılık için 'authToken'

            const response = await api.post('/user/register', { username }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                user: response.data,
                token
            };
        } catch (error) {
            if (auth.currentUser) {
                await auth.currentUser.delete();
            }
            localStorage.removeItem('authToken');
            localStorage.removeItem('tempUsername');
            console.error('Registration error:', error);
            throw error;
        }
    }


    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const token = await user.getIdToken(true);
            localStorage.setItem('authToken', token);

            // Backend'den kullanıcı bilgilerini al
            const response = await api.get('/user/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return {
                user: response.data,
                token
            };
        } catch (error) {
            localStorage.removeItem('authToken');
            console.error('Login error:', error);
            throw error;
        }
    }

    async loginWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            // Token al
            const token = await user.getIdToken(true);
            localStorage.setItem('authToken', token);

            try {
                // Kullanıcı backend'de var mı kontrolü
                const response = await api.get('/user/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Kayıtlıysa bilgileri döndür
                return {
                    user: response.data,
                    token
                };
            } catch (error) {
                if (error.response?.status === 404 || error.response?.status === 400) {
                    // ❗ Yeni kullanıcı → yönlendirme yapılmalı
                    return {
                        user: null, // veya auth.currentUser
                        token,
                        needsRegistration: true
                    };
                }

                throw new Error(error.response?.data?.message || 'Bilinmeyen bir hata oluştu');
            }
        } catch (error) {
            localStorage.removeItem('authToken');
            console.error('Google login error:', error);
            throw error instanceof Error ? error : new Error('Google ile giriş yapılırken bir hata oluştu');
        }
    }


    async completeGoogleRegistration(displayName, username) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Kullanıcı oturumu bulunamadı');
            }

            // Display name güncelle
            await updateProfile(user, { displayName });

            // Token yenile
            const token = await user.getIdToken(true);
            localStorage.setItem('authToken', token);

            const response = await api.post('/user/register', {
                username,
                displayName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });


            return { 
                user: response.data,
                token
            };
        } catch (error) {
            console.error('Google registration completion error:', error);
            console.error('Error response:', error.response?.data);
            
            // Backend'den gelen hata mesajını al
            let errorMessage = 'Kayıt işlemi sırasında bir hata oluştu';
            
            if (error.response?.data?.Message) {
                errorMessage = error.response.data.Message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }
            
            throw new Error(errorMessage);
        }
    }

    async cancelGoogleRegistration() {
        try {
            const user = auth.currentUser;
            if (user) {
                await user.delete();
            }
            localStorage.removeItem('authToken');
        } catch (error) {
            console.error('Google registration cancellation error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            await firebaseSignOut(auth);
            localStorage.removeItem('authToken');
            localStorage.removeItem('tempUsername');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    async getCurrentUser() {
        return auth.currentUser;
    }

    async getToken(forceRefresh = false) {
        const user = await this.getCurrentUser();
        if (!user) return null;
        const token = await user.getIdToken(forceRefresh);
        localStorage.setItem('authToken', token);
        return token;
    }
}

export const authService = new AuthService();
