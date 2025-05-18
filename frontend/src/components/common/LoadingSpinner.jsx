import React from 'react';

const LoadingSpinner = ({ message = "Yükleniyor..." }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent mb-4" />
            <p className="text-sm text-slate-400">{message}</p>
        </div>
    );
};

export default LoadingSpinner;