import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Check, Layers, Smartphone, Droplet } from "lucide-react";

export default function Subscription() {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState("personalized");

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => base44.entities.Subscription.list(),
    initialData: [],
  });

  const currentSubscription = subscription[0];

  const plans = [
    {
      id: "essential",
      name: "Essential",
      price: 59,
      icon: Layers,
      label: "STANDARD STACK",
      features: [
        "Universal AM/PM Formulation",
        "Optimized for Men & Women",
        "Core Essentials (Vit D, Mg, Zn)",
        "Subscription Basis"
      ]
    },
    {
      id: "personalized",
      name: "Personalized",
      price: 99,
      icon: Smartphone,
      label: "DATA-DRIVEN STACK",
      badge: "MOST POPULAR",
      features: [
        "Based on 50-Question Quiz",
        "Wearable Data Integration",
        "Semi-Personalized Dosage",
        "Quarterly Adjustments"
      ]
    },
    {
      id: "blood_based",
      name: "Blood-Based",
      price: 249,
      icon: Droplet,
      label: "BIOHACKING STACK",
      features: [
        "100% Personalized to Blood",
        "Full Panel Analysis Included",
        "Micro-dosing Precision",
        "Doctor Reviewed"
      ]
    }
  ];

  const createSubscriptionMutation = useMutation({
    mutationFn: (planType) => base44.entities.Subscription.create({
      plan_type: planType,
      status: "active",
      start_date: new Date().toISOString().split('T')[0],
      next_delivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthly_price: plans.find(p => p.id === planType).price
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link to={createPageUrl("Settings")}>
          <Button variant="ghost" className="text-[#808080] hover:text-white">
            ← Back to Settings
          </Button>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">CHOOSE YOUR LEVEL</h1>
          <p className="text-[#808080]">From high-performance basics to precision optimization.</p>
        </div>

        {currentSubscription && (
          <Card className="bg-[#3B7C9E15] border-[#3B7C9E30] mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#3B7C9E] mb-1">Current Plan</p>
                  <p className="text-xl font-bold text-white capitalize">
                    {currentSubscription.plan_type.replace('_', '-')} - €{currentSubscription.monthly_price}/month
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#666666]">Next Delivery</p>
                  <p className="text-sm text-white">{new Date(currentSubscription.next_delivery).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.badge === "MOST POPULAR";
            const isCurrent = currentSubscription?.plan_type === plan.id;
            
            return (
              <Card 
                key={plan.id}
                className={`relative ${
                  isPopular 
                    ? 'bg-[#111111] border-[#3B7C9E] border-2' 
                    : 'bg-[#111111] border-[#1A1A1A]'
                } ${isCurrent ? 'ring-2 ring-[#3B7C9E]' : ''}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#3B7C9E] text-white text-xs px-4 py-1 rounded-full font-medium">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-[#3B7C9E]" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-[#666666] uppercase tracking-wider mb-4">{plan.label}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">€{plan.price}</span>
                    <span className="text-[#808080]">/month</span>
                  </div>

                  <div className="space-y-3 mb-6 text-left">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#3B7C9E] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-[#CCCCCC]">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full ${
                      isCurrent 
                        ? 'bg-[#333333] text-white cursor-not-allowed' 
                        : isPopular 
                          ? 'bg-[#3B7C9E] text-white hover:bg-[#2C6280]' 
                          : 'bg-[#1A1A1A] text-white hover:bg-[#222222]'
                    }`}
                    onClick={() => !isCurrent && createSubscriptionMutation.mutate(plan.id)}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Current Plan' : 'JOIN WAITLIST'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}