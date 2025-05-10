import React from 'react';
import CAI_1 from '../assets/CAI_1.png';

export const Logo = () => {
    return (
        <div className="flex items-center gap-2">
            <img 
                src={CAI_1} 
                alt="CAI Logo" 
                className="h-16 w-auto object-contain"
            />
        </div>
    );
};