import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Chrome, Activity, Mail, Lock, ArrowRight, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [authMode, setAuthMode] = useState('welcome'); // welcome, email-login, email-signup
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signInWithGoogle, signIn, signUp } = useAuth();

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
            } else {
                await signUp(email, password);
            }
            // Success - AuthStateChange will handle redirect
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
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#B7323F] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#1a1a1a] rounded-full mix-blend-screen filter blur-[120px] opacity-30"></div>
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
                                            <span>Continue with Google</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => setAuthMode('email-login')}
                                    className="w-full p-4 bg-[#1A1A1A] text-white border border-white/5 hover:bg-[#252525] hover:border-white/10 rounded-xl font-medium flex items-center justify-center gap-3 transition-all active:scale-95"
                                >
                                    <Mail className="w-5 h-5" />
                                    <span>Sign in with Email</span>
                                </button>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-xs text-gray-500">
                                    By continuing, you agree to our <span className="underline cursor-pointer hover:text-gray-300">Terms</span> & <span className="underline cursor-pointer hover:text-gray-300">Policy</span>
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {(authMode === 'email-login' || authMode === 'email-signup') && (
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
                                    {authMode === 'email-login' ? 'Welcome Back' : 'Create Account'}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    {authMode === 'email-login' ? 'Enter your credentials to access your dashboard' : 'Join Celluiq to optimize your health'}
                                </p>
                            </div>

                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Email Address</label>
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

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Password</label>
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
                                            {authMode === 'email-login' ? 'Sign In' : 'Sign Up'}
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-400">
                                    {authMode === 'email-login' ? "Don't have an account? " : "Already have an account? "}
                                    <button
                                        onClick={() => setAuthMode(authMode === 'email-login' ? 'email-signup' : 'email-login')}
                                        className="text-[#B7323F] font-semibold hover:underline"
                                    >
                                        {authMode === 'email-login' ? 'Sign Up' : 'Log In'}
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
