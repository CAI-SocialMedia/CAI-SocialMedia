import React from 'react';

const GoogleButton = ({ onClick, disabled, text }) => {
    return (
        <button 
            type="button" 
            className="auth-button google"
            onClick={onClick}
            disabled={disabled}
        >
            <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className="google-icon"
            />
            {text}
        </button>
    );
};

export default GoogleButton; 