import {colors} from "../styles/theme.js";
import { Link } from "react-router-dom";
export default function UserInfo({ user }) {
    return (
        <div style={styles.page}>
            <div style={styles.wrapper}>
                <h1 style={styles.title}>Kullanıcı Bilgileri</h1>
                <h5 style={styles.subtitle}>Merhaba, <span style={styles.highlight}>{user.email.split("@")[0]}</span></h5>
                <pre style={styles.jsonBox}>
                    {JSON.stringify(user, null, 2)}
                </pre>
            </div>
        </div>
    );
}


const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.primaryDark,
        padding: "2rem",
    },
    wrapper: {
        backgroundColor: colors.primary,
        color: colors.white,
        padding: "2rem",
        borderRadius: "12px",
        maxWidth: "600px",
        width: "100%",
        boxShadow: "0 0 15px rgba(0, 0, 0, 0.4)",
    },
    title: {
        fontSize: "2rem",
        marginBottom: "0.5rem",
        borderBottom: "1px solid #A5C9CA",
        textAlign: "center",
        paddingBottom: "0.5rem",
    },
    subtitle: {
        textAlign: "center",
        margin: "0 0 1rem 0",
        fontWeight: "normal",
        fontSize: "1.1rem",
        color: colors.accent,
    },
    highlight: {
        fontWeight: "bold",
        color: colors.backgroundLight,
    },
    jsonBox: {
        backgroundColor: colors.darkestDark,
        padding: "1rem",
        borderRadius: "8px",
        fontFamily: "monospace",
        fontSize: "0.95rem",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
    },
};

