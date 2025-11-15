import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

import BloodMarkersSection from "../components/home/BloodMarkersSection";
import SupplementStackSection from "../components/home/SupplementStackSection";
import NutritionSection from "../components/home/NutritionSection";

export default function Home() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    { id: 0, title: "Blood Markers", component: BloodMarkersSection },
    { id: 1, title: "Supplement Stack", component: SupplementStackSection },
    { id: 2, title: "Shopping List", component: NutritionSection }
  ];

  const ActiveComponent = sections[activeSection].component;

  const handleSwipe = (direction) => {
    if (direction === 'left' && activeSection < sections.length - 1) {
      setActiveSection(activeSection + 1);
    } else if (direction === 'right' && activeSection > 0) {
      setActiveSection(activeSection - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F5] pb-20 md:pb-8">
      {/* Mobile Navigation Dots */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#24272A1A] px-4 py-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(index)}
              className={`h-2 rounded-full transition-all ${
                activeSection === index 
                  ? 'w-8 bg-[#B7323F]' 
                  : 'w-2 bg-[#24272A33]'
              }`}
            />
          ))}
        </div>
        <h2 className="text-center text-lg font-bold text-[#111315]">
          {sections[activeSection].title}
        </h2>
      </div>

      {/* Content Area with Swipe Gestures */}
      <div 
        className="relative overflow-hidden"
        onTouchStart={(e) => {
          const touchStart = e.touches[0].clientX;
          e.currentTarget.dataset.touchStart = touchStart;
        }}
        onTouchEnd={(e) => {
          const touchStart = parseFloat(e.currentTarget.dataset.touchStart);
          const touchEnd = e.changedTouches[0].clientX;
          const diff = touchStart - touchEnd;
          
          if (Math.abs(diff) > 50) {
            if (diff > 0) handleSwipe('left');
            else handleSwipe('right');
          }
        }}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeSection * 100}%)` }}
        >
          {sections.map((section) => (
            <div key={section.id} className="w-full flex-shrink-0">
              <section.component />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Navigation Arrows */}
      <div className="hidden md:flex fixed top-1/2 left-4 right-4 justify-between pointer-events-none z-50">
        {activeSection > 0 && (
          <button
            onClick={() => handleSwipe('right')}
            className="pointer-events-auto p-3 bg-white rounded-full shadow-lg hover:bg-[#F6F7F5] transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-[#111315]" />
          </button>
        )}
        <div className="flex-1" />
        {activeSection < sections.length - 1 && (
          <button
            onClick={() => handleSwipe('left')}
            className="pointer-events-auto p-3 bg-white rounded-full shadow-lg hover:bg-[#F6F7F5] transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-[#111315]" />
          </button>
        )}
      </div>
    </div>
  );
}