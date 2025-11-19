import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Award, TrendingUp, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function Profile() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bloodMarkers } = useQuery({
    queryKey: ['bloodMarkers'],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
    initialData: [],
  });

  const stats = [
    { label: "Blood Tests", value: Math.floor(bloodMarkers.length / 6), icon: Activity },
    { label: "Health Score", value: "82", icon: TrendingUp },
    { label: "Days Active", value: "127", icon: Calendar },
    { label: "Achievements", value: "8", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Link to={createPageUrl("Home")}>
          <Button variant="ghost" className="text-[#808080] hover:text-white">
            ← Back to Home
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-[#808080]">Your health journey overview</p>
        </div>

        {/* Profile Header */}
        <Card className="bg-[#111111] border-[#1A1A1A]">
          <CardContent className="p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1">
                  {user?.full_name || 'User'}
                </h2>
                <div className="flex items-center gap-2 text-[#808080]">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#808080] mt-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Member since {format(new Date(), 'MMMM yyyy')}</span>
                </div>
              </div>
            </div>
            <Button className="w-full bg-[#B7323F] text-white hover:bg-[#9A2835]">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-[#111111] border-[#1A1A1A]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-[#0A0A0A]">
                      <Icon className="w-4 h-4 text-[#3B7C9E]" />
                    </div>
                    <span className="text-xs text-[#666666]">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="bg-[#111111] border-[#1A1A1A]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 py-3 border-b border-[#1A1A1A]">
                <div className="w-2 h-2 rounded-full bg-[#3B7C9E]" />
                <div className="flex-1">
                  <p className="text-white text-sm">Blood test uploaded</p>
                  <p className="text-xs text-[#666666]">2 days ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-[#1A1A1A]">
                <div className="w-2 h-2 rounded-full bg-[#3B7C9E]" />
                <div className="flex-1">
                  <p className="text-white text-sm">Health score improved</p>
                  <p className="text-xs text-[#666666]">1 week ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <div className="w-2 h-2 rounded-full bg-[#3B7C9E]" />
                <div className="flex-1">
                  <p className="text-white text-sm">Started supplement stack</p>
                  <p className="text-xs text-[#666666]">2 weeks ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}