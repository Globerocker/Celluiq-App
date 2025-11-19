import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

import BloodMarkersSection from "../components/home/BloodMarkersSection";
import SupplementStackSection from "../components/home/SupplementStackSection";
import NutritionSection from "../components/home/NutritionSection";

export default function Home() {
  const [activeSection, setActiveSection] = useState(0);

  const { data: bloodMarkers } = useQuery({
    queryKey: ['bloodMarkers'],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
    initialData: [],
  });

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
    { id: 0, title: "Markers", component: BloodMarkersSection },
    { id: 1, title: "Stack", component: SupplementStackSection },
    { id: 2, title: "Nutrition", component: NutritionSection }
  ];

  const ActiveComponent = sections[activeSection].component;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-8">
      {/* Header with Health Score */}
      <div className="bg-[#111111] px-6 pt-8 pb-6 border-b border-[#1A1A1A]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[#808080] text-sm uppercase tracking-wider mb-3">
            CELLUIQ Health Score
          </p>
          <div className="relative inline-block">
            <div className="text-7xl font-bold text-white mb-2">
              {healthScore}
            </div>
            <div className="absolute -top-2 -right-8 text-2xl text-[#3B7C9E]">
              +5
            </div>
          </div>
          <p className="text-[#808080] text-sm mt-3">
            Your score improved by 5 points this week. Keep up the excellent recovery habits.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-[57px] z-40 bg-[#0A0A0A] border-b border-[#1A1A1A]">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-2">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(index)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeSection === index 
                    ? 'bg-[#B7323F] text-white' 
                    : 'bg-[#1A1A1A] text-[#808080] hover:bg-[#222222]'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-2xl mx-auto">
        <ActiveComponent />
      </div>
    </div>
  );
}