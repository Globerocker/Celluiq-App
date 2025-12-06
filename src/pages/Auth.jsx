import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Chrome, Activity, Mail, Lock, ArrowRight, Loader2, AlertCircle, ChevronRight, Globe } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from '@/components/LanguageProvider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [authMode, setAuthMode] = useState('welcome'); // welcome, email-login, email-signup, forgot-password
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const { signInWithGoogle, signIn, signUp, resetPassword } = useAuth();
    const { t, language, setLanguage } = useLanguage();

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error('Google Auth error:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (authMode === 'email-login') {
                await signIn(email, password);
            } else if (authMode === 'email-signup') {
                await signUp(email, password);
            } else if (authMode === 'forgot-password') {
                await resetPassword(email);
                setResetSent(true);
                setLoading(false);
                return;
            }
        } catch (err) {
            console.error('Email Auth error:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const resetForm = () => {
        setAuthMode('welcome');
        setError(null);
        setEmail('');
        setPassword('');
        setResetSent(false);
    };

    if (resetSent) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-[#111111]/80 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{t('checkYourEmail')}</h2>
                    <p className="text-gray-400 mb-8">
                        {t('resetLinkSent')} <span className="text-white font-medium">{email}</span>
                    </p>
                    <button
                        onClick={resetForm}
                        className="w-full p-4 bg-[#1A1A1A] text-white hover:bg-[#252525] rounded-xl font-medium transition-all"
                    >
                        {t('returnToLogin')}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#B7323F] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#1a1a1a] rounded-full mix-blend-screen filter blur-[120px] opacity-30"></div>
            </div>

            {/* Language Switcher - Absolute Top Right */}
            <div className="absolute top-6 right-6 z-50">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#1A1A1A] transition-colors focus:outline-none">
                        <Globe className="w-4 h-4" />
                        <span className="uppercase">{language}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#111111] border-white/10 text-gray-300">
                        <DropdownMenuItem onClick={() => setLanguage('en')} className="hover:bg-[#1A1A1A] hover:text-white cursor-pointer">
                            English
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage('de')} className="hover:bg-[#1A1A1A] hover:text-white cursor-pointer">
                            Deutsch
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage('es')} className="hover:bg-[#1A1A1A] hover:text-white cursor-pointer">
                            Español
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="w-full max-w-md relative z-10">
                <AnimatePresence mode="wait">
                    {authMode === 'welcome' && (
                        <motion.div
                            key="welcome"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[#111111]/80 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl"
                        >
                            {/* Brand Header */}
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#B7323F30]">
                                    <Activity className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">CELLUIQ</h1>
                                <p className="text-gray-400 text-sm">
                                    Next Generation Health Intelligence
                                </p>
                            </div>

                            {/* Main Actions */}
                            <div className="space-y-4">
                                <button
                                    onClick={handleGoogleAuth}
                                    disabled={loading}
                                    className="w-full p-4 bg-white text-black hover:bg-gray-100 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-70 group"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Chrome className="w-5 h-5" />
                                            <span>{t('signInWithGoogle')}</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => setAuthMode('email-login')}
                                    className="w-full p-4 bg-[#1A1A1A] text-white border border-white/5 hover:bg-[#252525] hover:border-white/10 rounded-xl font-medium flex items-center justify-center gap-3 transition-all active:scale-95"
                                >
                                    <Mail className="w-5 h-5" />
                                    <span>{t('signInWithEmail')}</span>
                                </button>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-xs text-gray-500">
                                    {t('byContinuing')} <span className="underline cursor-pointer hover:text-gray-300">{t('terms')}</span> & <span className="underline cursor-pointer hover:text-gray-300">{t('policy')}</span>
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {(authMode === 'email-login' || authMode === 'email-signup' || authMode === 'forgot-password') && (
                        <motion.div
                            key="email-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[#111111]/80 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl relative"
                        >
                            <button
                                onClick={resetForm}
                                className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors"
                            >
                                <ChevronRight className="w-6 h-6 rotate-180" />
                            </button>

                            <div className="text-center mb-8 pt-4">
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    {authMode === 'email-login' ? t('welcomeBack') :
                                        authMode === 'forgot-password' ? t('resetPassword') : t('createAccount')}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    {authMode === 'email-login' ? t('enterCredentials') :
                                        authMode === 'forgot-password' ? t('enterEmailReset') :
                                            t('joinCelluiq')}
                                </p>
                            </div>

                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">{t('emailAddress')}</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-11 pr-4 py-3.5 bg-[#0A0A0A] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#B7323F] focus:ring-1 focus:ring-[#B7323F] transition-all"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>

                                {authMode !== 'forgot-password' && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">{t('password')}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength={6}
                                                className="w-full pl-11 pr-4 py-3.5 bg-[#0A0A0A] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#B7323F] focus:ring-1 focus:ring-[#B7323F] transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                )}

                                {authMode === 'email-login' && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setAuthMode('forgot-password')}
                                            className="text-xs text-gray-400 hover:text-white hover:underline transition-colors"
                                        >
                                            {t('forgotPassword')}
                                        </button>
                                    </div>
                                )}

                                {error && (
                                    <Alert variant="destructive" className="bg-red-900/10 border-red-900/20 text-red-400 py-3">
                                        <AlertCircle className="w-4 h-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full p-4 bg-[#B7323F] hover:bg-[#9A2835] text-white rounded-xl font-bold text-md shadow-lg shadow-[#B7323F30] flex items-center justify-center gap-2 transition-all transform active:scale-95 mt-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            {authMode === 'email-login' ? t('signIn') :
                                                authMode === 'forgot-password' ? t('sendResetLink') : t('signUp')}
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {authMode !== 'forgot-password' && (
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-400">
                                        {authMode === 'email-login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}
                                        <button
                                            onClick={() => setAuthMode(authMode === 'email-login' ? 'email-signup' : 'email-login')}
                                            className="text-[#B7323F] font-semibold hover:underline"
                                        >
                                            {authMode === 'email-login' ? t('signUp') : t('signIn')}
                                        </button>
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
