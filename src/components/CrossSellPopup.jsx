import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplet, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";

export default function CrossSellPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        // Show popup after 5 seconds on dashboard
        const timer = setTimeout(() => {
            const hasSeenPopup = localStorage.getItem('seenCrossSell');
            if (!hasSeenPopup) {
                setIsOpen(true);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('seenCrossSell', 'true');
    };

    const handleBook = () => {
        window.open('https://wa.me/5215512345678?text=I%20want%20to%20book%20a%20blood%20test%20in%20Mexico%20City', '_blank');
        handleClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black z-50 transition-opacity"
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 m-auto z-50 w-full max-w-md h-fit p-6 bg-[#111111] border border-[#333333] rounded-2xl shadow-2xl"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-[#B7323F20] flex items-center justify-center mx-auto mb-4">
                                <Droplet className="w-8 h-8 text-[#B7323F]" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {t('cross_sell_title')}
                            </h2>
                            <p className="text-gray-400">
                                {t('cross_sell_desc')}
                            </p>
                        </div>

                        <div className="space-y-3 mb-8">
                            {['Vitamin D & B12', 'Hormone Panel', 'Liver & Kidney'].map((item) => (
                                <div key={item} className="flex items-center gap-3 bg-[#1A1A1A] p-3 rounded-lg">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-green-500" />
                                    </div>
                                    <span className="text-white font-medium">{item}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={handleBook}
                            className="w-full bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 text-lg rounded-xl"
                        >
                            {t('book_now')}
                        </Button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
