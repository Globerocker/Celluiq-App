import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Award, TrendingUp, Activity, ChevronLeft, Droplet } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function Profile() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bloodMarkers = [] } = useQuery({
    queryKey: ['bloodMarkers'],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
  });

  // Calculate real stats from blood markers
  const latestMarkers = bloodMarkers.reduce((acc, marker) => {
    if (!acc[marker.marker_name] || new Date(marker.test_date) > new Date(acc[marker.marker_name].test_date)) {
      acc[marker.marker_name] = marker;
    }
    return acc;
  }, {});

  const markerCount = Object.keys(latestMarkers).length;
  const optimalCount = Object.values(latestMarkers).filter(m => m.status === 'optimal').length;
  const healthScore = markerCount > 0 ? Math.round((optimalCount / markerCount) * 100) : 0;

  // Get unique test dates
  const testDates = [...new Set(bloodMarkers.map(m => m.test_date))];

  const stats = [
    { label: "Bluttests", value: testDates.length, icon: Droplet },
    { label: "Health Score", value: `${healthScore}%`, icon: TrendingUp },
    { label: "Marker getestet", value: markerCount, icon: Activity },
    { label: "Optimal", value: optimalCount, icon: Award }
  ];

  const goalLabels = {
    performance: 'Peak Performance',
    longevity: 'Longevity & Anti-Aging',
    energy: 'Mehr Energie',
    weight: 'Gewichtsmanagement',
    sleep: 'Besserer Schlaf',
    mental: 'Mentale Klarheit',
    muscle: 'Muskelaufbau',
    recovery: 'Schnellere Regeneration'
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link to={createPageUrl("Home")}>
          <Button variant="ghost" className="text-[#808080] hover:text-white">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Zurück
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Profil</h1>
          <p className="text-[#808080]">Deine Gesundheitsreise</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Header */}
          <div className="md:col-span-1">
            <Card className="bg-[#111111] border-[#1A1A1A]">
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  {user?.full_name || 'User'}
                </h2>
                <div className="flex items-center justify-center gap-2 text-[#808080] mb-4">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <Button className="w-full bg-[#1A1A1A] text-white hover:bg-[#222222]">
                  Profil bearbeiten
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="bg-[#111111] border-[#1A1A1A]">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-[#0A0A0A]">
                          <Icon className="w-4 h-4 text-[#3B7C9E]" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <span className="text-xs text-[#666666]">{stat.label}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Bio & Goals */}
            <Card className="bg-[#111111] border-[#1A1A1A]">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Über dich</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-[#1A1A1A]">
                    <span className="text-[#666666]">Geschlecht</span>
                    <span className="text-white font-medium capitalize">{user?.gender === 'male' ? 'Männlich' : user?.gender === 'female' ? 'Weiblich' : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#1A1A1A]">
                    <span className="text-[#666666]">Alter</span>
                    <span className="text-white font-medium">{user?.age_range || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#1A1A1A]">
                    <span className="text-[#666666]">Aktivität</span>
                    <span className="text-white font-medium capitalize">{user?.activity_level?.replace('_', ' ') || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#1A1A1A]">
                    <span className="text-[#666666]">Ernährung</span>
                    <span className="text-white font-medium capitalize">{user?.diet || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 col-span-2">
                    <span className="text-[#666666]">Ziel</span>
                    <span className="text-white font-medium">{goalLabels[user?.goal] || '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Blood Tests */}
        {testDates.length > 0 && (
          <Card className="bg-[#111111] border-[#1A1A1A]">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Letzte Bluttests</h3>
              <div className="space-y-3">
                {testDates.slice(0, 3).map((date, idx) => {
                  const markersOnDate = bloodMarkers.filter(m => m.test_date === date);
                  const optOnDate = markersOnDate.filter(m => m.status === 'optimal').length;
                  
                  return (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-[#1A1A1A] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#3B7C9E20] flex items-center justify-center">
                          <Droplet className="w-5 h-5 text-[#3B7C9E]" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{format(new Date(date), 'dd. MMMM yyyy', { locale: de })}</p>
                          <p className="text-[#666666] text-xs">{markersOnDate.length} Marker getestet</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-green-400 text-sm font-medium">{optOnDate} optimal</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}