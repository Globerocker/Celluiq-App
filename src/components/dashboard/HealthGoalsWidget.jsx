import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HealthGoalsWidget({ goals }) {
  const calculateProgress = (goal) => {
    if (!goal.target_value || !goal.current_value) return 0;
    return Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100);
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="border-b border-[#24272A1A]">
        <CardTitle className="text-xl font-bold text-[#111315] flex items-center gap-2">
          <Target className="w-5 h-5 text-[#B7323F]" />
          Health Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[#64676A]">No active goals</p>
            <p className="text-xs text-[#64676A] mt-1">Set your first health goal to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal, index) => {
              const progress = calculateProgress(goal);
              return (
                <div key={index} className="p-4 bg-[#F6F7F5] rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm text-[#111315]">{goal.title}</p>
                      <p className="text-xs text-[#64676A] mt-1">
                        {goal.current_value} / {goal.target_value} {goal.unit}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {goal.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#64676A]">Progress</span>
                      <span className="text-xs font-medium text-[#111315]">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}