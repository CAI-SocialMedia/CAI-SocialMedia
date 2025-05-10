import React from 'react';
import logo from "../../assets/caiLogo.png";
import "../styles/AuthLayout.css";

export default function AuthLayout({ children }) {
    return (
        <div className="auth-container">
            <div className="auth-left-side">
                <img src={logo} alt="CAI Logo" className="auth-logo" />
            </div>
            <div className="auth-right-side">
                {children}
            </div>
        </div>
    );
} 