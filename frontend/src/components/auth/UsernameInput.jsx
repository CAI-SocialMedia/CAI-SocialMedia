import React from 'react';

const UsernameInput = ({ value, onChange, isChecking, isAvailable }) => {
    return (
        <div className="relative">
            <input
                type="text"
                name="username"
                placeholder="Kullanıcı Adı"
                className={`auth-input ${isAvailable === false ? 'border-red-500' : isAvailable ? 'border-green-500' : ''}`}
                value={value}
                onChange={onChange}
                required
            />
            {isChecking && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            )}
            {!isChecking && isAvailable !== null && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isAvailable ? (
                        <span className="text-green-500">✓</span>
                    ) : (
                        <span className="text-red-500">✗</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default UsernameInput; 