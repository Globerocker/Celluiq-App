import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Activity, Heart, Zap, Moon, TrendingUp, Upload } from "lucide-react";
import { useLanguage } from '../LanguageProvider';
import { Button } from "@/components/ui/button";

export default function BloodMarkersSection() {
  const { t } = useLanguage();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  useEffect(() => {
    const handleThemeChange = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);
  
  const isDark = theme === 'dark';

  const { data: vitalSigns = [], isLoading } = useQuery({
    queryKey: ['vitalSigns'],
    queryFn: () => base44.entities.VitalSign.list('-date', 30),
  });

  const { data: bloodTestFiles = [] } = useQuery({
    queryKey: ['bloodTestFiles'],
    queryFn: () => base44.entities.BloodTestFile.list('-upload_date', 10),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-64 bg-[#111111] rounded-2xl animate-pulse" />
      </div>
    );
  }

  const latestVitals = vitalSigns[0];

  return (
    <div className="p-6 space-y-6">
      {/* Vital Signs Cards */}
      {latestVitals ? (
        <div className="grid grid-cols-2 gap-4">
          {latestVitals.steps && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-[#111111] border border-[#1A1A1A]' : 'bg-white border border-[#E2E8F0] shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-[#3B7C9E]" />
                <span className={`text-xs ${isDark ? 'text-[#808080]' : 'text-[#64748B]'}`}>Schritte</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                {latestVitals.steps.toLocaleString()}
              </p>
            </div>
          )}

          {latestVitals.sleep_quality_score && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-[#111111] border border-[#1A1A1A]' : 'bg-white border border-[#E2E8F0] shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-[#6366F1]" />
                <span className={`text-xs ${isDark ? 'text-[#808080]' : 'text-[#64748B]'}`}>Schlaf</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                {latestVitals.sleep_quality_score}/100
              </p>
            </div>
          )}

          {latestVitals.heart_rate_variability && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-[#111111] border border-[#1A1A1A]' : 'bg-white border border-[#E2E8F0] shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-[#EF4444]" />
                <span className={`text-xs ${isDark ? 'text-[#808080]' : 'text-[#64748B]'}`}>HRV</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                {latestVitals.heart_rate_variability} ms
              </p>
            </div>
          )}

          {latestVitals.active_minutes && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-[#111111] border border-[#1A1A1A]' : 'bg-white border border-[#E2E8F0] shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#F59E0B]" />
                <span className={`text-xs ${isDark ? 'text-[#808080]' : 'text-[#64748B]'}`}>Aktiv</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                {latestVitals.active_minutes} min
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-[#1A1A1A]' : 'bg-[#F1F5F9]'}`}>
            <Activity className={`w-10 h-10 ${isDark ? 'text-[#666666]' : 'text-[#94A3B8]'}`} />
          </div>
          <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            Keine Vital-Daten
          </h2>
          <p className={`max-w-sm mx-auto mb-6 ${isDark ? 'text-[#808080]' : 'text-[#64748B]'}`}>
            Verbinde deinen Fitness-Tracker in den Einstellungen
          </p>
        </div>
      )}

      {/* Blood Test Files */}
      {bloodTestFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            Hochgeladene Bluttests
          </h3>
          {bloodTestFiles.map((file) => (
            <div 
              key={file.id}
              className={`p-4 rounded-xl ${isDark ? 'bg-[#111111] border border-[#1A1A1A]' : 'bg-white border border-[#E2E8F0] shadow-sm'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#1A1A1A]' : 'bg-[#F1F5F9]'}`}>
                    <Upload className="w-5 h-5 text-[#3B7C9E]" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                      {file.file_name}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-[#64748B]'}`}>
                      {new Date(file.upload_date).toLocaleDateString('de-DE')} • {file.markers_extracted || 0} Marker
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}