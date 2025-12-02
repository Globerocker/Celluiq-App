import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ChevronLeft, 
  Check, 
  Plus, 
  ShoppingCart,
  Sparkles,
  Loader2
} from "lucide-react";

export default function ShoppingList() {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: shoppingItems = [], isLoading } = useQuery({
    queryKey: ['shoppingItems'],
    queryFn: () => base44.entities.ShoppingItem.list(),
  });

  const { data: foodReferences = [] } = useQuery({
    queryKey: ['foodReferences'],
    queryFn: () => base44.entities.FoodReference.list(),
  });

  const { data: bloodMarkers = [] } = useQuery({
    queryKey: ['bloodMarkers'],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
  });

  const toggleItemMutation = useMutation({
    mutationFn: ({ id, checked }) => base44.entities.ShoppingItem.update(id, { checked }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingItems'] }),
  });

  const generateListMutation = useMutation({
    mutationFn: async () => {
      // Get suboptimal markers
      const suboptimalMarkers = bloodMarkers.filter(m => 
        m.status === 'suboptimal' || m.status === 'low' || m.status === 'high'
      );
      
      // Filter foods based on user's needs
      let relevantFoods = foodReferences.filter(f => 
        f.gender === 'both' || f.gender === user?.gender
      );
      
      // Prioritize foods for suboptimal markers
      if (suboptimalMarkers.length > 0) {
        const markerNames = suboptimalMarkers.map(m => m.marker_name.toLowerCase());
        relevantFoods = relevantFoods.filter(f => 
          markerNames.some(m => (f.influenced_markers || '').toLowerCase().includes(m))
        );
      }
      
      // Take top 15 foods
      const selectedFoods = relevantFoods.slice(0, 15);
      
      // Create shopping items
      const items = selectedFoods.map(food => ({
        name: food.food_name,
        category: food.category || 'other',
        benefits: food.influenced_markers ? [food.influenced_markers] : [],
        price_range: 'moderate',
        checked: false,
        weekly_amount: food.weekly_dosage || food.daily_dosage,
        daily_recommendation: food.daily_dosage
      }));
      
      // Clear existing and create new
      const existingItems = await base44.entities.ShoppingItem.list();
      for (const item of existingItems) {
        await base44.entities.ShoppingItem.delete(item.id);
      }
      
      if (items.length > 0) {
        await base44.entities.ShoppingItem.bulkCreate(items);
      }
      
      return items;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingItems'] });
      setGenerating(false);
    }
  });

  const handleGenerate = async () => {
    setGenerating(true);
    generateListMutation.mutate();
  };

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

  const groupedItems = shoppingItems.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const checkedCount = shoppingItems.filter(i => i.checked).length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-8">
      {/* Header */}
      <div className="bg-[#111111] border-b border-[#1A1A1A] px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" size="icon" className="text-[#808080] hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Shopping List</h1>
            <p className="text-[#666666] text-sm">
              {checkedCount}/{shoppingItems.length} items
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {/* Generate Button */}
        {shoppingItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-[#666666]" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-2">No shopping list yet</h2>
            <p className="text-[#666666] text-sm mb-6 max-w-xs mx-auto">
              Generate a personalized shopping list based on your biomarkers
            </p>
            <Button 
              onClick={handleGenerate}
              disabled={generating}
              className="bg-[#B7323F] hover:bg-[#9A2835] text-white px-8"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate List
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Regenerate Button */}
            <Button 
              onClick={handleGenerate}
              disabled={generating}
              variant="outline"
              className="w-full mb-6 bg-[#1A1A1A] border-[#333333] text-white hover:bg-[#222222]"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Regenerate List
                </>
              )}
            </Button>

            {/* Shopping Items by Category */}
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{categoryIcons[category]}</span>
                    <h3 className="text-white font-semibold capitalize">
                      {category.replace('_', ' ')}
                    </h3>
                    <span className="text-[#666666] text-sm">
                      ({items.filter(i => i.checked).length}/{items.length})
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleItemMutation.mutate({ 
                          id: item.id, 
                          checked: !item.checked 
                        })}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                          item.checked 
                            ? 'bg-[#0A0A0A] border-[#1A1A1A] opacity-60' 
                            : 'bg-[#111111] border-[#1A1A1A] hover:border-[#333333]'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          item.checked 
                            ? 'bg-[#3B7C9E] border-[#3B7C9E]' 
                            : 'border-[#333333]'
                        }`}>
                          {item.checked && <Check className="w-4 h-4 text-white" />}
                        </div>
                        
                        <div className="flex-1">
                          <p className={`font-medium ${item.checked ? 'line-through text-[#666666]' : 'text-white'}`}>
                            {item.name}
                          </p>
                          {item.weekly_amount && (
                            <p className="text-[#666666] text-xs mt-0.5">
                              {item.weekly_amount}
                            </p>
                          )}
                        </div>
                        
                        {item.benefits?.[0] && (
                          <span className="text-[#3B7C9E] text-xs bg-[#3B7C9E20] px-2 py-1 rounded-full max-w-[120px] truncate">
                            {item.benefits[0]}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}