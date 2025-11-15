import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sunrise, Moon, Pill, ShoppingCart } from "lucide-react";

export default function SupplementStackSection() {
  const { data: medications, isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.filter({ active: true }),
    initialData: [],
  });

  const morningStack = medications.filter(m => 
    m.time_of_day?.includes('morning')
  );

  const eveningStack = medications.filter(m => 
    m.time_of_day?.includes('evening') || m.time_of_day?.includes('before_bed')
  );

  const StackCard = ({ title, items, icon: Icon, color }) => (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${color}15`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <h3 className="font-semibold text-[#111315]">{title}</h3>
            <p className="text-xs text-[#64676A]">{items.length} supplements</p>
          </div>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[#F6F7F5] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#B7323F]" />
                <div>
                  <p className="font-medium text-sm text-[#111315]">{item.name}</p>
                  <p className="text-xs text-[#64676A]">{item.dosage}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {item.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <div className="h-64 bg-white rounded-xl animate-pulse" />
        <div className="h-64 bg-white rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-[#64676A]">Your Daily Stack</h3>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#3B7C9E] text-white rounded-lg text-xs font-medium hover:bg-[#2F6380] transition-colors">
          <ShoppingCart className="w-3 h-3" />
          Reorder
        </button>
      </div>

      {medications.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="p-8 text-center">
            <Pill className="w-12 h-12 text-[#64676A] mx-auto mb-3 opacity-50" />
            <p className="text-[#64676A]">No supplements yet</p>
            <p className="text-xs text-[#64676A] mt-1">Upload your blood test to get personalized recommendations</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <StackCard 
            title="Morning Stack" 
            items={morningStack}
            icon={Sunrise}
            color="text-amber-500"
          />
          
          <StackCard 
            title="Evening Stack" 
            items={eveningStack}
            icon={Moon}
            color="text-[#3B7C9E]"
          />

          <Card className="border-none shadow-sm bg-[#3B7C9E15]">
            <CardContent className="p-4">
              <p className="text-sm text-[#111315] font-medium mb-2">💡 Optimization Tip</p>
              <p className="text-xs text-[#64676A] leading-relaxed">
                Based on your latest blood markers, consider adding Vitamin D3 (5000 IU) to your morning stack for optimal levels.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}