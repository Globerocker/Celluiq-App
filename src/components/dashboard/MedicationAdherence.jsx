import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Pill, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format, isToday } from 'date-fns';

export default function MedicationAdherence({ medications, logs, isLoading, detailed = false }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  const calculateAdherence = (medicationId) => {
    const medLogs = logs.filter(log => log.medication_id === medicationId);
    if (medLogs.length === 0) return 0;
    const taken = medLogs.filter(log => log.taken).length;
    return Math.round((taken / medLogs.length) * 100);
  };

  const overallAdherence = () => {
    if (logs.length === 0) return 0;
    const taken = logs.filter(log => log.taken).length;
    return Math.round((taken / logs.length) * 100);
  };

  const todayLogs = logs.filter(log => isToday(new Date(log.date)));
  const todayTaken = todayLogs.filter(log => log.taken).length;
  const adherenceRate = overallAdherence();

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="border-b border-[#24272A1A]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-[#111315]">Medication Adherence</CardTitle>
          <Badge 
            variant="secondary"
            className={`${
              adherenceRate >= 80 ? 'bg-[#3B7C9E] text-white' : 'bg-[#B7323F] text-white'
            }`}
          >
            {adherenceRate}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#64676A]">Overall Adherence</span>
            <span className="text-sm font-medium text-[#111315]">{adherenceRate}%</span>
          </div>
          <Progress value={adherenceRate} className="h-2" />
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-[#111315] mb-3">Today's Medications</h4>
          <div className="flex items-center gap-4 p-4 bg-[#F6F7F5] rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#3B7C9E]" />
              <span className="text-sm text-[#64676A]">{todayTaken} taken</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-[#64676A]">{todayLogs.length - todayTaken} pending</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[#111315]">Active Medications</h4>
          {medications.length === 0 ? (
            <p className="text-sm text-[#64676A] text-center py-4">No active medications</p>
          ) : (
            medications.slice(0, detailed ? medications.length : 5).map((med, index) => {
              const adherence = calculateAdherence(med.id);
              return (
                <div key={index} className="p-4 bg-white border border-[#24272A1A] rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-[#B7323F15]">
                        <Pill className="w-4 h-4 text-[#B7323F]" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[#111315]">{med.name}</p>
                        <p className="text-xs text-[#64676A]">{med.dosage} • {med.frequency}</p>
                        {med.purpose && (
                          <p className="text-xs text-[#64676A] mt-1">{med.purpose}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {adherence}%
                    </Badge>
                  </div>
                  <Progress value={adherence} className="h-1.5 mt-3" />
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}