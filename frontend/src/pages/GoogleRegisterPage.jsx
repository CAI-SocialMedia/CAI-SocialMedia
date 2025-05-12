import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
import { authService } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import { generateSafeUsername } from "../utils/stringUtils";
import api from "../api/axios";
import AuthForm from "../components/auth/AuthForm";
import UsernameInput from "../components/auth/UsernameInput";
import "../styles/Auth.css";

export default function GoogleRegisterPage() {
    const [formData, setFormData] = useState({
        displayName: "",
        username: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    useEffect(() => {
        const userData = location.state;
        if (!userData) {
            navigate("/register");
            return;
        }
        setFormData(prev => ({
            ...prev,
            displayName: userData.displayName || userData.email?.split('@')[0] || 'User'
        }));
    }, [location.state, navigate]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.username) {
                setIsCheckingUsername(true);
                try {
                    const safeUsername = generateSafeUsername(formData.username);
                    const response = await api.post('/user/check-username', { username: safeUsername });
                    setUsernameAvailable(response.data.available);
                } catch (error) {
                    console.error('Username validation error:', error);
                    setUsernameAvailable(false);
                } finally {
                    setIsCheckingUsername(false);
                }
            } else {
                setUsernameAvailable(null);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [formData.username]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateUsernameFormat = (username) => {
        const usernameRegex = /^[a-z0-9_]{4,20}$/;
        return usernameRegex.test(username);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (!formData.username) {
                setError("Kullanıcı adı boş olamaz");
                setIsLoading(false);
                return;
            }

            const safeUsername = generateSafeUsername(formData.username);

            if (!validateUsernameFormat(safeUsername)) {
                setError("Kullanıcı adı sadece küçük harf, rakam ve alt çizgi içerebilir. Minimum 4, maksimum 20 karakter olmalıdır.");
                setIsLoading(false);
                return;
            }

            if (!usernameAvailable) {
                setError("Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir kullanıcı adı seçiniz.");
                setIsLoading(false);
                return;
            }

            const { user, token } = await authService.completeGoogleRegistration(
                formData.displayName,
                safeUsername
            );
            
            setUser(user);
            navigate("/");
        } catch (error) {
            console.error("Kayıt işlemi sırasında hata:", error);
            setError(error.message || 'Kayıt işlemi sırasında bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="auth-form google-register-page">
                <h1 className="auth-title">Hesabınızı Tamamlayın</h1>
                <p className="auth-subtitle">Lütfen kullanıcı bilgilerinizi girin</p>

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
                        name="displayName"
                        placeholder="Görünen Ad"
                        className="auth-input"
                        value={formData.displayName}
                        onChange={handleChange}
                        required
                    />
                    <UsernameInput
                        value={formData.username}
                        onChange={handleChange}
                        isChecking={isCheckingUsername}
                        isAvailable={usernameAvailable}
                    />
                    <p className="auth-hint">
                        Kullanıcı adı kuralları:
                        <br />- Sadece küçük harf, rakam ve alt çizgi (_) kullanılabilir
                        <br />- Boşluk ve özel karakterler kullanılamaz
                        <br />- Minimum 4, maksimum 20 karakter olmalıdır
                        <br />- Türkçe karakterler otomatik olarak dönüştürülür
                    </p>
                </AuthForm>

                <div className="auth-footer">
                    <span>Kayıt olmak istemiyor musunuz?</span>
                    <button
                        type="button"
                        className="auth-link"
                        onClick={() => {
                            authService.cancelGoogleRegistration();
                            navigate("/register");
                        }}
                    >
                        İptal Et
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
} 