import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { Chrome, Activity } from 'lucide-react';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signInWithGoogle } = useAuth();

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError(null);

        try {
            await signInWithGoogle();
            // Redirect handled by Supabase callback
        } catch (err) {
            console.error('Auth error:', err);
            setError(err.message || 'Fehler bei der Anmeldung');
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
                        Optimiere deine Gesundheit mit personalisierten Empfehlungen
                    </p>
                </div>

                {/* Google Auth Button */}
                <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="w-full mb-6 p-4 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <Chrome className="w-5 h-5" />
                            Mit Google starten
                        </>
                    )}
                </button>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    </div>
                )}

                {/* Info Text */}
                <div className="text-center space-y-4">
                    <p className="text-sm text-gray-500">
                        Neuer Nutzer? Kein Problem - wir erstellen automatisch einen Account für dich.
                    </p>
                    <p className="text-xs text-gray-600">
                        Mit der Anmeldung akzeptierst du unsere{' '}
                        <a href="#" className="text-gray-400 hover:text-white">
                            Datenschutzbestimmungen
                        </a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
