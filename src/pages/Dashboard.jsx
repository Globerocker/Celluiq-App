import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import CrossSellPopup from '@/components/CrossSellPopup';
import { useHealth } from '@/lib/HealthContext';
import { Activity, Droplet, Apple, Pill, ChevronRight, AlertCircle, TrendingUp, Award, TrendingDown, Footprints, Flame } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Dashboard() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { steps, calories, isAvailable, fetchDailyData } = useHealth();
    const [profile, setProfile] = useState(null);
    const [bloodWork, setBloodWork] = useState([]);
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadData();
            fetchDailyData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            // Load profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(profileData);

            // Load blood work
            const { data: bloodData } = await supabase
                .from('blood_work')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            setBloodWork(bloodData || []);

            // Generate recommendations if we have blood work
            if (bloodData && bloodData.length > 0 && bloodData[0].analysis_json) {
                await generateRecommendations(bloodData[0].analysis_json, profileData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateRecommendations = async (markers, userProfile) => {
        try {
            const supplements = [];
            const foods = [];

            // Fetch reference data for all markers found in analysis
            const markerNames = markers.map(m => m.name);
            const { data: refData } = await supabase
                .from('blood_markers_reference')
                .select('*')
                .in('marker_name', markerNames);

            if (!refData) return;

            // Map analysis to reference
            for (const marker of markers) {
                const ref = refData.find(r => r.marker_name.toLowerCase() === marker.name.toLowerCase());

                if (ref) {
                    if (marker.status === 'low' && ref.too_low_supplements) {
                        try {
                            const supps = typeof ref.too_low_supplements === 'string'
                                ? JSON.parse(ref.too_low_supplements)
                                : ref.too_low_supplements;

                            supplements.push(...supps);
                        } catch (e) {
                            console.error("Error parsing low supps", e);
                        }
                    }
                    if (marker.status === 'high' && ref.too_high_supplements) {
                        try {
                            const supps = typeof ref.too_high_supplements === 'string'
                                ? JSON.parse(ref.too_high_supplements)
                                : ref.too_high_supplements;
                            supplements.push(...supps);
                        } catch (e) {
                            console.error("Error parsing high supps", e);
                        }
                    }

                    // Foods logic (if populated same way)
                    if (marker.status === 'low' && ref.too_low_foods) {
                        try {
                            const f = typeof ref.too_low_foods === 'string' ? JSON.parse(ref.too_low_foods) : ref.too_low_foods;
                            foods.push(...f);
                        } catch (e) { }
                    }
                }
            }

            // Deduplicate items by name
            const uniqueSupps = Array.from(new Set(supplements.map(a => a.name)))
                .map(name => {
                    return supplements.find(a => a.name === name);
                });

            const uniqueFoods = Array.from(new Set(foods.map(a => a ? a : ''))) // simplistic
                .filter(Boolean)
                .map(name => ({ name: name, benefits: "Empfohlen für deine Werte" })); // Foods are just strings in CSV import

            setRecommendations({
                supplements: uniqueSupps.slice(0, 5),
                foods: uniqueFoods.slice(0, 5)
            });
        } catch (error) {
            console.error('Error generating recommendations:', error);
        }
    };

    const calculateHealthScore = () => {
        if (!bloodWork.length || !bloodWork[0].analysis_json) return 0;

        const markers = bloodWork[0].analysis_json;
        const optimal = markers.filter(m => m.status === 'optimal').length;
        const total = markers.length;

        return Math.round((optimal / total) * 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
        );
    }

    const healthScore = calculateHealthScore();

    return (
        <div className="min-h-screen bg-[#0A0A0A] pb-24">
            <CrossSellPopup />
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            {t('dashboard_title')}
                        </h1>
                        <p className="text-gray-400">
                            Willkommen zurück, {profile?.full_name || user?.email?.split('@')[0]}
                        </p>
                    </div>
                    {/* Language Switcher */}
                    <div className="flex gap-2">
                        {['de', 'en', 'es'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => i18n.changeLanguage(lang)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${i18n.language === lang
                                    ? 'bg-[#B7323F] text-white'
                                    : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
                                    }`}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Grid */}
                {isAvailable && (
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222]">
                            <div className="flex items-center gap-3 mb-2">
                                <Footprints className="text-[#3B7C9E]" />
                                <span className="text-gray-400">Schritte</span>
                            </div>
                            <p className="text-3xl font-bold">{steps.toLocaleString()}</p>
                        </div>
                        <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222]">
                            <div className="flex items-center gap-3 mb-2">
                                <Flame className="text-[#B7323F]" />
                                <span className="text-gray-400">Kalorien</span>
                            </div>
                            <p className="text-3xl font-bold">{calories}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* LEFT COLUMN - BIOMARKERS (PRIORITY) */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Health Score */}
                        {bloodWork.length > 0 && bloodWork[0].analysis_json && (
                            <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white/80 mb-2">Dein Health Score</p>
                                            <h2 className="text-6xl font-bold">{healthScore}</h2>
                                            <p className="text-white/60 mt-2">von 100 Punkten</p>
                                        </div>
                                        <div className="w-32 h-32 rounded-full border-8 border-white/20 flex items-center justify-center">
                                            <Activity className="w-16 h-16 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Blood Work */}
                        {bloodWork.length > 0 ? (
                            <div className="space-y-6">
                                {bloodWork.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-6 rounded-2xl bg-[#111111] border border-[#222222]"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">Blutbild Analyse</h3>
                                                <p className="text-sm text-gray-400">
                                                    Hochgeladen am {new Date(item.created_at).toLocaleDateString('de-DE')}
                                                </p>
                                            </div>
                                            <div className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-medium">
                                                Verarbeitet
                                            </div>
                                        </div>

                                        {item.analysis_json ? (
                                            <div className="mt-6">
                                                <h4 className="font-semibold mb-4">Marker Übersicht:</h4>
                                                <div className="grid md:grid-cols-3 gap-4">
                                                    {item.analysis_json.slice(0, 6).map((marker, idx) => (
                                                        <div key={idx} className="p-4 bg-[#0A0A0A] rounded-xl">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm text-gray-400">{marker.name}</span>
                                                                {marker.status === 'optimal' && <TrendingUp className="w-4 h-4 text-green-500" />}
                                                                {marker.status === 'low' && <TrendingDown className="w-4 h-4 text-yellow-500" />}
                                                                {marker.status === 'high' && <TrendingUp className="w-4 h-4 text-red-500" />}
                                                            </div>
                                                            <p className="text-2xl font-bold capitalize">{marker.status}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{marker.value} {marker.unit}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-6 p-4 bg-[#3B7C9E20] border border-[#3B7C9E30] rounded-xl">
                                                <p className="text-sm text-gray-300">
                                                    Die Analyse wird gerade durchgeführt. Dies kann einige Minuten dauern.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-[#111111] rounded-2xl border border-[#222222]">
                                <div className="w-20 h-20 bg-[#0A0A0A] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Activity className="w-10 h-10 text-gray-600" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Noch keine Blutbilder</h2>
                                <p className="text-gray-400 mb-6 px-4">
                                    Lade dein erstes Blutbild hoch, um personalisierte Analysen zu erhalten.
                                </p>
                                <a
                                    href="/upload"
                                    className="inline-block px-6 py-3 bg-[#B7323F] hover:bg-[#9A2835] rounded-xl font-semibold transition-colors"
                                >
                                    Blutbild hochladen
                                </a>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN - RECOMMENDATIONS & UPSELL */}
                    <div>
                        {/* Upsell / Missing Markets */}
                        <div className="mb-8 p-6 rounded-2xl bg-[#111111] border border-[#222222]">
                            <h3 className="text-xl font-bold mb-4">Wichtige Marker, die dir fehlen</h3>
                            <p className="text-gray-400 mb-6">Diese Biomarker sind wichtig für ein vollständiges Bild deiner Gesundheit.</p>

                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                {['Vitamin D', 'Magnesium', 'Testosterone', 'Cortisol AM', 'Ferritin', 'HbA1c', 'Omega-3 Index', 'CRP (hs-CRP)'].map(marker => {
                                    const hasMarker = bloodWork.length > 0 && bloodWork[0].analysis_json?.some(m => m.name.toLowerCase().includes(marker.toLowerCase()));
                                    if (hasMarker) return null;

                                    return (
                                        <div key={marker} className="p-3 bg-[#0A0A0A] border border-[#222222] rounded-xl flex items-center justify-between">
                                            <span className="text-gray-300 font-medium text-sm">{marker}</span>
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-[#B7323F10] p-4 rounded-xl border border-[#B7323F30] text-center">
                                <h4 className="text-md font-bold text-white mb-2">Erweitere deine Analyse</h4>
                                <Button className="w-full bg-[#B7323F] hover:bg-[#9A2835] text-white">
                                    Premium Checkup
                                </Button>
                            </div>
                        </div>

                        {recommendations ? (
                            <div className="space-y-6 sticky top-8">
                                {/* Supplement Recommendations */}
                                <div className="p-6 rounded-2xl bg-[#111111] border border-[#222222]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-[#B7323F20] flex items-center justify-center">
                                            <Pill className="w-6 h-6 text-[#B7323F]" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Supplements</h3>
                                            <p className="text-sm text-gray-400">Für dich optimiert</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {recommendations.supplements.slice(0, 5).map((supp, idx) => (
                                            <div key={idx} className="p-4 bg-[#0A0A0A] rounded-xl">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-white text-sm">{supp.name}</h4>
                                                        <p className="text-xs text-gray-400 mt-1">{supp.dosage_recommendation}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Food Recommendations */}
                                <div className="p-6 rounded-2xl bg-[#111111] border border-[#222222]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-[#3B7C9E20] flex items-center justify-center">
                                            <Apple className="w-6 h-6 text-[#3B7C9E]" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Ernährung</h3>
                                            <p className="text-sm text-gray-400">Passende Lebensmittel</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {recommendations.foods.slice(0, 5).map((food, idx) => (
                                            <div key={idx} className="p-4 bg-[#0A0A0A] rounded-xl">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-white text-sm">{food.name}</h4>
                                                        <p className="text-xs text-gray-400 mt-1">{food.benefits}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 rounded-2xl bg-[#111111] border border-[#222222] text-center">
                                <p className="text-gray-400">
                                    Empfehlungen erscheinen hier, sobald du ein Blutbild hochgeladen hast.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upsell / Missing Markets */}
                <div className="md:col-span-3"> {/* Use appropriate span */}
                    <div className="p-6 rounded-2xl bg-[#111111] border border-[#222222] mb-8">
                        <h3 className="text-xl font-bold mb-4">Wichtige Marker, die dir fehlen</h3>
                        <p className="text-gray-400 mb-6">Diese Biomarker sind wichtig für ein vollständiges Bild deiner Gesundheit.</p>

                        <div className="grid md:grid-cols-4 gap-4 mb-6">
                            {/* Hardcoded important markers for now, ideal would be DB query */}
                            {['Vitamin D', 'Magnesium', 'Testosterone', 'Cortisol AM', 'Ferritin', 'HbA1c', 'Omega-3 Index', 'CRP (hs-CRP)'].map(marker => {
                                // Check if user has this marker
                                const hasMarker = bloodWork.length > 0 && bloodWork[0].analysis_json?.some(m => m.name.toLowerCase().includes(marker.toLowerCase()));

                                if (hasMarker) return null; // Don't show if they have it

                                return (
                                    <div key={marker} className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-xl flex items-center justify-between">
                                        <span className="text-gray-300 font-medium">{marker}</span>
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="bg-[#B7323F10] p-6 rounded-xl border border-[#B7323F30] flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h4 className="text-lg font-bold text-white mb-2">Erweitere deine Analyse</h4>
                                <p className="text-sm text-gray-400">Bestelle ein vollständiges Premium Blutbild direkt bei uns. Wir testen über 40 Marker.</p>
                            </div>
                            <Button className="bg-[#B7323F] hover:bg-[#9A2835] text-white">
                                Premium Checkup bestellen
                            </Button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - RECOMMENDATIONS */}
                <div className="md:col-span-3 md:col-start-1 grid md:grid-cols-2 gap-8">
                    {/* Move recommendations here or keep sidebar? 
                            User layout request was vague ("dashboard"). 
                            But "Checkliste noch erzeugen" implies listing.
                            Let's keep structure but make it flow.
                        */}
                </div>

                {/* Original Right Column Content Moved/Wrapped if needed */}
                <div className="md:col-span-3">
                    {/* We need to re-render recommendations here? 
                             Or keep original code structure.
                             Actually, the previous code had specific grid columns.
                             Let's just inject the Upsell block between the sections or reorganize.
                          */}
                </div>
                {recommendations ? (
                    <div className="space-y-6 sticky top-8">
                        {/* Supplement Recommendations */}
                        <div className="p-6 rounded-2xl bg-[#111111] border border-[#222222]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-[#B7323F20] flex items-center justify-center">
                                    <Pill className="w-6 h-6 text-[#B7323F]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Supplements</h3>
                                    <p className="text-sm text-gray-400">Für dich optimiert</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {recommendations.supplements.slice(0, 5).map((supp, idx) => (
                                    <div key={idx} className="p-4 bg-[#0A0A0A] rounded-xl">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-white text-sm">{supp.name}</h4>
                                                <p className="text-xs text-gray-400 mt-1">{supp.dosage_recommendation}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Food Recommendations */}
                        <div className="p-6 rounded-2xl bg-[#111111] border border-[#222222]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-[#3B7C9E20] flex items-center justify-center">
                                    <Apple className="w-6 h-6 text-[#3B7C9E]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Ernährung</h3>
                                    <p className="text-sm text-gray-400">Passende Lebensmittel</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {recommendations.foods.slice(0, 5).map((food, idx) => (
                                    <div key={idx} className="p-4 bg-[#0A0A0A] rounded-xl">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-white text-sm">{food.name}</h4>
                                                <p className="text-xs text-gray-400 mt-1">{food.benefits}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 rounded-2xl bg-[#111111] border border-[#222222] text-center">
                        <p className="text-gray-400">
                            Empfehlungen erscheinen hier, sobald du ein Blutbild hochgeladen hast.
                        </p>
                    </div>
                )}
            </div>
            );
}
}
