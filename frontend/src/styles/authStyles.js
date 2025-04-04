import { colors } from "./theme";

export const fadeIn = {
    animation: "fadeIn 0.6s ease-in-out",
};

export const styles = {
    fullPage: {
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: colors.primaryDark,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: colors.primary,
        padding: "2.5rem",
        borderRadius: "12px",
        boxShadow: "0 0 20px rgba(0,0,0,0.4)",
        width: "100%",
        maxWidth: "420px",
        color: colors.accent,
        textAlign: "center",
        ...fadeIn,
    },
    inner: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "320px",
    },
    title: {
        marginBottom: "1.8rem",
        fontSize: "1.8rem",
        color: colors.backgroundLight,
    },
    input: {
        width: "100%",
        padding: "0.75rem",
        marginBottom: "1.2rem",
        borderRadius: "8px",
        border: "1px solid #ccc",
        backgroundColor: colors.backgroundLight,
        color: colors.primaryDark,
        fontSize: "1rem",
        transition: "all 0.2s ease-in-out",
    },
    button: {
        width: "100%",
        padding: "0.75rem",
        borderRadius: "8px",
        backgroundColor: colors.primaryDark,
        color: colors.white,
        fontWeight: "600",
        fontSize: "1rem",
        border: "none",
        cursor: "pointer",
        transition: "all 0.3s ease",
    },
    toggleText: {
        marginTop: "1.2rem",
        fontSize: "0.9rem",
        color: colors.backgroundLight,
    },
    toggleLink: {
        color: colors.accent,
        cursor: "pointer",
        textDecoration: "underline",
        background: "none",
        border: "none",
        padding: 0,
        font: "inherit",
    },
    errorBox: {
        color: colors.accent,
        padding: "0.75rem",
        borderRadius: "8px",
        marginBottom: "0.5rem",
        width: "100%",
        textAlign: "center",
        fontWeight: "400",
        animation: "fadeIn 0.3s ease-in-out",
    }
};
