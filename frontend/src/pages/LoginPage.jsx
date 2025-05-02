import "../styles/LoginPage.css";
import logo from "../assets/caiLogo.png";
import avatar from "../assets/user_foto.png";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { authenticate } from "../services/authService";
import { fetchUserData } from "../services/userService";
import {firebaseErrorMessages} from "../utils/firebaseErrorMessages.js";

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
            navigate("/me");
        } catch (error) {
            const firebaseCode = error.code || error.message;
            const translatedMessage = firebaseErrorMessages[firebaseCode] || "Giriş başarısız.";
            setErrorMessage(translatedMessage);

        } finally {
            setIsLoading(false);
        }

    };

    const handleRegisterRedirect = () => {
        navigate("/register");
    };


    return (
        <div className="login-container">
            <div className="left-side">
                <img src={logo} alt="CAI Logo" className="cai-logo" />
            </div>

            <div className="right-side">
                <div className="register-link" onClick={handleRegisterRedirect}>
                    Hesabınız yok mu? <span>Kaydolun</span>
                </div>

                <img src={avatar} alt="User Avatar" className="avatar" />

                <input
                    type="email"
                    placeholder="Email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Şifre"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {errorMessage && <div className="error-text">{errorMessage}</div>}

                <div className="button-row">
                    <button
                        className="login-btn"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? "Giriş Yapılıyor..." : "GİRİŞ YAP"}
                    </button>
                    <button className="forgot-btn">ŞİFREMİ UNUTTUM</button>
                </div>

                <div className="alt-login-text">
                    veya şununla giriş yapmayı deneyin
                </div>

                <button
                    type="button"
                    className="google-login-button gsi-material-button"
                >
                    <div className="gsi-material-button-state"></div>
                    <div className="gsi-material-button-content-wrapper">
                        <img
                            src="https://developers.google.com/identity/images/g-logo.png"
                            className="gsi-material-button-icon"
                            alt=""
                        />
                        <span className="gsi-material-button-contents">Google ile Kayıt Ol</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
