import React from 'react';

export const GlowButton = ({
     children,
     variant = 'primary',
     size = 'md',
     className = '',
     ...props
   }) => {
  const baseClasses =
      "relative group flex items-center justify-center font-medium rounded-lg overflow-hidden transition-all";

  const variantClasses = {
    primary: "text-white bg-purple-600 hover:bg-purple-700",
    secondary: "text-white bg-pink-600 hover:bg-pink-700",
    outline: "text-purple-500 border border-purple-500 hover:text-white hover:bg-purple-600"
  };

  const sizeClasses = {
    sm: "text-sm py-2 px-4",
    md: "text-base py-3 px-6",
    lg: "text-lg py-4 px-8"
  };

  return (
      <button
          className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
          {...props}
      >
        {/* Glow effect */}
        <span className="absolute inset-0 w-full h-full transition-all duration-300 opacity-0 group-hover:opacity-100">
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-pink-500 blur-md transform scale-125 opacity-0 group-hover:opacity-40 transition-all duration-500 ease-out"></span>
      </span>

        {/* Pulse animation */}
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-pink-500 scale-0 opacity-0 group-hover:opacity-20 group-hover:scale-150 animate-pulse-slow pointer-events-none transition-all duration-700 ease-out rounded-full"></span>

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
  );
};
