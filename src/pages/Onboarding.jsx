import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, User, Target, Activity, Moon, Apple, Pill } from "lucide-react";
import { createPageUrl } from "@/utils";

const questions = [
  {
    id: "gender",
    icon: User,
    question: "What's your biological sex?",
    subtitle: "This helps us provide gender-specific recommendations",
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" }
    ]
  },
  {
    id: "age_range",
    icon: User,
    question: "What's your age range?",
    subtitle: "Age affects optimal biomarker ranges",
    options: [
      { value: "18-29", label: "18-29" },
      { value: "30-39", label: "30-39" },
      { value: "40-49", label: "40-49" },
      { value: "50-59", label: "50-59" },
      { value: "60+", label: "60+" }
    ]
  },
  {
    id: "goal",
    icon: Target,
    question: "What's your primary health goal?",
    subtitle: "We'll prioritize recommendations based on this",
    options: [
      { value: "performance", label: "Peak Performance" },
      { value: "longevity", label: "Longevity & Anti-Aging" },
      { value: "energy", label: "More Energy" },
      { value: "weight", label: "Weight Management" },
      { value: "sleep", label: "Better Sleep" },
      { value: "mental", label: "Mental Clarity" }
    ]
  },
  {
    id: "activity_level",
    icon: Activity,
    question: "How active are you?",
    subtitle: "Activity level influences nutrient needs",
    options: [
      { value: "sedentary", label: "Sedentary (little exercise)" },
      { value: "light", label: "Light (1-2x/week)" },
      { value: "moderate", label: "Moderate (3-4x/week)" },
      { value: "active", label: "Very Active (5+x/week)" },
      { value: "athlete", label: "Athlete/Professional" }
    ]
  },
  {
    id: "sleep_quality",
    icon: Moon,
    question: "How would you rate your sleep?",
    subtitle: "Sleep quality affects many biomarkers",
    options: [
      { value: "poor", label: "Poor (< 5 hours)" },
      { value: "fair", label: "Fair (5-6 hours)" },
      { value: "good", label: "Good (7-8 hours)" },
      { value: "excellent", label: "Excellent (8+ hours)" }
    ]
  },
  {
    id: "diet",
    icon: Apple,
    question: "What best describes your diet?",
    subtitle: "Helps us tailor food recommendations",
    options: [
      { value: "standard", label: "Standard/Mixed" },
      { value: "vegetarian", label: "Vegetarian" },
      { value: "vegan", label: "Vegan" },
      { value: "keto", label: "Keto/Low-Carb" },
      { value: "paleo", label: "Paleo" },
      { value: "mediterranean", label: "Mediterranean" }
    ]
  }
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      window.location.href = createPageUrl("Home");
    }
  });

  const handleSelect = (value) => {
    setAnswers(prev => ({
      ...prev,
      [questions[step].id]: value
    }));
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Save to user profile
      updateUserMutation.mutate({
        onboarding_completed: true,
        ...answers
      });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentQuestion = questions[step];
  const currentAnswer = answers[currentQuestion.id];
  const Icon = currentQuestion.icon;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Progress Bar */}
      <div className="px-6 pt-6">
        <div className="flex gap-2 max-w-md mx-auto">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all ${
                idx <= step ? "bg-[#B7323F]" : "bg-[#1A1A1A]"
              }`}
            />
          ))}
        </div>
        <p className="text-center text-[#666666] text-sm mt-4">
          Step {step + 1} of {questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#B7323F20] flex items-center justify-center mx-auto mb-6">
                <Icon className="w-8 h-8 text-[#B7323F]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {currentQuestion.question}
              </h1>
              <p className="text-[#808080]">
                {currentQuestion.subtitle}
              </p>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    currentAnswer === option.value
                      ? "bg-[#B7323F20] border-[#B7323F] text-white"
                      : "bg-[#111111] border-[#1A1A1A] text-[#808080] hover:border-[#333333]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-[#1A1A1A]">
        <div className="flex gap-4 max-w-md mx-auto">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 bg-[#1A1A1A] border-[#333333] text-white hover:bg-[#222222]"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!currentAnswer || updateUserMutation.isPending}
            className={`flex-1 bg-[#B7323F] hover:bg-[#9A2835] text-white ${
              step === 0 ? "w-full" : ""
            }`}
          >
            {updateUserMutation.isPending ? (
              "Saving..."
            ) : step === questions.length - 1 ? (
              "Complete"
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}