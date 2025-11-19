import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export default function NutritionSection() {
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

  const proteinItems = filteredItems.filter(item => item.category === 'protein');
  const estimatedCost = filteredItems.reduce((acc, item) => {
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
        <div className="h-64 bg-[#111111] rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Weekly Target */}
      <div className="bg-[#111111] rounded-2xl p-5 border border-[#1A1A1A]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-[#666666] uppercase tracking-wider">Weekly Target</span>
          <TrendingUp className="w-4 h-4 text-[#3B7C9E]" />
        </div>
        
        <div className="grid grid-cols-4 gap-3 mb-4">
          {macros.map((macro, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{macro.value}</div>
              <div className="text-xs text-[#666666]">{macro.label}</div>
              <div className="text-xs text-[#666666]">{macro.unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-[#111111] rounded-2xl p-4 flex items-center justify-between border border-[#1A1A1A]">
        <div className="flex items-center gap-3">
          <DollarSign className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-sm text-white">Show affordable alternatives</span>
        </div>
        <Switch 
          checked={showAffordable} 
          onCheckedChange={setShowAffordable}
          className="data-[state=checked]:bg-[#3B7C9E]"
        />
      </div>

      {/* Cost Estimate */}
      <div className="bg-[#111111] rounded-2xl p-4 flex items-center justify-between border border-[#1A1A1A]">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-5 h-5 text-[#666666]" />
          <span className="text-sm text-[#808080]">Estimated ${estimatedCost}/week</span>
        </div>
      </div>

      {/* Shopping List */}
      <div className="bg-[#111111] rounded-2xl p-5 border border-[#1A1A1A]">
        <h3 className="text-lg font-semibold text-white mb-4">Shopping List</h3>
        <div className="space-y-3">
          {filteredItems.map((item, index) => {
            const prices = { budget: 8, moderate: 15, premium: 24 };
            const price = prices[item.price_range] || 10;
            
            return (
              <div key={index} className="bg-[#0A0A0A] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={(checked) => updateItemMutation.mutate({ id: item.id, checked })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className={`font-medium text-white mb-1 ${item.checked ? 'line-through opacity-50' : ''}`}>
                          {item.name}
                        </h4>
                        {item.benefits && item.benefits.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.benefits.map((benefit, i) => (
                              <span key={i} className="text-xs text-[#666666] bg-[#111111] px-2 py-0.5 rounded">
                                {benefit}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-white">${price}</div>
                        <div className="text-xs text-[#3B7C9E]">Save ${Math.round(price * 0.15)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}