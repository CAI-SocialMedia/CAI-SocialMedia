import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
import { authService } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import { firebaseErrorMessages } from "../utils/firebaseErrorMessages";
import { generateSafeUsername } from "../utils/stringUtils.js";
import api from "../api/axios";
import GoogleButton from "../components/auth/GoogleButton";
import AuthForm from "../components/auth/AuthForm";
import "../styles/Auth.css";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        username: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateUsername = async (username) => {
        try {
            // Username'i güvenli formata dönüştür
            const safeUsername = generateSafeUsername(username);
            const response = await api.post('/user/check-username', { username: safeUsername });
            return {
                available: response.data.available,
                safeUsername
            };
        } catch (error) {
            console.error('Username validation error:', error);
            return {
                available: false,
                safeUsername: null
            };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Şifreler eşleşmiyor");
            setIsLoading(false);
            return;
        }

        try {
            // Username kontrolü
            const { available, safeUsername } = await validateUsername(formData.username);
            if (!available) {
                setError("Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir kullanıcı adı seçiniz.");
                setIsLoading(false);
                return;
            }

            const { user, token } = await authService.register(formData.email, formData.password, safeUsername);
            setUser(user);
            navigate("/");
        } catch (error) {
            console.error("Kayıt işlemi sırasında hata:", error);
            const errorMessage = firebaseErrorMessages[error.code] || error.message;
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setIsLoading(true);
        setError("");

        try {
            const { user, token, needsRegistration } = await authService.loginWithGoogle();

            if (needsRegistration) {
                const currentUser = await authService.getCurrentUser();
                navigate("/google-register", {
                    state: {
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                        uid: currentUser.uid
                    }
                });
                return;
            }
            setUser(user);
            navigate("/");
        } catch (error) {
            console.error('Google kayıt işlemi sırasında hata:', error);
            // Eğer kullanıcı zaten kayıtlıysa, giriş sayfasına yönlendir
            if (error.message.includes('kayıtlı bir kullanıcı bulunamadı')) {
                setError('Bu Google hesabı zaten kayıtlı. Lütfen giriş yapın.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(error.message || 'Kayıt işlemi sırasında bir hata oluştu');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="auth-form register-page">
                <h1 className="auth-title">Kayıt Ol</h1>
                <p className="auth-subtitle">Yeni bir hesap oluşturun</p>

                <AuthForm
                    formData={formData}
                    error={error}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    onChange={handleChange}
                    submitButtonText="Kayıt Ol"
                    loadingButtonText="Kayıt Yapılıyor..."
                >
                        <input
                            type="text"
                            name="username"
                            placeholder="Kullanıcı Adı"
                            className="auth-input"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="E-posta"
                            className="auth-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Şifre"
                            className="auth-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Şifre Tekrar"
                            className="auth-input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                </AuthForm>

                    <div className="auth-divider">
                        <span>veya</span>
                    </div>

                <GoogleButton
                        onClick={handleGoogleRegister}
                        disabled={isLoading}
                    text="Google ile Kayıt Ol"
                />

                    <div className="auth-footer">
                        <span>Zaten hesabınız var mı?</span>
                        <button
                            type="button"
                            className="auth-link"
                            onClick={() => navigate("/login")}
                        >
                            Giriş Yap
                        </button>
                    </div>
            </div>
        </AuthLayout>
    );
}
