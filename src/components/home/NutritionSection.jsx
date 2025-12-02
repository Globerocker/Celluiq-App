import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Clock, ChevronRight, Sparkles, Utensils } from "lucide-react";
import { useLanguage } from "../LanguageProvider";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import FoodDetailModal from "../modals/FoodDetailModal";

export default function NutritionSection() {
  const { t } = useLanguage();
  const [selectedFood, setSelectedFood] = useState(null);

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
    protein: t('protein'),
    vegetables: t('vegetables'),
    fruits: t('fruits'),
    grains: t('grains'),
    dairy: t('dairy'),
    fats: t('healthyFats'),
    nuts_seeds: t('nutsSeeds'),
    legumes: t('legumes'),
    seafood: t('seafood'),
    herbs_spices: t('herbsSpices'),
    beverages: t('beverages'),
    other: t('other')
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
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <Utensils className="w-10 h-10" style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{t('noRecommendationsYet')}</h2>
          <p className="max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {t('uploadBloodworkSupplements')}
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
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{t('nutritionRecommendation')}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('basedOnBiomarkers')}
              </p>
            </div>
          </div>
        </div>

        <Link to={createPageUrl("ShoppingList")}>
          <Button className="w-full mt-6 bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 rounded-xl">
            <ShoppingCart className="w-5 h-5 mr-2" />
            {t('generateShoppingList')}
            <ChevronRight className="w-5 h-5 ml-auto" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {selectedFood && (
        <FoodDetailModal food={selectedFood} onClose={() => setSelectedFood(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{t('nutrition')}</h2>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{t('basedOnBiomarkers')}</p>
        </div>
      </div>

      {/* Personalized Note */}
      {suboptimalMarkers.length > 0 && (
        <div className="bg-gradient-to-r from-[#3B7C9E20] to-[#3B7C9E10] border border-[#3B7C9E30] rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#3B7C9E] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t('personalizedForYou')}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {suboptimalMarkers.length} {t('markersNeedAttention')}
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
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{categoryLabels[category]}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {foods.slice(0, 4).map((food) => (
                <button 
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className="rounded-xl p-4 border transition-colors text-left w-full"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{food.food_name}</h4>
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>{food.primary_benefits}</p>
                      
                      {food.influenced_markers && (
                        <p className="text-[#3B7C9E] text-xs mt-2 line-clamp-1">
                          {food.influenced_markers}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {food.daily_dosage || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Shopping List CTA */}
      <Link to={createPageUrl("ShoppingList")}>
        <Button className="w-full mt-6 bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 rounded-xl">
          <ShoppingCart className="w-5 h-5 mr-2" />
          {t('generateShoppingList')}
          <ChevronRight className="w-5 h-5 ml-auto" />
        </Button>
      </Link>
    </div>
  );
}