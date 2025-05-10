import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { authenticate } from "../services/authService";
import { fetchUserData } from "../services/userService";
import {firebaseErrorMessages} from "../utils/firebaseErrorMessages.js";
import AuthLayout from "../components/layouts/AuthLayout";
import "../styles/Auth.css";

export default function LoginPage({ onUserFetched }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const { token } = await authenticate(email, password, false);
            const user = await fetchUserData(token);
            onUserFetched(user);
            navigate("/");
        } catch (error) {
            const firebaseCode = error.code || error.message;
            const translatedMessage = firebaseErrorMessages[firebaseCode] || "Giriş başarısız.";
            setErrorMessage(translatedMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="auth-form login-page">
                <h1 className="auth-title">Giriş Yap</h1>
                
                <div className="auth-input-group">
                    <input
                        type="email"
                        placeholder="Email"
                        className="auth-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Şifre"
                        className="auth-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {errorMessage && <div className="auth-error">{errorMessage}</div>}

                <button
                    className="auth-button primary"
                    onClick={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                </button>

                <div className="auth-divider">
                    <span>veya</span>
                </div>

                <button className="auth-button google">
                    <img
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google"
                        className="google-icon"
                    />
                    Google ile Giriş Yap
                </button>

                <div className="auth-footer">
                    <span>Hesabınız yok mu?</span>
                    <button
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
