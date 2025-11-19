import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function NutritionSection() {
  const [basedOnBiomarkers, setBasedOnBiomarkers] = useState(true);
  const [showAffordable, setShowAffordable] = useState(false);
  const queryClient = useQueryClient();

  const { data: shoppingItems, isLoading } = useQuery({
    queryKey: ['shoppingItems'],
    queryFn: () => base44.entities.ShoppingItem.list('priority'),
    initialData: [],
  });

  const filteredItems = showAffordable 
    ? shoppingItems.filter(item => item.price_range === 'budget')
    : shoppingItems;

  const proteinItems = filteredItems.filter(item => item.category === 'protein').slice(0, 3);
  const estimatedCost = proteinItems.reduce((acc, item) => {
    const prices = { budget: 8, moderate: 15, premium: 24 };
    return acc + (prices[item.price_range] || 10);
  }, 0);

  const macros = [
    { label: 'Calories', value: '2400', unit: 'kcal' },
    { label: 'Protein', value: '180', unit: 'g' },
    { label: 'Carbs', value: '240', unit: 'g' },
    { label: 'Fat', value: '80', unit: 'g' }
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
          <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-[#666666]' : 'text-[#64676A]'}`}>{t('weeklyTarget')}</span>
          <TrendingUp className="w-4 h-4 text-[#3B7C9E]" />
        </div>
        
        <div className="grid grid-cols-4 gap-3 mb-4">
          {macros.map((macro, index) => (
            <div key={index} className="text-center">
              <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-[#111315]'}`}>{macro.value}</div>
              <div className={`text-xs ${isDark ? 'text-[#666666]' : 'text-[#64676A]'}`}>{macro.label}</div>
              <div className={`text-xs ${isDark ? 'text-[#666666]' : 'text-[#64676A]'}`}>{macro.unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-3">
        <div className={`rounded-2xl p-4 flex items-center justify-between shadow-sm ${isDark ? 'bg-[#111111] border border-[#1A1A1A]' : 'bg-white'}`}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#3B7C9E]" />
            <span className={`text-sm ${isDark ? 'text-white' : 'text-[#111315]'}`}>{t('basedOnBiomarkers')}</span>
          </div>
          <Switch 
            checked={basedOnBiomarkers} 
            onCheckedChange={setBasedOnBiomarkers}
            className="data-[state=checked]:bg-[#3B7C9E]"
          />
        </div>

        <div className={`rounded-2xl p-4 flex items-center justify-between shadow-sm ${isDark ? 'bg-[#111111] border border-[#1A1A1A]' : 'bg-white'}`}>
          <div className="flex items-center gap-3">
            <DollarSign className="w-4 h-4 text-[#F59E0B]" />
            <span className={`text-sm ${isDark ? 'text-white' : 'text-[#111315]'}`}>{t('showAffordable')}</span>
          </div>
          <Switch 
            checked={showAffordable} 
            onCheckedChange={setShowAffordable}
            className="data-[state=checked]:bg-[#3B7C9E]"
          />
        </div>
      </div>

      {/* Cost Estimate */}
      <div className={`rounded-2xl p-4 flex items-center justify-between shadow-sm ${isDark ? 'bg-[#111111] border border-[#1A1A1A]' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
          <ShoppingCart className={`w-5 h-5 ${isDark ? 'text-[#666666]' : 'text-[#64676A]'}`} />
          <span className={`text-sm ${isDark ? 'text-[#808080]' : 'text-[#64676A]'}`}>{t('estimatedCost')} ${estimatedCost}/week</span>
        </div>
      </div>

      {/* Protein Recommendations */}
      <div className={`rounded-2xl p-5 shadow-sm ${isDark ? 'bg-[#111111] border border-[#1A1A1A]' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-[#111315]'}`}>{t('protein')}</h3>
        <div className="space-y-3">
          {proteinItems.map((item, index) => {
            const prices = { budget: 8, moderate: 15, premium: 24 };
            const price = prices[item.price_range] || 10;
            
            return (
              <div 
                key={index} 
                onClick={() => updateItemMutation.mutate({ id: item.id, checked: !item.checked })}
                className={`rounded-xl p-4 border transition-all cursor-pointer ${
                  isDark 
                    ? `bg-[#0A0A0A] border-[#1A1A1A] hover:border-[#3B7C9E] ${item.checked ? 'opacity-60' : ''}` 
                    : `bg-[#F6F7F5] border-[#E8E9E7] hover:border-[#3B7C9E] ${item.checked ? 'opacity-50' : ''}`
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      item.checked 
                        ? 'bg-[#3B7C9E] border-[#3B7C9E]' 
                        : isDark ? 'border-[#333333]' : 'border-[#E8E9E7]'
                    }`}>
                      {item.checked && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-2 transition-all ${
                        item.checked ? 'line-through opacity-60' : ''
                      } ${isDark ? 'text-white' : 'text-[#111315]'}`}>{item.name}</h4>
                      {item.benefits && item.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.benefits.map((benefit, i) => (
                            <span key={i} className={`text-xs px-2 py-0.5 rounded border ${
                              isDark 
                                ? 'text-[#666666] bg-[#111111] border-[#1A1A1A]' 
                                : 'text-[#64676A] bg-white border-[#E8E9E7]'
                            }`}>
                              {benefit}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-xl font-bold transition-all ${
                      item.checked ? 'line-through opacity-60' : ''
                    } ${isDark ? 'text-white' : 'text-[#111315]'}`}>${price}</div>
                    <div className="text-xs text-[#3B7C9E]">-15%</div>
                  </div>
                </div>
                
                <div className={`grid grid-cols-2 gap-3 pt-3 border-t ${isDark ? 'border-[#1A1A1A]' : 'border-[#E8E9E7]'}`}>
                  <div>
                    <p className={`text-xs mb-1 ${isDark ? 'text-[#666666]' : 'text-[#64676A]'}`}>{t('weeklyAmount')}</p>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-[#111315]'}`}>{item.weekly_amount || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${isDark ? 'text-[#666666]' : 'text-[#64676A]'}`}>{t('dailyRecommendation')}</p>
                    <p className="text-sm font-medium text-[#3B7C9E]">{item.daily_recommendation || 'N/A'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button className="w-full py-4 bg-[#B7323F] text-white rounded-2xl font-medium hover:bg-[#9A2835] transition-all">
        {t('addToShoppingList')}
      </button>
    </div>
  );
}