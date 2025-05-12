import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
import { authService } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import { firebaseErrorMessages } from "../utils/firebaseErrorMessages";
import { fetchUserData } from "../services/userService";
import GoogleButton from "../components/auth/GoogleButton";
import AuthForm from "../components/auth/AuthForm";
import "../styles/Auth.css";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { user, token } = await authService.login(formData.email, formData.password);
            const userData = await fetchUserData(token);
            setUser(userData);
            navigate("/");
        } catch (error) {
            console.error("Giriş işlemi sırasında hata:", error);
            const errorMessage = firebaseErrorMessages[error.code] || error.message;
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError("");

        try {
            const { user, token } = await authService.loginWithGoogle();
            const userData = await fetchUserData(token);
            setUser(userData);
            navigate("/");
        } catch (error) {
            console.error('Google giriş işlemi sırasında hata:', error);
            
            if (error.message.includes('kayıtlı bir kullanıcı bulunamadı')) {
                setError('Bu Google hesabı ile kayıtlı bir kullanıcı bulunamadı. Lütfen önce kayıt olun.');
                setTimeout(() => {
                    navigate('/register');
                }, 2000);
            } else {
                setError(error.message || 'Giriş yapılırken bir hata oluştu');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="auth-form login-page">
                <h1 className="auth-title">Giriş Yap</h1>
                <p className="auth-subtitle">Hesabınıza giriş yapın</p>

                <AuthForm
                    formData={formData}
                    error={error}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    onChange={handleChange}
                    submitButtonText="Giriş Yap"
                    loadingButtonText="Giriş Yapılıyor..."
                >
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
                </AuthForm>

                <div className="auth-divider">
                    <span>veya</span>
                </div>

                <GoogleButton
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    text="Google ile Giriş Yap"
                />

                <div className="auth-footer">
                    <span>Hesabınız yok mu?</span>
                    <button
                        type="button"
                        className="auth-link"
                        onClick={() => navigate("/register")}
                    >
                        Kayıt Ol
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
}
