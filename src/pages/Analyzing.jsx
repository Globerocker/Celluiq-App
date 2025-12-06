import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Sparkles } from 'lucide-react';

export default function Analyzing() {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();

    const steps = [
        "Blutbild wird hochgeladen...",
        "Biomarker werden extrahiert...",
        "Vergleich mit Referenzwerten...",
        "Personalisierte Empfehlungen werden erstellt...",
        "Fast fertig..."
    ];

    useEffect(() => {
        // Simulate analysis progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    // Navigate to dashboard after completion
                    setTimeout(() => navigate('/dashboard'), 500);
                    return 100;
                }
                return prev + 2;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [navigate]);

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
