import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Droplet, TrendingUp, TrendingDown, Search, Plus, FileUp } from "lucide-react";
import { format } from "date-fns";

import BloodMarkerCard from "../components/bloodmarkers/BloodMarkerCard";
import BloodMarkerDetail from "../components/bloodmarkers/BloodMarkerDetail";

export default function BloodMarkers() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarker, setSelectedMarker] = useState(null);

  const { data: bloodMarkers, isLoading } = useQuery({
    queryKey: ['bloodMarkers'],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
    initialData: [],
  });

  const categories = [
    { id: "all", label: "All", icon: Droplet },
    { id: "vitamins", label: "Vitamins", icon: TrendingUp },
    { id: "minerals", label: "Minerals", icon: TrendingUp },
    { id: "hormones", label: "Hormones", icon: TrendingUp },
    { id: "lipids", label: "Lipids", icon: TrendingUp },
    { id: "thyroid", label: "Thyroid", icon: TrendingUp },
    { id: "inflammation", label: "Inflammation", icon: TrendingUp },
  ];

  const filteredMarkers = bloodMarkers.filter(marker => {
    const categoryMatch = selectedCategory === "all" || marker.category === selectedCategory;
    const searchMatch = marker.marker_name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const latestMarkers = filteredMarkers.reduce((acc, marker) => {
    if (!acc[marker.marker_name] || new Date(marker.test_date) > new Date(acc[marker.marker_name].test_date)) {
      acc[marker.marker_name] = marker;
    }
    return acc;
  }, {});

  const markersList = Object.values(latestMarkers);

  const statusCounts = {
    optimal: markersList.filter(m => m.status === 'optimal').length,
    suboptimal: markersList.filter(m => m.status === 'suboptimal').length,
    critical: markersList.filter(m => ['low', 'high', 'critical'].includes(m.status)).length,
  };

  return (
    <div className="min-h-screen bg-[#F6F7F5] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#111315] tracking-tight">
              Blood Markers
            </h1>
            <p className="text-[#64676A] mt-1">Detailed analysis of your biomarkers</p>
          </div>
          <Button className="bg-[#B7323F] hover:bg-[#9A2835] text-white">
            <FileUp className="w-4 h-4 mr-2" />
            Upload New Test
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64676A] font-medium">Optimal</p>
                  <p className="text-3xl font-bold text-[#3B7C9E] mt-1">{statusCounts.optimal}</p>
                </div>
                <div className="p-3 bg-[#3B7C9E15] rounded-xl">
                  <TrendingUp className="w-6 h-6 text-[#3B7C9E]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64676A] font-medium">Suboptimal</p>
                  <p className="text-3xl font-bold text-amber-500 mt-1">{statusCounts.suboptimal}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <TrendingDown className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64676A] font-medium">Need Attention</p>
                  <p className="text-3xl font-bold text-[#B7323F] mt-1">{statusCounts.critical}</p>
                </div>
                <div className="p-3 bg-[#B7323F15] rounded-xl">
                  <Droplet className="w-6 h-6 text-[#B7323F]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader className="border-b border-[#24272A1A]">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#64676A]" />
                <Input
                  placeholder="Search markers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="bg-[#F6F7F5]">
                  {categories.slice(0, 5).map(cat => (
                    <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {markersList.length === 0 ? (
              <div className="text-center py-12">
                <Droplet className="w-12 h-12 text-[#64676A] mx-auto mb-4 opacity-50" />
                <p className="text-[#64676A]">No blood markers found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {markersList.map((marker, index) => (
                  <BloodMarkerCard
                    key={index}
                    marker={marker}
                    onClick={() => setSelectedMarker(marker)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedMarker && (
          <BloodMarkerDetail
            marker={selectedMarker}
            onClose={() => setSelectedMarker(null)}
          />
        )}
      </div>
    </div>
  );
}