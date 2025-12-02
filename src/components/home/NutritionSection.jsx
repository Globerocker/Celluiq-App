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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  React.useEffect(() => {
    const handleThemeChange = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);
  
  const isDark = theme === 'dark';

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

  const categoryLabelKeys = {
    protein: 'proteinCat',
    vegetables: 'vegetablesCat',
    fruits: 'fruitsCat',
    grains: 'grainsCat',
    dairy: 'dairyCat',
    fats: 'fatsCat',
    nuts_seeds: 'nutsSeeds',
    legumes: 'legumesCat',
    seafood: 'seafoodCat',
    herbs_spices: 'herbsSpices',
    beverages: 'beveragesCat',
    other: 'otherCat'
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
          <h2 className="text-xl font-bold text-white mb-3">{t('noRecommendationsNutrition')}</h2>
          <p className="text-[#808080] max-w-sm mx-auto">
            {t('uploadForNutrition')}
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
              <h3 className="text-white font-semibold mb-2">{t('nutritionRecommendations')}</h3>
              <p className="text-[#808080] text-sm">
                {t('databaseBeingBuilt')}
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

  // Count only user's uploaded markers
  const userMarkerCount = Object.keys(latestMarkers).length;

  return (
    <div className={`p-6 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F8FAFC]'}`}>
      {selectedFood && (
        <FoodDetailModal food={selectedFood} onClose={() => setSelectedFood(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{t('nutrition')}</h2>
          <p className={`text-sm ${isDark ? 'text-[#666666]' : 'text-[#64748B]'}`}>{t('basedOnBiomarkers')}</p>
        </div>
      </div>



      {/* Food Categories */}
      <div className="space-y-6">
        {Object.entries(foodsByCategory).map(([category, foods]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{categoryIcons[category]}</span>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{t(categoryLabelKeys[category])}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {foods.slice(0, 4).map((food) => (
                <button 
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className={`rounded-xl p-4 border transition-colors text-left w-full ${
                    isDark 
                      ? 'bg-[#111111] border-[#1A1A1A] hover:border-[#333333]' 
                      : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{food.food_name}</h4>
                      <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-[#666666]' : 'text-[#64748B]'}`}>{food.primary_benefits}</p>
                      
                      {food.influenced_markers && (
                        <p className="text-[#3B7C9E] text-xs mt-2 line-clamp-1">
                          {food.influenced_markers}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className={`text-xs ${isDark ? 'text-[#808080]' : 'text-[#64748B]'}`}>
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