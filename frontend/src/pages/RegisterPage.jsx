import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
import { authenticate } from "../services/authService";
import { fetchUserData } from "../services/userService";
import { firebaseErrorMessages } from "../utils/firebaseErrorMessages";
import { updateProfile } from "firebase/auth";
import "../styles/Auth.css";

export default function RegisterPage({ onUserFetched }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validateUsername = (username) => {
        // Sadece küçük harf, sayı, nokta ve alt tire içerebilir
        const usernameRegex = /^[a-z0-9._]+$/;
        
        if (username.length < 4) {
            return "Kullanıcı adı en az 4 karakter olmalıdır";
        }
        
        if (!usernameRegex.test(username)) {
            return "Kullanıcı adı sadece küçük harf, sayı, nokta ve alt tire içerebilir";
        }

        return null;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        // Username validasyonu
        const usernameError = validateUsername(username);
        if (usernameError) {
            setErrorMessage(usernameError);
            return;
        }

        setIsLoading(true);

        try {
            console.log('Firebase Authentication başlatılıyor...');
            const { token, user: firebaseUser } = await authenticate(email, password, true);
            console.log('Firebase Authentication başarılı, token alındı');

            // DisplayName'i güncelle
            const trimmedUsername = username.toLowerCase().trim();
            console.log('Firebase displayName güncelleniyor:', trimmedUsername);
            await updateProfile(firebaseUser, {
                displayName: trimmedUsername
            });
            console.log('Firebase displayName güncellendi');

            console.log('Kullanıcı bilgileri alınıyor/oluşturuluyor...');
            const user = await fetchUserData(token, trimmedUsername);
            console.log('Kullanıcı bilgileri başarıyla alındı/oluşturuldu:', user);

            onUserFetched(user);
            navigate("/");
        } catch (error) {
            console.error('Kayıt işlemi sırasında hata:', error);
            const firebaseCode = error.code || error.message;
            const translatedMessage = firebaseErrorMessages[firebaseCode] || "Kayıt işlemi başarısız oldu: " + error.message;
            setErrorMessage(translatedMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="auth-form register-page">
                <h1 className="auth-title">Kayıt Ol</h1>
                <p className="auth-subtitle">Başlamak için lütfen bilgilerinizi giriniz</p>

                <form onSubmit={handleRegister}>
                    <div className="auth-input-group">
                        <input
                            type="text"
                            placeholder="Kullanıcı adı"
                            className="auth-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                            required
                            minLength={4}
                            pattern="[a-z0-9._]+"
                            title="Sadece küçük harf, sayı, nokta ve alt tire kullanabilirsiniz"
                        />
                        <input
                            type="email"
                            placeholder="E-posta"
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Şifre"
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <p className="auth-hint">
                            *Kullanıcı adı en az 4 karakter olmalıdır ve sadece küçük harf, sayı, nokta ve alt tire
                            içerebilir
                        </p>
                        <p className="auth-hint">
                            *Şifre rakamlar, küçük-büyük harfler ve özel karakter içermelidir
                        </p>
                    </div>

                    {errorMessage && <div className="auth-error">{errorMessage}</div>}

                    <button
                        type="submit"
                        className="auth-button primary"
                        disabled={isLoading}
                    >
                        {isLoading ? "Kayıt Yapılıyor..." : "Hesap Oluştur"}
                    </button>

                    <div className="auth-divider">
                        <span>veya</span>
                    </div>

                    <button type="button" className="auth-button google">
                        <img
                            src="https://developers.google.com/identity/images/g-logo.png"
                            alt="Google"
                            className="google-icon"
                        />
                        Google ile Kayıt Ol
                    </button>

                    <div className="auth-footer">
                        <span>Zaten üye misiniz?</span>
                        <button
                            type="button"
                            className="auth-link"
                            onClick={() => navigate("/login")}
                        >
                            Giriş Yap
                        </button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
