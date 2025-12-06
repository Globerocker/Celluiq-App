import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Chrome, Activity } from 'lucide-react';


export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError(null);

        try {
            await signInWithGoogle();
            // Redirect handled by AuthContext
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }
            // Redirect to onboarding or dashboard based on profile
            navigate('/onboarding');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo/Brand */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#B7323F30]"
                    >
                        <Activity className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-2">CELLUIQ</h1>
                    <p className="text-gray-400">
                        {isLogin ? 'Willkommen zurück' : 'Erstelle deinen Account'}
                    </p>
                </div>

                {/* Google Auth */}
                <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="w-full mb-6 p-4 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                >
                    <Chrome className="w-5 h-5" />
                    Mit Google {isLogin ? 'anmelden' : 'registrieren'}
                </button>

                {/* Divider */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-[#0A0A0A] text-gray-500">oder mit Email</span>
                    </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="deine@email.com"
                                className="w-full pl-12 pr-4 py-3 bg-[#111111] border-2 border-[#1A1A1A] rounded-xl text-white focus:border-[#B7323F] focus:outline-none transition-colors"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Passwort
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-3 bg-[#111111] border-2 border-[#1A1A1A] rounded-xl text-white focus:border-[#B7323F] focus:outline-none transition-colors"
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#B7323F] hover:bg-[#9A2835] text-white py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                {isLogin ? 'Anmelden' : 'Registrieren'}
                            </>
                        )}
                    </button>
                </form>

                {/* Toggle Login/Register */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        {isLogin ? (
                            <>
                                Noch kein Account?{' '}
                                <span className="text-[#B7323F] font-semibold">Jetzt registrieren</span>
                            </>
                        ) : (
                            <>
                                Schon registriert?{' '}
                                <span className="text-[#B7323F] font-semibold">Jetzt anmelden</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Privacy Note */}
                <p className="mt-8 text-center text-xs text-gray-600">
                    Mit der Registrierung akzeptierst du unsere{' '}
                    <a href="#" className="text-gray-400 hover:text-white">
                        Datenschutzbestimmungen
                    </a>
                </p>
            </motion.div>
        </div>
    );
}
