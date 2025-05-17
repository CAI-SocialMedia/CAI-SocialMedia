import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Search, Menu, X, Compass, ImagePlus, Bell
} from 'lucide-react';
import { Avatar } from './Avatar';
import { Logo } from './Logo';
import { Button } from './ui/Button';
import { GlowButton } from './ui/GlowButton';
import { MobileMenu } from './MobileMenu';
import { auth } from '../auth/firebase';
import { toast } from 'react-hot-toast';
import { UserDropdown } from './ui/UserDropdown.jsx';

export const Header = ({ user }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
    };

    const handleLogout = () => {
        auth.signOut();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 backdrop-blur-sm border-b transition-colors duration-300 bg-white/90 border-slate-200 dark:bg-slate-900/95 dark:border-slate-800">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo ve Navigation */}
                <div className="flex items-center gap-12">
                    <Link to="/">
                        <Logo />
                    </Link>
                    <nav className="hidden md:flex items-center space-x-1">
                        <Link
                            to="/"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                location.pathname === '/'
                                    ? 'text-purple-400 bg-purple-500/10'
                                    : 'text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            Ana Sayfa
                        </Link>
                        <Link
                            to="/explore"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                location.pathname === '/explore'
                                    ? 'text-purple-400 bg-purple-500/10'
                                    : 'text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            <span className="hidden lg:inline">Keşfet</span>
                            <Compass className="lg:hidden h-5 w-5" />
                        </Link>
                    </nav>
                </div>

                {/* Arama Kutusu */}
                <div className="hidden md:flex flex-1 justify-center px-4">
                    <form onSubmit={handleSearch} className="w-full max-w-xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Kullanıcı, prompt veya resim arayın.."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-full py-2 px-4 pl-10 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-100 text-slate-800 dark:bg-slate-800/80 dark:text-slate-200"
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                        </div>
                    </form>
                </div>

                {/* Sağ Üst Aksiyonlar */}
                <div className="flex items-center space-x-4">
                    <GlowButton
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/generate-image')}
                        className="hidden sm:flex items-center gap-2"
                    >
                        <ImagePlus size={16} />
                        <span className="text-md whitespace-nowrap">Görsel Oluştur</span>
                    </GlowButton>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {user.displayName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Kalan Kredi: {user.credits}
                                    {user.credits <= 1 && (
                                        <span className="ml-2 text-yellow-400 animate-pulse">! Az Kredi</span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={() => toast('Henüz bildiriminiz yok.')}
                                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                            >
                                <Bell size={20} />
                            </button>
                            <div className="relative">
                                <button onClick={() => setIsDropdownOpen(prev => !prev)}>
                                    <Avatar user={user} size="sm" />
                                </button>
                                {isDropdownOpen && <UserDropdown onClose={() => setIsDropdownOpen(false)} />}
                            </div>
                        </div>
                    ) : (
                        <Button variant="outline" size="sm" className="hidden sm:flex">
                            Giriş Yap
                        </Button>
                    )}

                    <button
                        className="md:hidden text-slate-700 dark:text-slate-200"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && <MobileMenu user={user} onClose={() => setIsMobileMenuOpen(false)} />}
        </header>
    );
};
