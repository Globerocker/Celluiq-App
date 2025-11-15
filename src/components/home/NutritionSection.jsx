import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, DollarSign, Check } from "lucide-react";

export default function NutritionSection() {
  const [priceFilter, setPriceFilter] = useState("all");
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

  const filteredItems = priceFilter === "all" 
    ? shoppingItems 
    : shoppingItems.filter(item => item.price_range === priceFilter);

  const checkedCount = shoppingItems.filter(item => item.checked).length;

  const categoryIcons = {
    protein: '🥩',
    vegetables: '🥬',
    fruits: '🍎',
    grains: '🌾',
    dairy: '🥛',
    fats: '🥑',
    supplements: '💊',
    other: '🛒'
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-medium text-[#64676A]">Shopping List</h3>
          <p className="text-xs text-[#64676A]">{checkedCount}/{shoppingItems.length} items checked</p>
        </div>
        <Tabs value={priceFilter} onValueChange={setPriceFilter}>
          <TabsList className="bg-white border border-[#24272A1A]">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="budget" className="text-xs">Budget</TabsTrigger>
            <TabsTrigger value="premium" className="text-xs">Premium</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="p-8 text-center">
            <ShoppingCart className="w-12 h-12 text-[#64676A] mx-auto mb-3 opacity-50" />
            <p className="text-[#64676A]">No items in your list</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, index) => (
            <Card key={index} className={`border-none shadow-sm transition-all ${
              item.checked ? 'opacity-60' : 'hover:shadow-md'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={(checked) => 
                      updateItemMutation.mutate({ id: item.id, checked })
                    }
                    className="w-5 h-5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{categoryIcons[item.category]}</span>
                      <h4 className={`font-semibold text-[#111315] ${
                        item.checked ? 'line-through' : ''
                      }`}>
                        {item.name}
                      </h4>
                    </div>
                    {item.benefits && item.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.benefits.slice(0, 2).map((benefit, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Badge 
                    className={`flex-shrink-0 ${
                      item.price_range === 'budget' 
                        ? 'bg-[#3B7C9E] text-white' 
                        : item.price_range === 'moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-[#B7323F15] text-[#B7323F]'
                    }`}
                  >
                    {item.price_range === 'budget' ? '💰' : item.price_range === 'moderate' ? '💵' : '💎'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button 
        className="w-full bg-[#B7323F] hover:bg-[#9A2835] text-white"
        disabled={checkedCount === 0}
      >
        <Check className="w-4 h-4 mr-2" />
        Clear Checked Items ({checkedCount})
      </Button>
    </div>
  );
}