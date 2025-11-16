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
        <div className="h-64 bg-[#1A1A1A] rounded-2xl animate-pulse" />
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
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-2xl p-6 text-center">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-[#666666] uppercase tracking-wider">30-Day Supply</span>
              <span className="text-xs text-[#3B7C9E]">Next recalibration<br/>88 days</span>
            </div>
            
            <div className="w-48 h-48 mx-auto bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] rounded-3xl flex items-center justify-center my-6 shadow-2xl">
              <Package className="w-24 h-24 text-white opacity-80" />
            </div>
            
            <p className="text-xs text-[#666666] mb-4">Drag to rotate</p>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <p className="text-xs text-[#666666] mb-2">Daily intake progress</p>
              <div className="h-2 bg-[#0A0A0A] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#B7323F] to-[#3B7C9E]" style={{ width: '45%' }} />
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-[#808080]">
              <Sunrise className="w-4 h-4" />
              <span>Take with breakfast</span>
            </div>
          </div>

          {/* Morning Stack */}
          {morningStack.length > 0 && (
            <div className="bg-[#1A1A1A] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-[#F59E0B15]">
                  <Sunrise className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Morning Stack</h3>
                  <p className="text-xs text-[#666666]">{morningStack.length} supplements</p>
                </div>
              </div>
              <div className="space-y-2">
                {morningStack.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#B7323F]" />
                      <div>
                        <p className="font-medium text-sm text-white">{item.name}</p>
                        <p className="text-xs text-[#666666]">{item.dosage}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#666666] px-2 py-1 bg-[#1A1A1A] rounded-lg">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evening Stack */}
          {eveningStack.length > 0 && (
            <div className="bg-[#1A1A1A] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-[#3B7C9E15]">
                  <Moon className="w-5 h-5 text-[#3B7C9E]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Evening Stack</h3>
                  <p className="text-xs text-[#666666]">{eveningStack.length} supplements</p>
                </div>
              </div>
              <div className="space-y-2">
                {eveningStack.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#B7323F]" />
                      <div>
                        <p className="font-medium text-sm text-white">{item.name}</p>
                        <p className="text-xs text-[#666666]">{item.dosage}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#666666] px-2 py-1 bg-[#1A1A1A] rounded-lg">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}