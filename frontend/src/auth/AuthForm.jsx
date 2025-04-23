import { useState, useEffect } from "react";
import { firebaseErrorMessages } from "../utils/firebaseErrorMessages.js";
import { styles } from "../styles/authStyles";
import { Link } from "react-router-dom";

export default function AuthForm({ isRegister, onSubmit }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!email || !password) {
            setError("E-posta ve şifre boş bırakılamaz.");
            return;
        }

        try {
            await onSubmit(email, password);
            setError("");
        } catch (err) {
            const code = err.code;
            const userFriendlyMessage = firebaseErrorMessages[code] || err.message;
            setError(userFriendlyMessage);
        }
    };

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 4000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div style={styles.fullPage}>
            <div style={styles.card}>
                <div style={styles.inner}>
                    <h2 style={styles.title}>{isRegister ? "Kayıt Ol" : "Giriş Yap"}</h2>
                    <input
                        type="email"
                        placeholder="E-posta"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                    />
                    {error && <div style={styles.errorBox}>{error}</div>}
                    <button onClick={handleSubmit} style={styles.button}>
                        {isRegister ? "Kayıt Ol" : "Giriş Yap"}
                    </button>

                    {/* Buraya taşıyoruz: */}
                    <p style={styles.toggleText}>
                        {isRegister ? "Zaten hesabın var mı?" : "Hesabın yok mu?"}{" "}
                        <Link to={isRegister ? "/login" : "/register"} style={styles.toggleLink}>
                            {isRegister ? "Giriş Yap" : "Kayıt Ol"}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
