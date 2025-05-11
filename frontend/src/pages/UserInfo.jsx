import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Key, CreditCard, Calendar } from 'lucide-react';
import { Avatar } from '../components/Avatar';

export default function UserInfo({ user }) {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-slate-200 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold">Profil Bilgileri</h1>
                </div>

                {/* User Info Card */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl">
                    {/* Avatar and Basic Info */}
                    <div className="flex items-center gap-6 mb-8">
                        <Avatar user={user} size="xlg" />
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{user.displayName}</h2>
                            <p className="text-slate-400">{user.email}</p>
                        </div>
                    </div>

                    {/* Detailed Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-slate-300">
                                <User className="w-5 h-5 text-purple-400" />
                                <div>
                                    <p className="text-sm text-slate-400">Kullanıcı Adı</p>
                                    <p className="font-medium">{user.username}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <Mail className="w-5 h-5 text-purple-400" />
                                <div>
                                    <p className="text-sm text-slate-400">E-posta</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-slate-300">
                                <CreditCard className="w-5 h-5 text-purple-400" />
                                <div>
                                    <p className="text-sm text-slate-400">Krediler</p>
                                    <p className="font-medium">{user.credits || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <Calendar className="w-5 h-5 text-purple-400" />
                                <div>
                                    <p className="text-sm text-slate-400">Son Güncelleme</p>
                                    <p className="font-medium">{formatDate(user.updatedAt || new Date())}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Raw Data (Collapsible) */}
                    <div className="mt-8">
                        <details className="group">
                            <summary className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                                <span className="text-sm font-medium">Ham Veri</span>
                                <svg
                                    className="w-4 h-4 transition-transform group-open:rotate-180"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <pre className="mt-4 p-4 bg-slate-900/50 rounded-lg overflow-x-auto text-sm">
                                {JSON.stringify(user, null, 2)}
                            </pre>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    );
}

