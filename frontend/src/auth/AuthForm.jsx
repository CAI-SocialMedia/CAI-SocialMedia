import { useState, useEffect } from "react";
import { authenticate } from "../services/authService";
import { fetchUserData } from "../services/userService";
import { firebaseErrorMessages } from "../utils/firebaseErrorMessages.js";
import { styles } from "../styles/authStyles";

export default function AuthForm({ onUserFetched }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!email || !password) {
            setError("E-posta ve şifre boş bırakılamaz.");
            return;
        }

        try {
            const { token } = await authenticate(email, password, isRegister);
            const user = await fetchUserData(token);
            onUserFetched(user);
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
            return () => clearTimeout(timer); // component yeniden render olursa zamanlayıcıyı temizle
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

                    {error && (
                        <div style={styles.errorBox}>
                            {error}
                        </div>
                    )}

                    <button onClick={handleSubmit} style={styles.button}>
                        {isRegister ? "Kayıt Ol" : "Giriş Yap"}
                    </button>
                    <p style={styles.toggleText}>
                        {isRegister ? "Zaten hesabın var mı?" : "Hesabın yok mu?"}
                        <button
                            style={{...styles.toggleLink, background: "none", border: "none"}}
                            onClick={() => setIsRegister(!isRegister)}
                        >
                            {isRegister ? " Giriş Yap" : " Kayıt Ol"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
