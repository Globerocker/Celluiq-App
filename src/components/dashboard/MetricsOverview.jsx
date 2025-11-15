import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Activity, Droplet, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function MetricsOverview({ vitalSigns, bloodMarkers, medications, medicationLogs }) {
  const latestVital = vitalSigns[0];
  
  const calculateAdherence = () => {
    if (!medicationLogs.length) return 0;
    const taken = medicationLogs.filter(log => log.taken).length;
    return Math.round((taken / medicationLogs.length) * 100);
  };

  const getMarkerStatusCount = () => {
    const optimal = bloodMarkers.filter(m => m.status === 'optimal').length;
    const suboptimal = bloodMarkers.filter(m => m.status === 'suboptimal').length;
    const critical = bloodMarkers.filter(m => ['low', 'high', 'critical'].includes(m.status)).length;
    return { optimal, suboptimal, critical };
  };

  const markerStats = getMarkerStatusCount();
  const adherence = calculateAdherence();

  const metrics = [
    {
      title: "Blood Pressure",
      value: latestVital ? `${latestVital.systolic_bp}/${latestVital.diastolic_bp}` : "--",
      unit: "mmHg",
      icon: Heart,
      color: "#B7323F",
      trend: latestVital?.systolic_bp > 140 ? "up" : latestVital?.systolic_bp < 90 ? "down" : "stable"
    },
    {
      title: "Heart Rate",
      value: latestVital?.heart_rate || "--",
      unit: "bpm",
      icon: Activity,
      color: "#3B7C9E",
      trend: latestVital?.heart_rate > 100 ? "up" : latestVital?.heart_rate < 60 ? "down" : "stable"
    },
    {
      title: "Blood Markers",
      value: markerStats.optimal,
      unit: `/${bloodMarkers.length} optimal`,
      icon: Droplet,
      color: markerStats.critical > 0 ? "#B7323F" : "#3B7C9E",
      trend: markerStats.critical > 0 ? "down" : "stable"
    },
    {
      title: "Medication Adherence",
      value: adherence,
      unit: "%",
      icon: TrendingUp,
      color: adherence >= 80 ? "#3B7C9E" : "#B7323F",
      trend: adherence >= 80 ? "stable" : "down"
    }
  ];

  const TrendIcon = ({ trend }) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-green-600" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: metric.color }} />
                </div>
                <TrendIcon trend={metric.trend} />
              </div>
              <div>
                <p className="text-sm text-[#64676A] font-medium mb-1">{metric.title}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-[#111315]">{metric.value}</p>
                  <span className="text-sm text-[#64676A]">{metric.unit}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}