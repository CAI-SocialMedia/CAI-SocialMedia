import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../auth/firebase';
import { fetchUserData } from '../services/userService';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    // Google kayıt sayfasındaysak fetchUserData'yı çağırma
                    if (location.pathname === '/google-register') {
                        setLoading(false);
                        return;
                    }

                    const token = await firebaseUser.getIdToken(true); // force refresh
                    const userData = await fetchUserData(token);
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth state change error:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, [location.pathname]);

    const value = { user, setUser, loading };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
