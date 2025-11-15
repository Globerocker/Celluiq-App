import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

export default function BloodMarkersChart({ data, isLoading, detailed = false }) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  const categories = ["all", "vitamins", "minerals", "hormones", "lipids", "liver", "kidney", "thyroid", "inflammation"];
  
  const filteredMarkers = selectedCategory === "all" 
    ? data 
    : data.filter(m => m.category === selectedCategory);

  const latestMarkers = filteredMarkers.reduce((acc, marker) => {
    if (!acc[marker.marker_name] || new Date(marker.test_date) > new Date(acc[marker.marker_name].test_date)) {
      acc[marker.marker_name] = marker;
    }
    return acc;
  }, {});

  const chartData = Object.values(latestMarkers).slice(0, 10).map(marker => ({
    name: marker.marker_name,
    value: marker.value,
    status: marker.status,
    optimalMin: marker.optimal_min,
    optimalMax: marker.optimal_max,
    unit: marker.unit
  }));

  const getStatusColor = (status) => {
    switch(status) {
      case 'optimal': return '#3B7C9E';
      case 'suboptimal': return '#F59E0B';
      case 'low':
      case 'high':
      case 'critical': return '#B7323F';
      default: return '#64676A';
    }
  };

  const StatusIcon = ({ status }) => {
    switch(status) {
      case 'optimal': return <CheckCircle2 className="w-4 h-4 text-[#3B7C9E]" />;
      case 'suboptimal': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <AlertCircle className="w-4 h-4 text-[#B7323F]" />;
    }
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="border-b border-[#24272A1A]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-xl font-bold text-[#111315]">Blood Markers Analysis</CardTitle>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.replace('_', ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-[#64676A]">
            No blood marker data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={detailed ? 400 : 300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E9E7" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64676A"
                  style={{ fontSize: '11px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#64676A" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #24272A1A',
                    borderRadius: '0.75rem'
                  }}
                  formatter={(value, name, props) => [
                    `${value} ${props.payload.unit}`,
                    'Value'
                  ]}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {detailed && (
              <div className="mt-6 space-y-2">
                <h4 className="font-semibold text-[#111315] mb-3">Marker Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {chartData.map((marker, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#F6F7F5] rounded-lg">
                      <div className="flex items-center gap-3">
                        <StatusIcon status={marker.status} />
                        <div>
                          <p className="font-medium text-sm text-[#111315]">{marker.name}</p>
                          <p className="text-xs text-[#64676A]">
                            {marker.value} {marker.unit}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={`${
                          marker.status === 'optimal' ? 'bg-[#3B7C9E] text-white' :
                          marker.status === 'suboptimal' ? 'bg-amber-100 text-amber-800' :
                          'bg-[#B7323F] text-white'
                        }`}
                      >
                        {marker.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}