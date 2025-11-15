import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, AlertCircle, Info } from "lucide-react";
import { format } from 'date-fns';

const markerInfo = {
  "Vitamin D": {
    description: "Essential for bone health, immune function, and mood regulation. Helps calcium absorption and supports overall health.",
    lowSymptoms: "Fatigue, bone pain, muscle weakness, frequent infections, depression",
    highSymptoms: "Nausea, weakness, kidney problems, calcium buildup",
    recommendations: [
      "Increase sun exposure (15-20 minutes daily)",
      "Consume fatty fish (salmon, mackerel, sardines)",
      "Consider D3 supplementation (2000-5000 IU daily)",
      "Add fortified foods to diet"
    ]
  },
  "Vitamin B12": {
    description: "Crucial for nerve function, DNA synthesis, and red blood cell formation. Essential for energy production and brain health.",
    lowSymptoms: "Fatigue, weakness, numbness, memory problems, mood changes",
    highSymptoms: "Generally safe, excess is excreted",
    recommendations: [
      "Eat B12-rich foods (meat, fish, eggs, dairy)",
      "Consider B12 supplementation if low",
      "Check for absorption issues",
      "Monitor if following plant-based diet"
    ]
  },
  "Iron": {
    description: "Essential for oxygen transport in blood and energy production. Critical for hemoglobin formation.",
    lowSymptoms: "Fatigue, weakness, pale skin, shortness of breath, cold hands/feet",
    highSymptoms: "Joint pain, fatigue, abdominal pain, organ damage",
    recommendations: [
      "Consume iron-rich foods (red meat, spinach, lentils)",
      "Pair iron with vitamin C for better absorption",
      "Avoid tea/coffee with iron-rich meals",
      "Consider supplementation if significantly low"
    ]
  }
};

export default function BloodMarkerDetail({ marker, onClose }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'optimal': return 'bg-[#3B7C9E] text-white';
      case 'suboptimal': return 'bg-amber-100 text-amber-800';
      default: return 'bg-[#B7323F] text-white';
    }
  };

  const info = markerInfo[marker.marker_name] || {
    description: "Important biomarker for overall health assessment.",
    lowSymptoms: "Consult with healthcare provider",
    highSymptoms: "Consult with healthcare provider",
    recommendations: ["Consult with healthcare provider for personalized advice"]
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border-none shadow-2xl">
        <CardHeader className="border-b border-[#24272A1A] sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl font-bold text-[#111315]">
                  {marker.marker_name}
                </CardTitle>
                <Badge 
                  variant="secondary"
                  className={getStatusColor(marker.status)}
                >
                  {marker.status}
                </Badge>
              </div>
              <p className="text-sm text-[#64676A]">
                Tested on {format(new Date(marker.test_date), 'MMMM d, yyyy')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-[#F6F7F5]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Current Value */}
          <div className="p-6 bg-[#F6F7F5] rounded-xl">
            <p className="text-sm text-[#64676A] mb-2">Current Value</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[#111315]">{marker.value}</span>
              <span className="text-xl text-[#64676A]">{marker.unit}</span>
            </div>
            {marker.optimal_min && marker.optimal_max && (
              <p className="text-sm text-[#64676A] mt-2">
                Optimal Range: {marker.optimal_min} - {marker.optimal_max} {marker.unit}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-[#3B7C9E]" />
              <h3 className="font-semibold text-[#111315]">What is {marker.marker_name}?</h3>
            </div>
            <p className="text-[#64676A] leading-relaxed">{info.description}</p>
          </div>

          {/* Symptoms */}
          {marker.status !== 'optimal' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-[#B7323F]" />
                <h3 className="font-semibold text-[#111315]">
                  {marker.status === 'low' ? 'Low Symptoms' : 'High Symptoms'}
                </h3>
              </div>
              <p className="text-[#64676A] leading-relaxed">
                {marker.status === 'low' ? info.lowSymptoms : info.highSymptoms}
              </p>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-[#3B7C9E]" />
              <h3 className="font-semibold text-[#111315]">Recommendations</h3>
            </div>
            <ul className="space-y-2">
              {info.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B7323F] mt-2 flex-shrink-0" />
                  <span className="text-[#64676A] leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-[#24272A1A]">
            <p className="text-xs text-[#64676A] italic">
              Note: This information is for educational purposes only. Always consult with a healthcare professional for personalized medical advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}