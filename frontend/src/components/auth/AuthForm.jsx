import React from 'react';

const AuthForm = ({
    formData,
    error,
    isLoading,
    onSubmit,
    onChange,
    submitButtonText,
    loadingButtonText,
    children
}) => {
    return (
        <form onSubmit={onSubmit}>
            <div className="auth-input-group">
                {children}
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
                type="submit"
                className="auth-button primary"
                disabled={isLoading}
            >
                {isLoading ? loadingButtonText : submitButtonText}
            </button>
        </form>
    );
};

export default AuthForm; 