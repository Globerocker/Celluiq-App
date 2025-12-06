import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, Shield, Zap } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#B7323F40] via-transparent to-transparent" />

                <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Verstehe deinen Körper wie nie zuvor.
                        </h1>
                        <p className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
                            Lade dein Blutbild hoch und erhalte personalisierte Analysen, Supplement-Empfehlungen und einen maßgeschneiderten Gesundheitsplan.
                        </p>
                        <div className="flex gap-4">
                            <Link to="/onboarding">
                                <Button className="h-14 px-8 text-lg bg-[#B7323F] hover:bg-[#9A2835] rounded-full">
                                    Jetzt starten
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-3xl bg-[#111111] border border-[#222222]">
                        <div className="w-12 h-12 bg-[#B7323F20] rounded-xl flex items-center justify-center mb-6">
                            <Activity className="w-6 h-6 text-[#B7323F]" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Tiefgehende Analyse</h3>
                        <p className="text-gray-400">Verstehe die Bedeutung hinter deinen Werten und erkenne Zusammenhänge.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-[#111111] border border-[#222222]">
                        <div className="w-12 h-12 bg-[#3B7C9E20] rounded-xl flex items-center justify-center mb-6">
                            <Shield className="w-6 h-6 text-[#3B7C9E]" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Prävention</h3>
                        <p className="text-gray-400">Erkenne Risiken frühzeitig und handle proaktiv für deine langfristige Gesundheit.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-[#111111] border border-[#222222]">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6 text-purple-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Performance</h3>
                        <p className="text-gray-400">Optimiere deinen Energiehaushalt und steigere deine physische und mentale Leistung.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
