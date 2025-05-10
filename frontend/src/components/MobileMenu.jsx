import React, { useState, useEffect } from 'react';
import { Search, ImagePlus, User, Heart, Settings, LogOut, X } from 'lucide-react';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { fetchUserData } from '../services/userService';
import { auth } from '../auth/firebase';

// Kullanıcı verilerini önbelleğe almak için basit bir cache
let userDataCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

export const MobileMenu = ({ onClose }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                // Cache kontrolü
                const now = Date.now();
                if (userDataCache && (now - lastFetchTime) < CACHE_DURATION) {
                    setUser(userDataCache);
                    return;
                }

                const token = await auth.currentUser?.getIdToken();
                if (token) {
                    const userData = await fetchUserData(token);
                    userDataCache = userData;
                    lastFetchTime = now;
                    setUser(userData);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleNavigation = (path) => {
        handleClose();
        navigate(path);
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            userDataCache = null; // Cache'i temizle
            setUser(null);
            handleNavigation('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60"
                onClick={handleClose}
            />
            
            {/* Menu Content */}
            <div className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
                    <h2 className="text-xl font-semibold text-white">Menu</h2>
                    <button 
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6 text-slate-400" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-slate-900">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users, posts..."
                            className="w-full bg-slate-800 text-slate-200 rounded-full py-2.5 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                </div>

                {/* Create Post Button */}
                <div className="px-4 mb-6 bg-slate-900">
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={() => handleNavigation('/create-post')}
                        className="h-12"
                    >
                        <ImagePlus className="mr-2 h-5 w-5" />
                        Create Post
                    </Button>
                </div>

                {/* User Section */}
                <div className="flex-1 overflow-y-auto px-4 bg-slate-900">
                    {user ? (
                        <>
                            <div className="p-4 bg-slate-800 rounded-xl mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-xl font-semibold text-white">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-200 text-lg">{user.username}</p>
                                        <p className="text-sm text-slate-400">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <MenuItem 
                                    icon={<User size={20} />} 
                                    label="My Profile" 
                                    onClick={() => handleNavigation(`/profile/${user.id}`)} 
                                />
                                <MenuItem 
                                    icon={<ImagePlus size={20} />} 
                                    label="My Posts" 
                                    onClick={() => handleNavigation('/my-posts')} 
                                />
                                <MenuItem 
                                    icon={<Heart size={20} />} 
                                    label="Liked Posts" 
                                    onClick={() => handleNavigation('/liked-posts')} 
                                />
                                <MenuItem 
                                    icon={<Settings size={20} />} 
                                    label="Settings" 
                                    onClick={() => handleNavigation('/settings')} 
                                />

                                <div className="pt-4 mt-4 border-t border-slate-800">
                                    <MenuItem 
                                        icon={<LogOut size={20} />} 
                                        label="Sign Out" 
                                        onClick={handleLogout}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10" 
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <Button 
                                variant="primary" 
                                fullWidth
                                onClick={() => handleNavigation('/login')}
                                className="h-12"
                            >
                                Sign In
                            </Button>
                            <Button 
                                variant="outline" 
                                fullWidth
                                onClick={() => handleNavigation('/register')}
                                className="h-12"
                            >
                                Create Account
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MenuItem = ({ icon, label, onClick, className = '' }) => {
    return (
        <button
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-slate-200 hover:bg-slate-800 rounded-xl transition-colors ${className}`}
            onClick={onClick}
        >
            <span className="text-slate-400">{icon}</span>
            <span className="font-medium">{label}</span>
        </button>
    );
};