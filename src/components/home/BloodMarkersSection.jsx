import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Upload, TrendingUp, TrendingDown, Minus, ChevronRight, Info } from "lucide-react";
import { useLanguage } from "../LanguageProvider";
import BloodMarkerUpload from "../BloodMarkerUpload";
import BloodMarkerDetailModal from "../bloodmarkers/BloodMarkerDetailModal";

export default function BloodMarkersSection() {
  const { t } = useLanguage();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const { data: bloodMarkers = [], isLoading } = useQuery({
    queryKey: ['bloodMarkers'],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
  });

  const { data: markerReferences = [] } = useQuery({
    queryKey: ['markerReferences'],
    queryFn: () => base44.entities.BloodMarkerReference.list(),
  });

  // Get latest value for each marker
  const latestMarkers = bloodMarkers.reduce((acc, marker) => {
    if (!acc[marker.marker_name] || new Date(marker.test_date) > new Date(acc[marker.marker_name].test_date)) {
      acc[marker.marker_name] = marker;
    }
    return acc;
  }, {});

  // Sort by status priority
  const sortedMarkers = Object.values(latestMarkers).sort((a, b) => {
    const priority = { critical: 0, high: 1, low: 2, suboptimal: 3, optimal: 4 };
    return (priority[a.status] || 5) - (priority[b.status] || 5);
  });

  const getReference = (markerName) => {
    return markerReferences.find(ref => 
      ref.marker_name?.toLowerCase() === markerName?.toLowerCase() ||
      ref.short_name?.toLowerCase() === markerName?.toLowerCase()
    );
  };

  const getPreviousValue = (markerName) => {
    const markerHistory = bloodMarkers
      .filter(m => m.marker_name === markerName)
      .sort((a, b) => new Date(b.test_date) - new Date(a.test_date));
    return markerHistory.length > 1 ? markerHistory[1].value : null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return 'text-green-400 bg-green-500/20';
      case 'suboptimal': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
      default: return 'text-[#808080] bg-[#1A1A1A]';
    }
  };

  const getTrend = (current, previous) => {
    if (!previous) return null;
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'same';
  };

  const getMarkerPosition = (value, min, max) => {
    if (!min || !max) return 50;
    const range = max - min;
    const position = ((value - min) / range) * 100;
    return Math.max(0, Math.min(100, position));
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#111111] rounded-2xl p-4 animate-pulse">
            <div className="h-6 bg-[#1A1A1A] rounded w-1/3 mb-2" />
            <div className="h-4 bg-[#1A1A1A] rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      <BloodMarkerUpload isOpen={showUpload} onClose={() => setShowUpload(false)} />
      
      {selectedMarker && (
        <BloodMarkerDetailModal 
          marker={selectedMarker} 
          reference={getReference(selectedMarker.marker_name)}
          onClose={() => setSelectedMarker(null)} 
        />
      )}

      {/* Upload Button */}
      <button
        onClick={() => setShowUpload(true)}
        className="w-full bg-gradient-to-r from-[#B7323F] to-[#8B1F2F] rounded-2xl p-4 mb-6 flex items-center justify-between hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold">{t('uploadResults')}</p>
            <p className="text-white/60 text-xs">PDF, PNG or JPG</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/60" />
      </button>

      {/* Markers List */}
      {sortedMarkers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-[#666666]" />
          </div>
          <p className="text-white font-medium mb-2">No blood markers yet</p>
          <p className="text-[#666666] text-sm">Upload your lab results to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedMarkers.map((marker) => {
            const reference = getReference(marker.marker_name);
            const previousValue = getPreviousValue(marker.marker_name);
            const trend = getTrend(marker.value, previousValue);
            const position = getMarkerPosition(
              marker.value, 
              marker.optimal_min || reference?.celluiq_range_min, 
              marker.optimal_max || reference?.celluiq_range_max
            );

            return (
              <button
                key={marker.id}
                onClick={() => setSelectedMarker(marker)}
                className="w-full bg-[#111111] rounded-2xl p-4 border border-[#1A1A1A] hover:border-[#333333] transition-all text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">{marker.marker_name}</h3>
                      {reference && (
                        <Info className="w-3.5 h-3.5 text-[#3B7C9E]" />
                      )}
                    </div>
                    <p className="text-[#666666] text-xs mt-0.5">{marker.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-lg">{marker.value}</span>
                      <span className="text-[#666666] text-sm">{marker.unit}</span>
                      {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                      {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                      {trend === 'same' && <Minus className="w-4 h-4 text-[#666666]" />}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(marker.status)}`}>
                      {marker.status}
                    </span>
                  </div>
                </div>

                {/* Range Bar */}
                <div className="relative">
                  <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-[20%] right-[20%] bg-green-500/30 rounded-full" />
                  </div>
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#B7323F] shadow-lg"
                    style={{ left: `calc(${position}% - 6px)` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[#666666] text-xs">
                    {marker.optimal_min || reference?.celluiq_range_min || '—'}
                  </span>
                  <span className="text-[#666666] text-xs">{t('optimalRange')}</span>
                  <span className="text-[#666666] text-xs">
                    {marker.optimal_max || reference?.celluiq_range_max || '—'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}