import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Sunrise, Moon, Pill, Lock, Sparkles, ShoppingCart, ChevronRight } from "lucide-react";
import { useLanguage } from '../LanguageProvider';
import ProUpgradeModal from '../ProUpgradeModal';
import SupplementDetailModal from '../modals/SupplementDetailModal';
import { Button } from "@/components/ui/button";

export default function SupplementStackSection() {
  const { t } = useLanguage();
  const [showProModal, setShowProModal] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState(null);
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.filter({ active: true }),
  });

  const { data: markerReferences = [] } = useQuery({
    queryKey: ['markerReferences'],
    queryFn: () => base44.entities.BloodMarkerReference.list(),
  });

  const { data: bloodMarkers = [] } = useQuery({
    queryKey: ['bloodMarkers'],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
  });

  const isPro = user?.subscription_tier === 'pro';

  // Get suboptimal markers
  const latestMarkers = bloodMarkers.reduce((acc, marker) => {
    if (!acc[marker.marker_name] || new Date(marker.test_date) > new Date(acc[marker.marker_name].test_date)) {
      acc[marker.marker_name] = marker;
    }
    return acc;
  }, {});

  const suboptimalMarkers = Object.values(latestMarkers).filter(m => 
    m.status === 'suboptimal' || m.status === 'low' || m.status === 'high' || m.status === 'critical'
  );

  // Get supplement recommendations from reference data
  const getRecommendedSupplements = () => {
    const recommendations = [];
    
    suboptimalMarkers.forEach(marker => {
      const reference = markerReferences.find(ref => 
        ref.marker_name?.toLowerCase() === marker.marker_name?.toLowerCase() ||
        ref.short_name?.toLowerCase() === marker.marker_name?.toLowerCase()
      );
      
      if (reference) {
        const isLow = marker.status === 'low' || marker.status === 'critical' || 
          (marker.value < (reference.celluiq_range_min ?? reference.clinical_range_min ?? 0));
        const supplement = isLow ? reference.supplement_low : reference.supplement_high;
        const dosage = isLow ? reference.dosage_low : reference.dosage_high;
        const form = isLow ? reference.form_low : reference.form_high;
        
        if (supplement && supplement !== 'N/A' && supplement !== 'None standard' && supplement.trim()) {
          if (!recommendations.find(r => r.name === supplement)) {
            recommendations.push({
              name: supplement,
              dosage,
              form,
              forMarker: marker.marker_name,
              status: marker.status
            });
          }
        }
      }
    });
    
    return recommendations.slice(0, 6);
  };

  const recommendedSupplements = getRecommendedSupplements();

  const morningStack = medications.filter(m => m.time_of_day?.includes('morning'));
  const eveningStack = medications.filter(m => m.time_of_day?.includes('evening') || m.time_of_day?.includes('before_bed'));

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-64 bg-[#111111] rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Empty state - no blood markers
  if (Object.keys(latestMarkers).length === 0) {
    return (
      <div className="p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <Pill className="w-10 h-10" style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{t('noRecommendationsYetSupp')}</h2>
          <p className="max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {t('uploadBloodForSupplements')}
          </p>
        </div>
      </div>
    );
  }

  // Find reference for selected supplement
  const getSupplementReference = (supp) => {
    if (!supp) return null;
    return markerReferences.find(ref => 
      ref.marker_name?.toLowerCase() === supp.forMarker?.toLowerCase()
    );
  };

  return (
    <div className="p-6 space-y-6">
      <ProUpgradeModal 
        isOpen={showProModal} 
        onClose={() => setShowProModal(false)} 
        feature="evening supplements"
      />

      {selectedSupplement && (
        <SupplementDetailModal 
          supplement={selectedSupplement}
          reference={getSupplementReference(selectedSupplement)}
          onClose={() => setSelectedSupplement(null)}
        />
      )}

      {/* Personalized Recommendations from Blood Markers */}
      {recommendedSupplements.length > 0 && (
        <div className="bg-gradient-to-br from-[#3B7C9E20] to-[#3B7C9E10] rounded-2xl p-5 border border-[#3B7C9E30]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#3B7C9E] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)' }} className="font-semibold">{t('basedOnBloodwork')}</h3>
              <p style={{ color: 'var(--text-secondary)' }} className="text-xs">{suboptimalMarkers.length} {t('markersNeedingAttention')}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendedSupplements.map((supp, index) => (
              <button 
                key={index} 
                onClick={() => setSelectedSupplement(supp)}
                className="flex items-center justify-between p-3 rounded-xl transition-colors text-left w-full"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <Pill className="w-4 h-4 text-[#3B7C9E]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{supp.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{supp.dosage || t('checkDosage')}</p>
                  </div>
                </div>
                <span className="text-[#3B7C9E] text-xs bg-[#3B7C9E20] px-2 py-1 rounded-full whitespace-nowrap">
                  {supp.forMarker}
                </span>
              </button>
            ))}
          </div>

          <Button className="w-full mt-4 bg-[#3B7C9E] hover:bg-[#2D5F7A] text-white">
            <ShoppingCart className="w-4 h-4 mr-2" />
            {t('orderPersonalizedBundle')}
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        </div>
      )}

      {/* Coming Soon Teaser */}
      <div className="bg-gradient-to-r from-[#B7323F20] to-[#3B7C9E20] rounded-2xl p-4 border border-[#B7323F30]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B7323F] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('comingSoon')}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('comingSoonDesc')}</p>
          </div>
        </div>
      </div>

      {/* Morning Stack */}
      <div className="rounded-2xl p-5 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
            <Sunrise className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('morningStack')}</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('takeWithBreakfast')}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {morningStack.length > 0 ? morningStack.map((med, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <Pill className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{med.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{med.dosage}</p>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>{t('noSupplementsYet')}</p>
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
              <p className="text-[#666666] text-xs">Vor dem Schlafengehen</p>
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
              <p className="text-[#666666] text-sm text-center py-4">Noch keine Supplements hinzugefügt</p>
            )}
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setShowProModal(true)}
          className="relative rounded-2xl p-5 bg-[#111111] border border-[#1A1A1A] cursor-pointer hover:border-[#B7323F] transition-all group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent z-10" />
          
          <div className="blur-sm opacity-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center">
                <Moon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Evening Stack</h3>
                <p className="text-[#666666] text-xs">Vor dem Schlafengehen</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-[#0A0A0A] rounded-xl h-14" />
              <div className="p-3 bg-[#0A0A0A] rounded-xl h-14" />
            </div>
          </div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div className="w-12 h-12 rounded-full bg-[#B7323F20] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6 text-[#B7323F]" />
            </div>
            <p className="text-white font-semibold text-sm">Evening Stack</p>
            <p className="text-[#B7323F] text-xs font-medium mt-1">PRO • 9€/Monat</p>
          </div>
        </div>
      )}
    </div>
  );
}