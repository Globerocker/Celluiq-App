import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { format } from 'date-fns';

export default function BloodMarkerCard({ marker, onClick }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'optimal': return 'bg-[#3B7C9E] text-white';
      case 'suboptimal': return 'bg-amber-100 text-amber-800';
      case 'low':
      case 'high':
      case 'critical': return 'bg-[#B7323F] text-white';
      default: return 'bg-[#64676A] text-white';
    }
  };

  const calculatePercentage = () => {
    if (!marker.optimal_min || !marker.optimal_max) return 50;
    const range = marker.optimal_max - marker.optimal_min;
    const position = marker.value - marker.optimal_min;
    return Math.min(Math.max((position / range) * 100, 0), 100);
  };

  const TrendIcon = () => {
    if (marker.status === 'high') return <TrendingUp className="w-4 h-4" />;
    if (marker.status === 'low') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <Card 
      className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-[#111315] group-hover:text-[#B7323F] transition-colors">
              {marker.marker_name}
            </h3>
            <p className="text-xs text-[#64676A] mt-1">
              {format(new Date(marker.test_date), 'MMM d, yyyy')}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#64676A] group-hover:text-[#B7323F] transition-colors" />
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#111315]">{marker.value}</span>
            <span className="text-sm text-[#64676A]">{marker.unit}</span>
          </div>

          {marker.optimal_min && marker.optimal_max && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64676A]">Range</span>
                <span className="text-[#64676A]">
                  {marker.optimal_min} - {marker.optimal_max} {marker.unit}
                </span>
              </div>
              <Progress value={calculatePercentage()} className="h-1.5" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary"
              className={`${getStatusColor(marker.status)} flex items-center gap-1 text-xs`}
            >
              <TrendIcon />
              {marker.status}
            </Badge>
            <span className="text-xs px-2 py-1 bg-[#F6F7F5] rounded-md text-[#64676A]">
              {marker.category}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}