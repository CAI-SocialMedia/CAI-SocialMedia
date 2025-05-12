import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserInfo from "./pages/UserInfo.jsx";
import { Header } from "./components/Header";
import { Explore } from './pages/Explore';
import { Home } from "./pages/Home";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useTheme } from './contexts/ThemeContext.jsx';
import { ThemeProvider } from "./contexts/ThemeContext";
import GoogleRegisterPage from "./pages/GoogleRegisterPage";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Footer from "./components/common/Footer";
import { CursorGlow } from "./components/effects/CursorGlow";

// Protected Route bileşeni
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

// Public Route bileşeni (sadece giriş yapmamış kullanıcılar için)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <LoadingSpinner />;
    }

    if (user) {
        return <Navigate to="/" />;
    }

    return children;
};

// Ana sayfa düzeni
const MainLayout = ({ children }) => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const location = window.location.pathname;
    const hideHeaderPaths = ['/login', '/register', '/google-register'];

    return (
        <div className="min-h-screen bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <CursorGlow/>
            {user && !hideHeaderPaths.includes(location) && <Header user={user} />}

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">{children}</div>
            </main>

            {user && !hideHeaderPaths.includes(location) && <Footer />}
        </div>
    );
};

function AppContent() {
    return (
        <MainLayout>
            <Routes>
                <Route path="/login" element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                } />
                <Route path="/google-register" element={
                    <PublicRoute>
                        <GoogleRegisterPage />
                    </PublicRoute>
                } />
                <Route path="/me" element={
                    <ProtectedRoute>
                        <UserInfo />
                    </ProtectedRoute>
                } />
                <Route path="/explore" element={
                    <ProtectedRoute>
                        <Explore />
                    </ProtectedRoute>
                } />
                <Route path="/" element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </MainLayout>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <ThemeProvider>
                <AppContent />
                </ThemeProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
