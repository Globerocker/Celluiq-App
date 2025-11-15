import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Activity, Heart, Droplet, Pill, TrendingUp, Calendar, Filter } from "lucide-react";

import MetricsOverview from "../components/dashboard/MetricsOverview";
import VitalSignsChart from "../components/dashboard/VitalSignsChart";
import BloodMarkersChart from "../components/dashboard/BloodMarkersChart";
import MedicationAdherence from "../components/dashboard/MedicationAdherence";
import DateRangeFilter from "../components/dashboard/DateRangeFilter";
import HealthGoalsWidget from "../components/dashboard/HealthGoalsWidget";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({ 
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
    to: new Date() 
  });
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: vitalSigns, isLoading: loadingVitals } = useQuery({
    queryKey: ['vitalSigns', dateRange],
    queryFn: () => base44.entities.VitalSign.list('-date'),
    initialData: [],
  });

  const { data: bloodMarkers, isLoading: loadingMarkers } = useQuery({
    queryKey: ['bloodMarkers', dateRange],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
    initialData: [],
  });

  const { data: medications, isLoading: loadingMeds } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.filter({ active: true }),
    initialData: [],
  });

  const { data: medicationLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['medicationLogs', dateRange],
    queryFn: () => base44.entities.MedicationLog.list('-date'),
    initialData: [],
  });

  const { data: healthGoals } = useQuery({
    queryKey: ['healthGoals'],
    queryFn: () => base44.entities.HealthGoal.filter({ status: 'active' }),
    initialData: [],
  });

  const filteredVitalSigns = useMemo(() => {
    return vitalSigns.filter(vs => {
      const date = new Date(vs.date);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }, [vitalSigns, dateRange]);

  const filteredBloodMarkers = useMemo(() => {
    return bloodMarkers.filter(bm => {
      const date = new Date(bm.test_date);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }, [bloodMarkers, dateRange]);

  return (
    <div className="min-h-screen bg-[#F6F7F5] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#111315] tracking-tight">
              CELLUIQ Dashboard
            </h1>
            <p className="text-[#64676A] mt-1">Your personalized health insights</p>
          </div>
          <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />
        </div>

        {/* Quick Stats */}
        <MetricsOverview 
          vitalSigns={filteredVitalSigns}
          bloodMarkers={filteredBloodMarkers}
          medications={medications}
          medicationLogs={medicationLogs}
        />

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-[#24272A1A] w-full md:w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="vitals" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Vital Signs
            </TabsTrigger>
            <TabsTrigger value="blood" className="flex items-center gap-2">
              <Droplet className="w-4 h-4" />
              Blood Markers
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-2">
              <Pill className="w-4 h-4" />
              Medications
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content Based on Active Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <VitalSignsChart data={filteredVitalSigns} isLoading={loadingVitals} />
              <BloodMarkersChart data={filteredBloodMarkers} isLoading={loadingMarkers} />
            </div>
            <div className="space-y-6">
              <HealthGoalsWidget goals={healthGoals} />
              <MedicationAdherence 
                medications={medications}
                logs={medicationLogs}
                isLoading={loadingMeds || loadingLogs}
              />
            </div>
          </div>
        )}

        {activeTab === "vitals" && (
          <VitalSignsChart data={filteredVitalSigns} isLoading={loadingVitals} detailed />
        )}

        {activeTab === "blood" && (
          <BloodMarkersChart data={filteredBloodMarkers} isLoading={loadingMarkers} detailed />
        )}

        {activeTab === "medications" && (
          <MedicationAdherence 
            medications={medications}
            logs={medicationLogs}
            isLoading={loadingMeds || loadingLogs}
            detailed
          />
        )}
      </div>
    </div>
  );
}