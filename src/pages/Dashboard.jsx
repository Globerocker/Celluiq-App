```
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next'; // Add translation hook
import i18n from '@/lib/i18n';
import CrossSellPopup from '@/components/CrossSellPopup';
import { Activity, Droplet, Apple, Pill, ChevronRight, AlertCircle, TrendingUp, Award } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Dashboard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [bloodWork, setBloodWork] = useState([]);
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadData();
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

            // Analyze each marker
            for (const marker of markers) {
                if (marker.status === 'low') {
                    // Get supplement recommendations
                    const { data: suppData } = await supabase
                        .from('supplements_reference')
                        .select('*')
                        .ilike('influenced_markers', `% ${ marker.name }% `)
                        .eq('gender', userProfile.gender === 'male' ? 'male' : 'female')
                        .limit(3);

                    if (suppData) supplements.push(...suppData);

                    // Get food recommendations
                    const { data: foodData } = await supabase
                        .from('foods_reference')
                        .select('*')
                        .ilike('influenced_markers', `% ${ marker.name }% `)
                        .limit(3);

                    if (foodData) foods.push(...foodData);
                }
            }

            setRecommendations({
                supplements: [...new Set(supplements)].slice(0, 5),
                foods: [...new Set(foods)].slice(0, 5)
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
                                    <p className="text-white/60 mt-2">von 100 Punkten</p>
                                </div>
                                <div className="w-32 h-32 rounded-full border-8 border-white/20 flex items-center justify-center">
                                    <Activity className="w-16 h-16 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Blood Work Results */}
                {bloodWork.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-[#111111] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Activity className="w-10 h-10 text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Noch keine Blutbilder</h2>
                        <p className="text-gray-400 mb-6">
                            Lade dein erstes Blutbild hoch, um personalisierte Analysen zu erhalten
                        </p>
                        <a
                            href="/upload"
                            className="inline-block px-6 py-3 bg-[#B7323F] hover:bg-[#9A2835] rounded-xl font-semibold transition-colors"
                        >
                            Blutbild hochladen
                        </a>
                    </div>
                ) : (
                    <>
                        {/* Recommendations */}
                        {recommendations && (
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {/* Supplement Recommendations */}
                                <div className="p-6 rounded-2xl bg-[#111111] border border-[#222222]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-[#B7323F20] flex items-center justify-center">
                                            <Pill className="w-6 h-6 text-[#B7323F]" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Empfohlene Supplements</h3>
                                            <p className="text-sm text-gray-400">Basierend auf deinen Markern</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {recommendations.supplements.slice(0, 5).map((supp, idx) => (
                                            <div key={idx} className="p-4 bg-[#0A0A0A] rounded-xl">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-white">{supp.name}</h4>
                                                        <p className="text-sm text-gray-400 mt-1">{supp.dosage_recommendation}</p>
                                                        {supp.best_time && (
                                                            <p className="text-xs text-gray-500 mt-1">⏰ {supp.best_time}</p>
                                                        )}
                                                    </div>
                                                    <div className="px-2 py-1 bg-[#3B7C9E20] text-[#3B7C9E] rounded text-xs">
                                                        {supp.category}
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
                                            <h3 className="text-xl font-bold">Empfohlene Lebensmittel</h3>
                                            <p className="text-sm text-gray-400">Für deine Ziele</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {recommendations.foods.slice(0, 5).map((food, idx) => (
                                            <div key={idx} className="p-4 bg-[#0A0A0A] rounded-xl">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-white">{food.name}</h4>
                                                        <p className="text-sm text-gray-400 mt-1">{food.benefits}</p>
                                                        {food.daily_dosage && (
                                                            <p className="text-xs text-gray-500 mt-1">📊 {food.daily_dosage} {food.unit}</p>
                                                        )}
                                                    </div>
                                                    <div className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs">
                                                        {food.category}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Blood Work History */}
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
                    </>
                )}
            </div>
        </div>
    );
}
