import React, { useState } from "react";
import "../styles/registerStyle.css";
import leftImage from "../assets/caiLogo.png";
import { useNavigate } from "react-router-dom";
import { authenticate } from "../services/authService";
import { fetchUserData } from "../services/userService";

export default function RegisterPage({ onUserFetched }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (email, password) => {
        try {
            const { token } = await authenticate(email, password, true); // register
            const user = await fetchUserData(token);
            onUserFetched(user);
            navigate("/me");
        } catch (error) {
            alert("Kayıt başarısız: " + error.message);
        }
    };

    const handleLoginRedirect = () => {
        navigate("/login");
    };

    return (
        <div className="register-container">
            <div className="register-left">
                <img src={leftImage} alt="Illustration" className="left-img" />
            </div>

            <div className="register-right">
                <div className="register-box">
                    <h2 className="register-title">Kayıt Ol</h2>
                    <p className="register-subtitle">
                        Başlamak için lütfen bilgilerinizi giriniz
                    </p>

                    {/* ✅ Form onSubmit ile kontrol ediliyor */}
                    <form
                        className="register-form"
                        onSubmit={(e) => {
                            e.preventDefault(); // Sayfa yenilemesini engelle
                            handleRegister(email, password);
                        }}
                    >
                        <input
                            type="text"
                            placeholder="E-mail"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Şifre"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="password-hint">
                            *Şifre rakamlar, küçük-büyük harfler ve özel karakter içermelidir
                        </p>

                        <div className="button-group">
                            {/* ✅ type="submit" artık güvenli */}
                            <button type="submit" className="btn-primary">
                                Hesap Oluştur
                            </button>

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
                    </form>

                    <p className="login-text">
                        Zaten üye misiniz?{" "}
                        <span className="login-link" onClick={handleLoginRedirect}>
                            Giriş Yap
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
