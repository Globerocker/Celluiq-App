import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingDown, TrendingUp, Droplet } from "lucide-react";
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
    .slice(0, 8);

  const getStatusConfig = (status) => {
    switch(status) {
      case 'optimal': 
        return { bg: 'bg-[#3B7C9E15]', text: 'text-[#3B7C9E]', badge: 'bg-[#3B7C9E] text-white', icon: TrendingUp };
      case 'suboptimal': 
        return { bg: 'bg-amber-50', text: 'text-amber-600', badge: 'bg-amber-500 text-white', icon: TrendingDown };
      default: 
        return { bg: 'bg-[#B7323F15]', text: 'text-[#B7323F]', badge: 'bg-[#B7323F] text-white', icon: AlertCircle };
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-[#64676A]">Latest Test Results</h3>
          {markersList[0] && (
            <p className="text-xs text-[#64676A]">
              {format(new Date(markersList[0].test_date), 'MMM d, yyyy')}
            </p>
          )}
        </div>
        <Badge variant="outline" className="text-xs">
          {markersList.length} markers
        </Badge>
      </div>

      {markersList.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="p-8 text-center">
            <Droplet className="w-12 h-12 text-[#64676A] mx-auto mb-3 opacity-50" />
            <p className="text-[#64676A]">No blood markers yet</p>
          </CardContent>
        </Card>
      ) : (
        markersList.map((marker, index) => {
          const config = getStatusConfig(marker.status);
          const Icon = config.icon;
          
          return (
            <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${config.bg} flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${config.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-[#111315] truncate">
                        {marker.marker_name}
                      </h4>
                      <Badge className={`${config.badge} text-xs flex-shrink-0 ml-2`}>
                        {marker.status}
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-[#111315]">{marker.value}</span>
                      <span className="text-sm text-[#64676A]">{marker.unit}</span>
                      {marker.optimal_min && marker.optimal_max && (
                        <span className="text-xs text-[#64676A]">
                          ({marker.optimal_min}-{marker.optimal_max})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}