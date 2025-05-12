import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 py-8 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-600 dark:text-slate-400 text-sm">© 2025 CAI. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">Terms</a>
                        <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">Privacy</a>
                        <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">Help</a>
                        <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
