import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Compass, LogOut } from 'lucide-react';
import { Avatar } from './Avatar';
import { Logo } from './Logo';
import { Button } from './ui/Button';
import { MobileMenu } from './MobileMenu';
import { auth } from '../auth/firebase';

export const Header = ({ user }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
    };

    const handleLogout = () => {
        auth.signOut();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
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
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Ana Sayfa
                        </Link>
                        <Link
                            to="/explore"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                location.pathname === '/explore'
                                    ? 'text-purple-400 bg-purple-500/10'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <span className="hidden lg:inline">Keşfet</span>
                            <Compass className="lg:hidden h-5 w-5" />
                        </Link>
                    </nav>
                </div>

                <div className="hidden md:flex flex-1 justify-center px-4">
                    <form onSubmit={handleSearch} className="w-full max-w-xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Kullanıcı, prompt veya resim arayın.."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-800/80 text-slate-200 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        </div>
                    </form>
                </div>

                <div className="flex items-center space-x-4">
                    <Button 
                        variant="primary" 
                        size="sm" 
                        className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium py-2.5 px-5 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl"
                    >
                        <svg 
                            className="w-4 h-4"
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        Görsel Oluştur
                    </Button>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-medium text-slate-200">{user.displayName}</p>
                                <p className="text-xs text-slate-400">Kalan Kredi: {user.credits}</p>
                            </div>
                            <button onClick={() => navigate('/me')}>
                                <Avatar user={user} size="sm" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                                title="Çıkış Yap"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Button variant="outline" size="sm" className="hidden sm:flex">
                            Giriş Yap
                        </Button>
                    )}

                    <button
                        className="md:hidden text-slate-200"
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