import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp, Droplet, Upload, ArrowUp, ArrowDown } from "lucide-react";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";

export default function BloodMarkersSection() {
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

  return (
    <div className="p-6 space-y-4">
      <Button className="w-full bg-[#B7323F] text-white hover:bg-[#9A2835]">
        <Upload className="w-4 h-4 mr-2" />
        Aktuelles Blutbild hochladen
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
                className="bg-[#111111] rounded-2xl p-5 hover:bg-[#1A1A1A] transition-all border border-[#1A1A1A]"
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
                
                {marker.optimal_min && marker.optimal_max && (
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-[#666666]">Optimal range</span>
                    <span className="text-[#808080]">
                      {marker.optimal_min} - {marker.optimal_max} {marker.unit}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${statusColor.replace('text-', 'bg-')}`}
                      style={{ 
                        width: marker.status === 'optimal' ? '100%' : 
                               marker.status === 'suboptimal' ? '65%' : '35%' 
                      }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${statusColor}`}>
                    {marker.status}
                  </span>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}