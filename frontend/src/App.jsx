import React, {useEffect, useState} from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserInfo from "./pages/UserInfo.jsx";
import { Header } from "./components/Header";
import { Explore } from './pages/Explore';
import { Home } from "./pages/Home";
import { auth } from "./auth/firebase";
import { checkAuthState, fetchUserData } from "./services/userService";

function App() {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const isAuthenticated = Boolean(userData);
    const location = window.location.pathname;

    // Header'ın gösterilmemesi gereken sayfalar
    const hideHeaderPaths = ['/login', '/register'];

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const isAuthenticated = await checkAuthState();
                if (isAuthenticated) {
                    const user = auth.currentUser;
                    if (user) {
                        const token = await user.getIdToken();
                        const data = await fetchUserData(token);
                        setUserData(data);
                    }
                }
            } catch (err) {
                console.error("Oturum durumu kontrol edilirken hata oluştu:", err);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-slate-200">
                {/* Header'ı sadece belirli sayfalarda göster */}
                {isAuthenticated && !hideHeaderPaths.includes(location) && <Header user={userData} />}

                <main className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <Routes>
                            {/* Login/Register yönlendirmeleri */}
                            <Route path="/login" element={<LoginPage onUserFetched={setUserData} />} />
                            <Route path="/register" element={<RegisterPage onUserFetched={setUserData} />} />

                            {/* Kimliği doğrulanmamış kullanıcıyı login sayfasına yönlendir */}
                            <Route
                                path="/me"
                                element={isAuthenticated ? <UserInfo user={userData} /> : <Navigate to="/login" />}
                            />
                            <Route
                                path="/explore"
                                element={isAuthenticated ? <Explore /> : <Navigate to="/login" />}
                            />
                            <Route
                                path="/"
                                element={isAuthenticated ? <Home currentUser={userData} /> : <Navigate to="/login" />}
                            />

                            {/* Tanımsız yollar login'e yönlendirilir */}
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </div>
                </main>

                {/* Footer'ı da sadece belirli sayfalarda göster */}
                {isAuthenticated && !hideHeaderPaths.includes(location) && (
                    <footer className="bg-slate-900/60 backdrop-blur-sm border-t border-slate-800 py-8">
                        <div className="container mx-auto px-4">
                            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                                <p className="text-slate-400 text-sm">© 2025 CAI. All rights reserved.</p>
                                <div className="flex items-center gap-6">
                                    <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Terms</a>
                                    <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Privacy</a>
                                    <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Help</a>
                                    <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Contact</a>
                                </div>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </Router>
    );
}

export default App;
