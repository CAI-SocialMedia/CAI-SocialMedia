import React from 'react';

export const Avatar = ({ user, size = 'md' }) => {
    if (!user) {
        return (
            <div className={`h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center font-semibold text-white`}>
                ?
            </div>
        );
    }

    const sizeClasses = {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg'
    };

    if (user.profilePhotoUid) {
        return (
            <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-purple-500`}>
                <img
                    src={user.profilePhotoUid}
                    alt={`${user.displayName || user.username || 'User'}'s avatar`}
                    className="h-full w-full object-cover"
                />
            </div>
        );
    }

    const displayName = user.displayName || user.username || 'User';
    const initials = displayName.charAt(0).toUpperCase();

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center font-semibold text-white`}>
            {initials}
        </div>
    );
};