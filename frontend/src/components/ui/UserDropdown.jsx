import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Rocket, Moon, Sun, Album, HeartPlus } from 'lucide-react';
import { auth } from '../../auth/firebase';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';

export const UserDropdown = ({ onClose }) => {
    const navigate = useNavigate();
    const { isDark, setIsDark } = useTheme();

    const handleLogout = () => {
        auth.signOut();
        toast.success('Çıkış yapıldı');
        navigate('/login');
        onClose();
    };

    const handleUpgrade = () => {
        // "Abonelik" sayfasına yönlendir
        navigate('/update-subscription');
        onClose();
    };

    const handleArchivedPosts = () => {
        navigate('/archived');
        onClose();
    };

    const handleFavoritesPosts = () => {
        navigate('/favorites');
        onClose();
    };

    return (
        <div
            className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xl z-50 backdrop-blur-md bg-white/90 dark:bg-slate-800/70 transition-all duration-300"
        >
            {/* Profilim */}
            <button
                onClick={() => {
                    navigate('/profile');
                    onClose();
                }}
                className="w-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-all"
            >
                <User className="w-4 h-4" />
                <span>Profilim</span>
            </button>

            {/* Abonelik */}
            <button
                onClick={handleUpgrade}
                className="w-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-all"
            >
                <Rocket className="w-4 h-4" />
                <span>Abonelik</span>
            </button>

            {/* Arşiv */}
            <button
                onClick={handleArchivedPosts}
                className="w-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-all"
            >
                <Album className="w-4 h-4" />
                <span>Arşiv</span>
            </button>

            {/* Favoriler */}
            <button
                onClick={handleFavoritesPosts}
                className="w-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-all"
            >
                <HeartPlus className="w-4 h-4" />
                <span>Favoriler</span>
            </button>

            {/* Tema Switch */}
            <div className="flex items-center justify-between w-full px-4 py-2 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    <span className="text-sm">{isDark ? 'Koyu Tema' : 'Açık Tema'}</span>
                </div>
                <button
                    onClick={() => setIsDark((prev) => !prev)}
                    className={`relative w-11 h-6 flex items-center rounded-full transition-colors duration-300 ${
                        isDark ? 'bg-purple-500' : 'bg-slate-600'
                    }`}
                >
                    <div
                        className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
                            isDark ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                </button>
            </div>

            {/* Çıkış Yap */}
            <div className="border-t border-slate-300 dark:border-slate-700 my-1" />
            <button
                onClick={handleLogout}
                className="w-full px-4 py-2 hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center gap-2 text-red-500 dark:text-red-400 transition-all"
            >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
            </button>
        </div>
    );
};