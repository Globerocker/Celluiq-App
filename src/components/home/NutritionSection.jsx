import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "../LanguageProvider";

export default function NutritionSection() {
  const { t } = useLanguage();
  const [basedOnBiomarkers, setBasedOnBiomarkers] = useState(true);
  const [showAffordable, setShowAffordable] = useState(false);
  const queryClient = useQueryClient();

  const { data: shoppingItems, isLoading } = useQuery({
    queryKey: ['shoppingItems'],
    queryFn: () => base44.entities.ShoppingItem.list('priority'),
    initialData: [],
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, checked }) => base44.entities.ShoppingItem.update(id, { checked }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingItems'] });
    },
  });

  const filteredItems = showAffordable 
    ? shoppingItems.filter(item => item.price_range === 'budget')
    : shoppingItems;

  const displayItems = filteredItems.slice(0, 8);
  const estimatedCost = displayItems.reduce((acc, item) => {
    const prices = { budget: 8, moderate: 15, premium: 24 };
    return acc + (prices[item.price_range] || 10);
  }, 0);

  const macros = [
    { label: 'Calories', value: '2400 kcal' },
    { label: t('protein'), value: '180g' },
    { label: t('carbs'), value: '240g' },
    { label: t('fats'), value: '80g' }
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-64 bg-white rounded-2xl animate-pulse" />
      </div>
    );
  }

  const isDark = !document.documentElement.classList.contains('light-mode');

  return (
    <div className="p-6 space-y-6">
      {/* Weekly Target */}
      <div className={`rounded-2xl p-5 shadow-sm ${isDark ? 'bg-[#111111] border border-[#1A1A1A]' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-[#666666]' : 'text-[#64676A]'}`}>Daily Nutrition Target</span>
          <TrendingUp className="w-4 h-4 text-[#3B7C9E]" />
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {macros.map((macro, index) => (
            <div key={index} className="text-center">
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#111315]'}`}>{macro.value}</div>
              <div className={`text-xs mt-1 ${isDark ? 'text-[#666666]' : 'text-[#64676A]'}`}>{macro.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Groceries Section */}
      <div className={`rounded-2xl p-5 shadow-sm ${isDark ? 'bg-[#111111] border border-[#1A1A1A]' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-[#111315]'}`}>Recommended Groceries</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-[#666666]' : 'text-[#64676A]'}`}>Good for your blood markers</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDark ? 'text-[#666666]' : 'text-[#64676A]'}`}>Cheap alternatives</span>
            <Switch 
              checked={showAffordable} 
              onCheckedChange={setShowAffordable}
              className="data-[state=checked]:bg-[#3B7C9E]"
            />
          </div>
        </div>
        <div className="space-y-2">
          {displayItems.map((item, index) => {
            const prices = { budget: 8, moderate: 15, premium: 24 };
            const price = prices[item.price_range] || 10;
            
            return (
              <div 
                key={index} 
                onClick={() => updateItemMutation.mutate({ id: item.id, checked: !item.checked })}
                className={`rounded-xl p-3 border transition-all cursor-pointer ${
                  isDark 
                    ? `bg-[#0A0A0A] border-[#1A1A1A] hover:border-[#3B7C9E] ${item.checked ? 'opacity-60' : ''}` 
                    : `bg-[#F6F7F5] border-[#E8E9E7] hover:border-[#3B7C9E] ${item.checked ? 'opacity-50' : ''}`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      item.checked 
                        ? 'bg-[#3B7C9E] border-[#3B7C9E]' 
                        : isDark ? 'border-[#333333]' : 'border-[#E8E9E7]'
                    }`}>
                      {item.checked && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-semibold transition-all ${
                        item.checked ? 'line-through opacity-60' : ''
                      } ${isDark ? 'text-white' : 'text-[#111315]'}`}>{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${isDark ? 'text-[#666666]' : 'text-[#64676A]'}`}>
                          {item.weekly_amount || 'N/A'}
                        </span>
                        {item.benefits && item.benefits.length > 0 && (
                          <>
                            <span className={`text-xs ${isDark ? 'text-[#333333]' : 'text-[#E8E9E7]'}`}>•</span>
                            <span className="text-xs text-[#3B7C9E]">{item.benefits[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className={`text-base font-bold transition-all ${
                      item.checked ? 'line-through opacity-60' : ''
                    } ${isDark ? 'text-white' : 'text-[#111315]'}`}>${price}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`rounded-2xl p-4 flex items-center justify-between shadow-sm ${isDark ? 'bg-[#111111] border border-[#1A1A1A]' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
          <ShoppingCart className={`w-5 h-5 ${isDark ? 'text-[#666666]' : 'text-[#64676A]'}`} />
          <span className={`text-sm ${isDark ? 'text-[#808080]' : 'text-[#64676A]'}`}>Total: ${estimatedCost}/week</span>
        </div>
        <button className="px-5 py-2 bg-[#B7323F] text-white rounded-xl font-medium hover:bg-[#9A2835] transition-all text-sm">
          Order Now
        </button>
      </div>
    </div>
  );
}