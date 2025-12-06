import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Analyzing() {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    const steps = [
        "Blutbild wird hochgeladen...",
        "Biomarker werden extrahiert (AI Analysis)...",
        "Vergleich mit Referenzwerten...",
        "Personalisierte Empfehlungen werden erstellt...",
        "Fast fertig..."
    ];

    useEffect(() => {
        const analyzeBloodWork = async () => {
            // 1. Check for file from Onboarding
            const filePath = location.state?.filePath;

            if (!filePath) {
                console.warn("No file path provided, falling back to simulation");
                // Simulation fallback
                const interval = setInterval(() => {
                    setProgress(prev => {
                        if (prev >= 100) {
                            clearInterval(interval);
                            setTimeout(() => navigate('/dashboard'), 500);
                            return 100;
                        }
                        return prev + 2;
                    });
                }, 100);
                return () => clearInterval(interval);
            }

            try {
                // Real Analysis Flow
                setProgress(10);
                setCurrentStep(1); // Extracting

                // 2. Create Signed URL for the Edge Function to download
                const { data: signData, error: signError } = await supabase
                    .storage
                    .from('blood-work')
                    .createSignedUrl(filePath, 300); // 5 mins valid

                if (signError) throw signError;

                setProgress(30);

                // 3. Call Edge Function (Gemini)
                console.log("Invoking Analysis Function...");
                const { data: analysisResult, error: funcError } = await supabase.functions.invoke('analyze-blood-work', {
                    body: { fileUrl: signData.signedUrl }
                });

                if (funcError) throw funcError;

                console.log("Analysis Result:", analysisResult);
                setProgress(70);
                setCurrentStep(2); // Comparing

                // 4. Save results (if not saved by function)
                // The function already saves to DB, but we might want to update local state or user context logic if needed.
                // For now, assume DB is updated correctly.

                await new Promise(r => setTimeout(r, 1000)); // smooth user experience
                setProgress(90);
                setCurrentStep(3); // Recommendations

                await new Promise(r => setTimeout(r, 1000));
                setProgress(100);
                setCurrentStep(4);

                setTimeout(() => navigate('/dashboard'), 500);

            } catch (err) {
                console.error("Analysis Failed:", err);
                // Fallback: navigate anyway so user isn't stuck, but maybe show error toast?
                // For MVP: log and go to dashboard
                alert("Analyse fehlgeschlagen (Fehler: " + err.message + "). Wir leiten dich trotzdem weiter.");
                navigate('/dashboard');
            }
        };

        analyzeBloodWork();
    }, [navigate, location]);

    useEffect(() => {
        // Update step based on progress
        const step = Math.floor(progress / 20);
        setCurrentStep(Math.min(step, steps.length - 1));
    }, [progress]);

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md text-center"
            >
                {/* Animated Icon */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#B7323F30]"
                >
                    <Activity className="w-12 h-12 text-white" />
                </motion.div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white mb-4">
                    Analysiere deine Gesundheit
                </h1>

                {/* Current Step */}
                <motion.p
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gray-400 mb-8"
                >
                    {steps[currentStep]}
                </motion.p>

                {/* Progress Bar */}
                <div className="relative w-full h-3 bg-[#1A1A1A] rounded-full overflow-hidden mb-4">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#B7323F] to-[#3B7C9E] rounded-full"
                    />
                </div>

                {/* Progress Percentage */}
                <p className="text-2xl font-bold text-white mb-8">
                    {Math.round(progress)}%
                </p>

                {/* Feature Highlights */}
                <div className="space-y-4 mt-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-3 text-left"
                    >
                        <div className="w-10 h-10 rounded-lg bg-[#3B7C9E20] flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-5 h-5 text-[#3B7C9E]" />
                        </div>
                        <div>
                            <p className="text-white font-medium">Biomarker Analyse</p>
                            <p className="text-sm text-gray-500">Vergleich mit optimalen Werten</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex items-center gap-3 text-left"
                    >
                        <div className="w-10 h-10 rounded-lg bg-[#B7323F20] flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-[#B7323F]" />
                        </div>
                        <div>
                            <p className="text-white font-medium">Personalisierte Empfehlungen</p>
                            <p className="text-sm text-gray-500">Supplements & Ernährung</p>
                        </div>
                    </motion.div>
                </div>

                {/* Note */}
                <p className="mt-12 text-xs text-gray-600">
                    Dies kann bis zu 30 Sekunden dauern
                </p>
            </motion.div>
        </div>
    );
}
