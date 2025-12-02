import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "../components/LanguageProvider";
import { createPageUrl } from "@/utils";

import BloodMarkersSection from "../components/home/BloodMarkersSection";
import SupplementStackSection from "../components/home/SupplementStackSection";
import NutritionSection from "../components/home/NutritionSection";
import RoutineSection from "../components/home/RoutineSection";

export default function Home() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState(0);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    const handleThemeChange = () => {
      setTheme(localStorage.getItem('theme') || 'dark');
    };
    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme') handleThemeChange();
    });
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

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
  
  const isDark = theme === 'dark';

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
    { id: 2, title: t('nutrition'), component: NutritionSection },
    { id: 3, title: t('routine'), component: RoutineSection }
  ];

  const ActiveComponent = sections[activeSection].component;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F8FAFC]'}`}>
      {/* Header with Health Score */}
      <div className={`px-6 pt-10 pb-6 relative overflow-hidden ${isDark ? 'bg-[#111111]' : 'bg-white'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#3B7C9E10,transparent_50%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className={`text-xs uppercase tracking-[0.2em] mb-4 font-medium ${isDark ? 'text-[#808080]' : 'text-[#64748B]'}`}>
            {t('yourCelluiqScore')}
          </p>
          <div className="relative inline-block mb-4">
            <div className={`text-7xl md:text-8xl font-bold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
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
          <p className={`text-sm mt-4 max-w-md mx-auto leading-relaxed ${isDark ? 'text-[#808080]' : 'text-[#64748B]'}`}>
            {bloodMarkers.length > 0 ? t('outstandingProgress') : t('uploadFirstBlood')}
          </p>
        </div>
      </div>

      {/* Tab Navigation - Below Score, Sticky on Scroll */}
      <div className={`sticky top-[57px] z-40 border-y ${isDark ? 'bg-[#111111] border-[#222222]' : 'bg-white border-[#E2E8F0]'}`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(index)}
                className={`px-4 md:px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeSection === index 
                    ? 'bg-[#B7323F] text-white' 
                    : isDark ? 'bg-[#1A1A1A] text-[#808080]' : 'bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto pb-8">
        <ActiveComponent />
      </div>
    </div>
  );
}