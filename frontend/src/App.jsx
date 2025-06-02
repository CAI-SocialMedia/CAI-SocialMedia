import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserInfo from "./pages/UserInfo.jsx";
import { Header } from "./components/Header";
import { Explore } from './pages/Explore';
import { Home } from "./pages/Home";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import GoogleRegisterPage from "./pages/GoogleRegisterPage";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Footer from "./components/common/Footer";
import { CursorGlow } from "./components/effects/CursorGlow";
import PostDetailPage from "./pages/PostDetailPage";
import GenerateImagePage from "./pages/GenerateImagePage.jsx";
import ArchivedPosts from "./pages/ArchivedPosts.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import FavoritesPage from "./pages/FavoritesPage";
import SubscriptionPage  from "./pages/SubscriptionPage.jsx";

import { Toaster } from "sonner";

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

const MainLayout = ({ children }) => {
    const { user } = useAuth();
    const location = window.location.pathname;
    const hideHeaderPaths = ['/login', '/register', '/google-register'];

    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <CursorGlow/>
            <Toaster position="top-center" richColors/>
            {user && !hideHeaderPaths.includes(location) && <Header user={user}/>}

            <main className="container mx-auto px-4 py-8 flex-grow">
                <div className="max-w-4xl mx-auto">{children}</div>
            </main>

            {user && !hideHeaderPaths.includes(location) && <Footer/>}
        </div>
    );
};

function AppContent() {
    const { loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

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
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <UserInfo />
                    </ProtectedRoute>
                } />

                <Route path="/profile/:userUid" element={
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
                <Route path="/generate-image" element={
                    <ProtectedRoute>
                        <GenerateImagePage />
                    </ProtectedRoute>
                } />
                <Route path="/archived" element={
                    <ProtectedRoute>
                        <ArchivedPosts />
                    </ProtectedRoute>
                } />
                <Route path="/post-detail/:postUid" element={
                    <ProtectedRoute>
                        <PostDetailPage />
                    </ProtectedRoute>
                } />
                <Route path="/search" element={
                    <ProtectedRoute>
                        <SearchPage />
                    </ProtectedRoute>
                } />
                <Route path="/favorites" element={
                    <ProtectedRoute>
                        <FavoritesPage />
                    </ProtectedRoute>
                } />
                <Route path="/update-subscription" element={
                    <ProtectedRoute>
                        <SubscriptionPage />
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
