import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp, Droplet } from "lucide-react";
import { format } from 'date-fns';

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
    })
    .slice(0, 6);

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
          <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {markersList.length === 0 ? (
        <div className="text-center py-12">
          <Droplet className="w-12 h-12 text-[#64676A] mx-auto mb-3 opacity-50" />
          <p className="text-[#64676A]">No blood markers yet</p>
        </div>
      ) : (
        <>
          {markersList.map((marker, index) => {
            const Icon = marker.status === 'optimal' ? TrendingUp : TrendingDown;
            const statusColor = getStatusColor(marker.status);
            
            return (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-[#F6F7F5]`}>
                      <Icon className={`w-5 h-5 ${statusColor}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#111315]">
                        {marker.marker_name}
                      </h4>
                      <p className="text-xs text-[#64676A]">
                        {format(new Date(marker.test_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#111315]">
                      {marker.value}
                    </div>
                    <div className="text-xs text-[#64676A]">{marker.unit}</div>
                  </div>
                </div>
                
                {marker.optimal_min && marker.optimal_max && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64676A]">Optimal range</span>
                    <span className="text-[#64676A]">
                      {marker.optimal_min} - {marker.optimal_max} {marker.unit}
                    </span>
                  </div>
                )}
                
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#F6F7F5] rounded-full overflow-hidden">
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
          
          <button className="w-full py-3 bg-[#F6F7F5] text-[#B7323F] rounded-2xl font-medium hover:bg-[#E8E9E7] transition-all mt-4">
            Upload new test results
          </button>
        </>
      )}
    </div>
  );
}