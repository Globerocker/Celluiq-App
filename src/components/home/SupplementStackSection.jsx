import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Sunrise, Moon, Pill, Package } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-64 bg-[#111111] rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {medications.length === 0 ? (
        <div className="text-center py-12">
          <Pill className="w-12 h-12 text-[#333333] mx-auto mb-3" />
          <p className="text-[#808080]">No supplements yet</p>
        </div>
      ) : (
        <>
          {/* 30-Day Supply Card */}
          <div className="bg-[#111111] rounded-2xl p-6 text-center border border-[#1A1A1A]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-[#666666] uppercase tracking-wider">30-Day Supply</span>
              <span className="text-xs text-[#3B7C9E]">Next recalibration<br/>88 days</span>
            </div>
            
            <div className="w-48 h-48 mx-auto bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] rounded-3xl flex items-center justify-center my-6 shadow-xl relative overflow-hidden">
              <Package className="w-24 h-24 text-white opacity-80 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            <p className="text-xs text-[#666666] mb-4">Personalized supplement blend</p>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <p className="text-xs text-[#666666] mb-2">Daily intake progress</p>
              <div className="h-2 bg-[#0A0A0A] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#B7323F] to-[#3B7C9E] transition-all duration-500" style={{ width: '45%' }} />
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-[#808080]">
              <Sunrise className="w-4 h-4" />
              <span>Take with breakfast</span>
            </div>
          </div>
          
          {/* What's Inside */}
          <div className="bg-[#111111] rounded-2xl p-5 border border-[#1A1A1A]">
            <h3 className="font-semibold text-white mb-3">What's included</h3>
            <div className="space-y-2 text-sm text-[#808080]">
              <p>✓ Essential vitamins & minerals</p>
              <p>✓ Omega-3 fatty acids</p>
              <p>✓ Adaptogenic herbs</p>
              <p>✓ Antioxidant complex</p>
            </div>
          </div>
          
          {/* Additional Supplements */}
          <div className="bg-[#3B7C9E15] rounded-xl p-4 border border-[#3B7C9E30]">
            <h4 className="font-semibold text-[#3B7C9E] mb-2 text-sm">Recommended Add-ons</h4>
            <p className="text-xs text-[#808080] mb-3">Based on your biomarkers, consider adding:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white">Creatine Monohydrate</span>
                <span className="text-xs text-[#666666]">5g daily</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white">Vitamin B Complex</span>
                <span className="text-xs text-[#666666]">1 capsule</span>
              </div>
            </div>
          </div>


        </>
      )}
    </div>
  );
}