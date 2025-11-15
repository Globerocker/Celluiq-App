import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VitalSignsChart({ data, isLoading, detailed = false }) {
  const [selectedVital, setSelectedVital] = useState("blood_pressure");

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

  const chartData = data
    .slice(0, 30)
    .reverse()
    .map(vs => ({
      date: format(new Date(vs.date), 'MMM dd'),
      systolic: vs.systolic_bp,
      diastolic: vs.diastolic_bp,
      heartRate: vs.heart_rate,
      weight: vs.weight,
      oxygen: vs.oxygen_saturation,
      temperature: vs.temperature
    }));

  const vitalTypes = [
    { id: "blood_pressure", label: "Blood Pressure", lines: ["systolic", "diastolic"] },
    { id: "heart_rate", label: "Heart Rate", lines: ["heartRate"] },
    { id: "weight", label: "Weight", lines: ["weight"] },
    { id: "oxygen", label: "Oxygen Saturation", lines: ["oxygen"] },
    { id: "temperature", label: "Temperature", lines: ["temperature"] }
  ];

  const selectedVitalType = vitalTypes.find(v => v.id === selectedVital);

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="border-b border-[#24272A1A]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-xl font-bold text-[#111315]">Vital Signs Trends</CardTitle>
          <Tabs value={selectedVital} onValueChange={setSelectedVital}>
            <TabsList className="bg-[#F6F7F5]">
              <TabsTrigger value="blood_pressure">BP</TabsTrigger>
              <TabsTrigger value="heart_rate">HR</TabsTrigger>
              <TabsTrigger value="weight">Weight</TabsTrigger>
              <TabsTrigger value="oxygen">O2</TabsTrigger>
              <TabsTrigger value="temperature">Temp</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-[#64676A]">
            No vital signs data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={detailed ? 400 : 300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E9E7" />
              <XAxis 
                dataKey="date" 
                stroke="#64676A"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64676A"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #24272A1A',
                  borderRadius: '0.75rem'
                }}
              />
              <Legend />
              {selectedVitalType.lines.map((line, index) => (
                <Line
                  key={line}
                  type="monotone"
                  dataKey={line}
                  stroke={index === 0 ? "#B7323F" : "#3B7C9E"}
                  strokeWidth={2}
                  dot={{ fill: index === 0 ? "#B7323F" : "#3B7C9E", r: 4 }}
                  activeDot={{ r: 6 }}
                  name={line === "systolic" ? "Systolic" : line === "diastolic" ? "Diastolic" : line === "heartRate" ? "Heart Rate" : line}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}