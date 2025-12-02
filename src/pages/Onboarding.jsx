import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, User, Target, Activity, Moon, Apple, MapPin, Heart, Dumbbell } from "lucide-react";
import { createPageUrl } from "@/utils";

const questions = [
  {
    id: "gender",
    icon: User,
    question: "Was ist dein biologisches Geschlecht?",
    subtitle: "Für geschlechtsspezifische Referenzwerte",
    type: "select",
    options: [
      { value: "male", label: "Männlich" },
      { value: "female", label: "Weiblich" }
    ]
  },
  {
    id: "age_range",
    icon: User,
    question: "Wie alt bist du?",
    subtitle: "Das Alter beeinflusst optimale Biomarker-Bereiche",
    type: "select",
    options: [
      { value: "18-29", label: "18-29 Jahre" },
      { value: "30-39", label: "30-39 Jahre" },
      { value: "40-49", label: "40-49 Jahre" },
      { value: "50-59", label: "50-59 Jahre" },
      { value: "60+", label: "60+ Jahre" }
    ]
  },
  {
    id: "postal_code",
    icon: MapPin,
    question: "Wie lautet deine Postleitzahl?",
    subtitle: "Für regionale Verfügbarkeit von Bluttests",
    type: "input",
    placeholder: "z.B. 10115"
  },
  {
    id: "goal",
    icon: Target,
    question: "Was ist dein primäres Gesundheitsziel?",
    subtitle: "Wir priorisieren Empfehlungen basierend darauf",
    type: "select",
    options: [
      { value: "performance", label: "Peak Performance" },
      { value: "longevity", label: "Longevity & Anti-Aging" },
      { value: "energy", label: "Mehr Energie" },
      { value: "weight", label: "Gewichtsmanagement" },
      { value: "sleep", label: "Besserer Schlaf" },
      { value: "mental", label: "Mentale Klarheit" },
      { value: "muscle", label: "Muskelaufbau" },
      { value: "recovery", label: "Schnellere Regeneration" }
    ]
  },
  {
    id: "health_conditions",
    icon: Heart,
    question: "Hast du bekannte Gesundheitsthemen?",
    subtitle: "Optional - hilft bei personalisierten Empfehlungen",
    type: "multiselect",
    options: [
      { value: "none", label: "Keine" },
      { value: "thyroid", label: "Schilddrüse" },
      { value: "diabetes", label: "Diabetes/Prädiabetes" },
      { value: "cholesterol", label: "Cholesterin" },
      { value: "blood_pressure", label: "Blutdruck" },
      { value: "iron", label: "Eisenmangel" },
      { value: "vitamin_d", label: "Vitamin D Mangel" },
      { value: "other", label: "Andere" }
    ]
  },
  {
    id: "activity_level",
    icon: Dumbbell,
    question: "Wie aktiv bist du?",
    subtitle: "Aktivitätslevel beeinflusst Nährstoffbedarf",
    type: "select",
    options: [
      { value: "sedentary", label: "Wenig aktiv (kaum Sport)" },
      { value: "light", label: "Leicht aktiv (1-2x/Woche)" },
      { value: "moderate", label: "Moderat (3-4x/Woche)" },
      { value: "active", label: "Sehr aktiv (5+x/Woche)" },
      { value: "athlete", label: "Athlet/Profisportler" }
    ]
  },
  {
    id: "sleep_quality",
    icon: Moon,
    question: "Wie würdest du deinen Schlaf bewerten?",
    subtitle: "Schlafqualität beeinflusst viele Biomarker",
    type: "select",
    options: [
      { value: "poor", label: "Schlecht (< 5 Stunden)" },
      { value: "fair", label: "Okay (5-6 Stunden)" },
      { value: "good", label: "Gut (7-8 Stunden)" },
      { value: "excellent", label: "Sehr gut (8+ Stunden)" }
    ]
  },
  {
    id: "diet",
    icon: Apple,
    question: "Wie ernährst du dich hauptsächlich?",
    subtitle: "Hilft bei Ernährungsempfehlungen",
    type: "select",
    options: [
      { value: "standard", label: "Gemischt/Standard" },
      { value: "vegetarian", label: "Vegetarisch" },
      { value: "vegan", label: "Vegan" },
      { value: "keto", label: "Keto/Low-Carb" },
      { value: "paleo", label: "Paleo" },
      { value: "mediterranean", label: "Mediterran" }
    ]
  }
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState("");

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      window.location.href = createPageUrl("Home");
    }
  });

  const handleSelect = (value) => {
    const currentQuestion = questions[step];
    
    if (currentQuestion.type === "multiselect") {
      const currentValues = answers[currentQuestion.id] || [];
      let newValues;
      
      if (value === "none") {
        newValues = ["none"];
      } else {
        newValues = currentValues.filter(v => v !== "none");
        if (currentValues.includes(value)) {
          newValues = newValues.filter(v => v !== value);
        } else {
          newValues = [...newValues, value];
        }
      }
      
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: newValues
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: value
      }));
      
      // Auto-advance for select type
      setTimeout(() => {
        if (step < questions.length - 1) {
          setStep(step + 1);
        }
      }, 300);
    }
  };

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      setAnswers(prev => ({
        ...prev,
        [questions[step].id]: inputValue.trim()
      }));
      setInputValue("");
      
      setTimeout(() => {
        if (step < questions.length - 1) {
          setStep(step + 1);
        }
      }, 300);
    }
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Flatten multiselect arrays to strings
      const processedAnswers = { ...answers };
      if (Array.isArray(processedAnswers.health_conditions)) {
        processedAnswers.health_conditions = processedAnswers.health_conditions.join(',');
      }
      
      updateUserMutation.mutate({
        onboarding_completed: true,
        ...processedAnswers
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

  const isAnswered = currentQuestion.type === "multiselect" 
    ? currentAnswer?.length > 0 
    : currentQuestion.type === "input" 
      ? inputValue.trim() || currentAnswer
      : currentAnswer;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Progress Bar */}
      <div className="px-6 pt-6">
        <div className="flex gap-1.5 max-w-md mx-auto">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                idx < step ? "bg-[#3B7C9E]" : 
                idx === step ? "bg-[#B7323F]" : 
                "bg-[#1A1A1A]"
              }`}
            />
          ))}
        </div>
        <p className="text-center text-[#666666] text-sm mt-4">
          {step + 1} von {questions.length}
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
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#B7323F30]"
              >
                <Icon className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {currentQuestion.question}
              </h1>
              <p className="text-[#808080]">
                {currentQuestion.subtitle}
              </p>
            </div>

            {currentQuestion.type === "input" ? (
              <div className="space-y-4">
                <Input
                  value={inputValue || currentAnswer || ""}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="w-full bg-[#111111] border-[#333333] text-white text-lg py-6 px-4 rounded-xl focus:border-[#B7323F]"
                  onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                />
                <Button
                  onClick={handleInputSubmit}
                  disabled={!inputValue.trim() && !currentAnswer}
                  className="w-full bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 rounded-xl"
                >
                  Weiter
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentQuestion.type === "multiselect"
                    ? currentAnswer?.includes(option.value)
                    : currentAnswer === option.value;
                  
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? "bg-[#B7323F20] border-[#B7323F] text-white"
                          : "bg-[#111111] border-[#1A1A1A] text-[#808080] hover:border-[#333333] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? "border-[#B7323F] bg-[#B7323F]" : "border-[#666666]"
                        }`}>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-white"
                            />
                          )}
                        </div>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Continue button for multiselect */}
            {currentQuestion.type === "multiselect" && (
              <Button
                onClick={handleNext}
                disabled={!isAnswered}
                className="w-full mt-6 bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 rounded-xl"
              >
                Weiter
              </Button>
            )}
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
              Zurück
            </Button>
          )}
          {step === questions.length - 1 && currentQuestion.type !== "multiselect" && (
            <Button
              onClick={handleNext}
              disabled={!isAnswered || updateUserMutation.isPending}
              className="flex-1 bg-[#B7323F] hover:bg-[#9A2835] text-white"
            >
              {updateUserMutation.isPending ? "Speichern..." : "Fertig"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}