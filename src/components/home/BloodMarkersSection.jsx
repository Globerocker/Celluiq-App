import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp, Droplet, Upload, ArrowUp, ArrowDown, X } from "lucide-react";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import BloodMarkerUpload from '../BloodMarkerUpload';

export default function BloodMarkersSection() {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const { data: bloodMarkers, isLoading } = useQuery({
    queryKey: ['bloodMarkers'],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
    initialData: [],
  });

  const latestMarkers = bloodMarkers.reduce((acc, marker) => {
    if (!acc[marker.marker_name] || new Date(marker.test_date) > new Date(acc[marker.marker_name].test_date)) {
      acc[marker.marker_name] = marker;
    }
    return acc;
  }, {});

  const markersList = Object.values(latestMarkers)
    .sort((a, b) => {
      const priority = { critical: 1, high: 1, low: 1, suboptimal: 2, optimal: 3 };
      return (priority[a.status] || 3) - (priority[b.status] || 3);
    });

  const getPreviousValue = (markerName, currentDate) => {
    const previous = bloodMarkers
      .filter(m => m.marker_name === markerName && m.test_date < currentDate)
      .sort((a, b) => new Date(b.test_date) - new Date(a.test_date))[0];
    return previous?.value;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'optimal': return 'text-[#3B7C9E]';
      case 'suboptimal': return 'text-[#F59E0B]';
      default: return 'text-[#B7323F]';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="h-24 bg-[#111111] rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const getMarkerPosition = (marker) => {
    if (!marker.optimal_min || !marker.optimal_max) return 50;
    const optimalMid = (marker.optimal_min + marker.optimal_max) / 2;
    const range = marker.optimal_max - marker.optimal_min;
    const extendedMin = marker.optimal_min - range;
    const extendedMax = marker.optimal_max + range;
    const position = ((marker.value - extendedMin) / (extendedMax - extendedMin)) * 100;
    return Math.max(5, Math.min(95, position));
  };

  return (
    <div className="p-6 space-y-4">
      <BloodMarkerUpload isOpen={showUpload} onClose={() => setShowUpload(false)} />
      
      <Button 
        className="w-full bg-[#B7323F] text-white hover:bg-[#9A2835]"
        onClick={() => setShowUpload(true)}
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload Blood Results
      </Button>

      {markersList.length === 0 ? (
        <div className="text-center py-12">
          <Droplet className="w-12 h-12 text-[#333333] mx-auto mb-3" />
          <p className="text-[#808080]">No blood markers yet</p>
        </div>
      ) : (
        <>
          {markersList.map((marker, index) => {
            const Icon = marker.status === 'optimal' ? TrendingUp : TrendingDown;
            const statusColor = getStatusColor(marker.status);
            const previousValue = getPreviousValue(marker.marker_name, marker.test_date);
            const change = previousValue ? marker.value - previousValue : null;
            const changePercent = previousValue ? ((change / previousValue) * 100).toFixed(1) : null;
            
            return (
              <div 
                key={index} 
                className="bg-[#111111] rounded-2xl p-5 hover:bg-[#1A1A1A] transition-all border border-[#1A1A1A] cursor-pointer transform hover:scale-[1.02] duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-[#0A0A0A]`}>
                      <Icon className={`w-5 h-5 ${statusColor}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        {marker.marker_name}
                      </h4>
                      <p className="text-xs text-[#666666]">
                        {format(new Date(marker.test_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-white">
                        {marker.value}
                      </div>
                      {change !== null && (
                        <div className={`flex items-center gap-1 text-xs ${change > 0 ? 'text-[#3B7C9E]' : 'text-[#B7323F]'}`}>
                          {change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          <span>{Math.abs(changePercent)}%</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-[#666666]">{marker.unit}</div>
                  </div>
                </div>
                
                {/* Interactive Range Bar */}
                {marker.optimal_min && marker.optimal_max && (
                  <div 
                    className="mt-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMarker(selectedMarker?.marker_name === marker.marker_name ? null : marker);
                    }}
                  >
                    <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-[#B7323F] via-[#3B7C9E] to-[#B7323F]">
                      {/* Optimal zone indicator */}
                      <div 
                        className="absolute top-0 bottom-0 bg-[#3B7C9E]"
                        style={{
                          left: '25%',
                          right: '25%'
                        }}
                      />
                      {/* Current value marker */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-[#111111] shadow-lg transition-all"
                        style={{ left: `calc(${getMarkerPosition(marker)}% - 8px)` }}
                      />
                    </div>
                    
                    {/* Expanded detail view */}
                    {selectedMarker?.marker_name === marker.marker_name && (
                      <div className="mt-3 p-3 bg-[#0A0A0A] rounded-xl text-xs">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[#B7323F]">Low</span>
                          <span className="text-[#3B7C9E] font-medium">Optimal</span>
                          <span className="text-[#B7323F]">High</span>
                        </div>
                        <div className="flex justify-between text-[#666666]">
                          <span>&lt;{marker.optimal_min}</span>
                          <span>{marker.optimal_min} - {marker.optimal_max}</span>
                          <span>&gt;{marker.optimal_max}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-[#1A1A1A]">
                          <p className="text-[#808080]">
                            Your value: <span className="text-white font-medium">{marker.value} {marker.unit}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}