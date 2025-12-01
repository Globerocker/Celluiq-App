import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Sunrise, Moon, Pill, Package, Lock, Sparkles } from "lucide-react";
import ProUpgradeModal from '../ProUpgradeModal';

export default function SupplementStackSection() {
  const [showProModal, setShowProModal] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: medications, isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.filter({ active: true }),
    initialData: [],
  });

  const isPro = user?.subscription_tier === 'pro';

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
      <ProUpgradeModal 
        isOpen={showProModal} 
        onClose={() => setShowProModal(false)} 
        feature="evening supplements"
      />

      {/* Coming Soon Teaser */}
      <div className="bg-gradient-to-r from-[#B7323F20] to-[#3B7C9E20] rounded-2xl p-4 border border-[#B7323F30]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B7323F] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">AM/PM Stack Coming Soon</p>
            <p className="text-[#808080] text-xs">Personalized 30-day supplement packs delivered to your door</p>
          </div>
        </div>
      </div>

      {/* Morning Stack */}
      <div className="bg-[#111111] rounded-2xl p-5 border border-[#1A1A1A]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
            <Sunrise className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Morning Stack</h3>
            <p className="text-[#666666] text-xs">Take with breakfast</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {morningStack.length > 0 ? morningStack.map((med, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                  <Pill className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{med.name}</p>
                  <p className="text-[#666666] text-xs">{med.dosage}</p>
                </div>
              </div>
            </div>
          )) : (
            <>
              <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                    <Pill className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Vitamin D3</p>
                    <p className="text-[#666666] text-xs">5000 IU</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                    <Pill className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Omega-3</p>
                    <p className="text-[#666666] text-xs">1000mg EPA/DHA</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                    <Pill className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Magnesium</p>
                    <p className="text-[#666666] text-xs">400mg Glycinate</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Evening Stack - Locked for Free Users */}
      {isPro ? (
        <div className="bg-[#111111] rounded-2xl p-5 border border-[#1A1A1A]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Evening Stack</h3>
              <p className="text-[#666666] text-xs">Take before bed</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {eveningStack.length > 0 ? eveningStack.map((med, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                    <Pill className="w-4 h-4 text-[#6366F1]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{med.name}</p>
                    <p className="text-[#666666] text-xs">{med.dosage}</p>
                  </div>
                </div>
              </div>
            )) : (
              <>
                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                      <Pill className="w-4 h-4 text-[#6366F1]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Zinc</p>
                      <p className="text-[#666666] text-xs">30mg</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                      <Pill className="w-4 h-4 text-[#6366F1]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Ashwagandha</p>
                      <p className="text-[#666666] text-xs">600mg KSM-66</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setShowProModal(true)}
          className="relative rounded-2xl p-5 bg-[#111111] border border-[#1A1A1A] cursor-pointer hover:border-[#B7323F] transition-all group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent z-10" />
          
          {/* Blurred preview content */}
          <div className="blur-sm opacity-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center">
                <Moon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Evening Stack</h3>
                <p className="text-[#666666] text-xs">Take before bed</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-[#0A0A0A] rounded-xl h-14" />
              <div className="p-3 bg-[#0A0A0A] rounded-xl h-14" />
            </div>
          </div>
          
          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div className="w-12 h-12 rounded-full bg-[#B7323F20] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6 text-[#B7323F]" />
            </div>
            <p className="text-white font-semibold text-sm">Evening Stack</p>
            <p className="text-[#B7323F] text-xs font-medium mt-1">PRO • $9/mo</p>
          </div>
        </div>
      )}
          
          {/* Recommended Add-ons */}
          <div className="bg-[#3B7C9E15] rounded-xl p-4 border border-[#3B7C9E30]">
            <h4 className="font-semibold text-[#3B7C9E] mb-2 text-sm">Recommended Add-ons</h4>
            <p className="text-xs text-[#808080] mb-3">Based on your biomarkers:</p>
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