import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Clock, ChevronRight, Sparkles, Utensils } from "lucide-react";
import { useLanguage } from "../LanguageProvider";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function NutritionSection() {
  const { t } = useLanguage();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: foodReferences = [], isLoading } = useQuery({
    queryKey: ['foodReferences'],
    queryFn: () => base44.entities.FoodReference.list(),
  });

  const { data: bloodMarkers = [] } = useQuery({
    queryKey: ['bloodMarkers'],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
  });

  // Get latest markers
  const latestMarkers = bloodMarkers.reduce((acc, marker) => {
    if (!acc[marker.marker_name] || new Date(marker.test_date) > new Date(acc[marker.marker_name].test_date)) {
      acc[marker.marker_name] = marker;
    }
    return acc;
  }, {});

  // Get user's suboptimal markers
  const suboptimalMarkers = Object.values(latestMarkers).filter(m => 
    m.status === 'suboptimal' || m.status === 'low' || m.status === 'high' || m.status === 'critical'
  );

  // Filter foods based on user's markers and gender
  const getRecommendedFoods = () => {
    let foods = [...foodReferences];
    
    if (user?.gender) {
      foods = foods.filter(f => f.gender === 'both' || f.gender === user.gender);
    }

    if (suboptimalMarkers.length > 0) {
      const markerNames = suboptimalMarkers.map(m => m.marker_name.toLowerCase());
      
      foods = foods.sort((a, b) => {
        const aInfluences = markerNames.some(m => 
          (a.influenced_markers || '').toLowerCase().includes(m)
        );
        const bInfluences = markerNames.some(m => 
          (b.influenced_markers || '').toLowerCase().includes(m)
        );
        if (aInfluences && !bInfluences) return -1;
        if (!aInfluences && bInfluences) return 1;
        return 0;
      });
    }

    return foods.slice(0, 12);
  };

  const recommendedFoods = getRecommendedFoods();

  const foodsByCategory = recommendedFoods.reduce((acc, food) => {
    const cat = food.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(food);
    return acc;
  }, {});

  const categoryIcons = {
    protein: '🥩',
    vegetables: '🥬',
    fruits: '🍎',
    grains: '🌾',
    dairy: '🥛',
    fats: '🥑',
    nuts_seeds: '🥜',
    legumes: '🫘',
    seafood: '🐟',
    herbs_spices: '🌿',
    beverages: '🍵',
    other: '🍽️'
  };

  const categoryLabels = {
    protein: 'Protein',
    vegetables: 'Gemüse',
    fruits: 'Obst',
    grains: 'Getreide',
    dairy: 'Milchprodukte',
    fats: 'Gesunde Fette',
    nuts_seeds: 'Nüsse & Samen',
    legumes: 'Hülsenfrüchte',
    seafood: 'Meeresfrüchte',
    herbs_spices: 'Kräuter & Gewürze',
    beverages: 'Getränke',
    other: 'Sonstige'
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#111111] rounded-2xl p-4 animate-pulse">
            <div className="h-6 bg-[#1A1A1A] rounded w-1/3 mb-2" />
            <div className="h-4 bg-[#1A1A1A] rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state - no blood markers
  if (Object.keys(latestMarkers).length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-6">
            <Utensils className="w-10 h-10 text-[#666666]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Noch keine Empfehlungen</h2>
          <p className="text-[#808080] max-w-sm mx-auto">
            Lade dein Blutbild hoch, um personalisierte Ernährungsempfehlungen zu erhalten.
          </p>
        </div>
      </div>
    );
  }

  // No food references in database
  if (foodReferences.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-r from-[#3B7C9E20] to-[#3B7C9E10] border border-[#3B7C9E30] rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-[#3B7C9E] shrink-0" />
            <div>
              <h3 className="text-white font-semibold mb-2">Ernährungsempfehlungen</h3>
              <p className="text-[#808080] text-sm">
                Basierend auf deinen {suboptimalMarkers.length} suboptimalen Markern können wir dir 
                personalisierte Ernährungsempfehlungen geben. Die Datenbank wird gerade aufgebaut.
              </p>
            </div>
          </div>
        </div>

        <Link to={createPageUrl("ShoppingList")}>
          <Button className="w-full mt-6 bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 rounded-xl">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Einkaufsliste generieren
            <ChevronRight className="w-5 h-5 ml-auto" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">{t('nutrition')}</h2>
          <p className="text-[#666666] text-sm">{t('basedOnBiomarkers')}</p>
        </div>
      </div>

      {/* Personalized Note */}
      {suboptimalMarkers.length > 0 && (
        <div className="bg-gradient-to-r from-[#3B7C9E20] to-[#3B7C9E10] border border-[#3B7C9E30] rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#3B7C9E] shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm font-medium mb-1">Personalisiert für dich</p>
              <p className="text-[#808080] text-xs">
                Basierend auf {suboptimalMarkers.length} Markern die Aufmerksamkeit brauchen
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Food Categories */}
      <div className="space-y-6">
        {Object.entries(foodsByCategory).map(([category, foods]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{categoryIcons[category]}</span>
              <h3 className="text-white font-semibold">{categoryLabels[category]}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {foods.slice(0, 4).map((food) => (
                <div 
                  key={food.id}
                  className="bg-[#111111] rounded-xl p-4 border border-[#1A1A1A]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{food.food_name}</h4>
                      <p className="text-[#666666] text-xs mt-1">{food.primary_benefits}</p>
                      
                      {food.influenced_markers && (
                        <p className="text-[#3B7C9E] text-xs mt-2">
                          {food.influenced_markers}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-[#808080] text-xs">
                        <div className="flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {food.daily_dosage || '-'}
                        </div>
                        {food.best_time && food.best_time !== 'anytime' && (
                          <p className="text-[#666666] mt-1 capitalize">{food.best_time.replace('_', ' ')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {food.combinations && (
                    <div className="mt-3 pt-3 border-t border-[#1A1A1A]">
                      <p className="text-[#666666] text-xs">
                        <span className="text-[#808080]">Kombiniere mit:</span> {food.combinations}
                      </p>
                    </div>
                  )}
                  
                  {food.warnings && food.warnings !== 'None' && (
                    <p className="text-yellow-500/80 text-xs mt-2">⚠️ {food.warnings}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Shopping List CTA */}
      <Link to={createPageUrl("ShoppingList")}>
        <Button className="w-full mt-6 bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 rounded-xl">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Einkaufsliste generieren
          <ChevronRight className="w-5 h-5 ml-auto" />
        </Button>
      </Link>
    </div>
  );
}