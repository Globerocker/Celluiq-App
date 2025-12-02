import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "../components/LanguageProvider";
import { createPageUrl } from "@/utils";

import BloodMarkersSection from "../components/home/BloodMarkersSection";
import SupplementStackSection from "../components/home/SupplementStackSection";
import NutritionSection from "../components/home/NutritionSection";

export default function Home() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState(0);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bloodMarkers = [] } = useQuery({
    queryKey: ['bloodMarkers'],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
  });

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (user && !user.onboarding_completed) {
      window.location.href = createPageUrl("Onboarding");
    }
  }, [user]);

  const calculateHealthScore = () => {
    if (bloodMarkers.length === 0) return 0;
    
    const latestMarkers = bloodMarkers.reduce((acc, marker) => {
      if (!acc[marker.marker_name] || new Date(marker.test_date) > new Date(acc[marker.marker_name].test_date)) {
        acc[marker.marker_name] = marker;
      }
      return acc;
    }, {});

    const markers = Object.values(latestMarkers);
    const optimal = markers.filter(m => m.status === 'optimal').length;
    const score = Math.round((optimal / markers.length) * 100);
    return score;
  };

  const healthScore = calculateHealthScore();

  const sections = [
    { id: 0, title: t('markers'), component: BloodMarkersSection },
    { id: 1, title: t('stack'), component: SupplementStackSection },
    { id: 2, title: t('nutrition'), component: NutritionSection }
  ];

  const ActiveComponent = sections[activeSection].component;

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header with Health Score */}
      <div className="px-6 pt-10 pb-8 border-b relative overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#3B7C9E10,transparent_50%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] mb-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
            {t('yourCelluiqScore')}
          </p>
          <div className="relative inline-block mb-4">
            <div className="text-7xl md:text-8xl font-bold mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {healthScore}
            </div>
            {bloodMarkers.length > 0 && (
              <div className="absolute -top-3 -right-10 flex items-center gap-1 bg-[#3B7C9E20] px-3 py-1 rounded-full border border-[#3B7C9E40]">
                <span className="text-lg text-[#3B7C9E] font-bold">+5</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="h-1 w-24 bg-gradient-to-r from-[#B7323F] via-[#3B7C9E] to-[#3B7C9E] rounded-full" />
          </div>
          <p className="text-sm mt-4 max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {bloodMarkers.length > 0 ? t('outstandingProgress') : 'Lade dein erstes Blutbild hoch um zu starten'}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-[57px] z-40 border-b" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-2">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(index)}
                className={`px-4 md:px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeSection === index 
                    ? 'bg-[#B7323F] text-white' 
                    : ''
                }`}
                style={activeSection !== index ? { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' } : {}}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area - Desktop optimized */}
      <div className="max-w-4xl mx-auto">
        <ActiveComponent />
      </div>
    </div>
  );
}