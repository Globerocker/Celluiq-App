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
      { value: "male", label: "Männlich", icon: "♂️" },
      { value: "female", label: "Weiblich", icon: "♀️" }
    ]
  },
  {
    id: "birth_year",
    icon: User,
    question: "In welchem Jahr bist du geboren?",
    subtitle: "Alter beeinflusst optimale Biomarker-Bereiche",
    type: "input",
    inputType: "number",
    placeholder: "z.B. 1990"
  },
  {
    id: "height",
    icon: User,
    question: "Wie groß bist du?",
    subtitle: "In Zentimetern",
    type: "input",
    inputType: "number",
    placeholder: "z.B. 180"
  },
  {
    id: "weight",
    icon: User,
    question: "Wie viel wiegst du?",
    subtitle: "In Kilogramm",
    type: "input",
    inputType: "number",
    placeholder: "z.B. 75"
  },
  {
    id: "postal_code",
    icon: MapPin,
    question: "Wie lautet deine Postleitzahl?",
    subtitle: "Um Labore in deiner Nähe zu finden",
    type: "input",
    inputType: "text",
    placeholder: "z.B. 10115"
  },
  {
    id: "goal",
    icon: Target,
    question: "Was ist dein primäres Gesundheitsziel?",
    subtitle: "Wir priorisieren Empfehlungen basierend darauf",
    type: "select",
    options: [
      { value: "performance", label: "Peak Performance", icon: "🚀" },
      { value: "longevity", label: "Longevity & Anti-Aging", icon: "⏳" },
      { value: "energy", label: "Mehr Energie", icon: "⚡" },
      { value: "weight", label: "Gewichtsmanagement", icon: "⚖️" },
      { value: "sleep", label: "Besserer Schlaf", icon: "😴" },
      { value: "mental", label: "Mentale Klarheit", icon: "🧠" },
      { value: "muscle", label: "Muskelaufbau", icon: "💪" },
      { value: "hormones", label: "Hormonbalance", icon: "🔄" }
    ]
  },
  {
    id: "activity_level",
    icon: Activity,
    question: "Wie aktiv bist du?",
    subtitle: "Aktivitätslevel beeinflusst Nährstoffbedarf",
    type: "select",
    options: [
      { value: "sedentary", label: "Sitzend (wenig Bewegung)", icon: "🪑" },
      { value: "light", label: "Leicht (1-2x/Woche)", icon: "🚶" },
      { value: "moderate", label: "Moderat (3-4x/Woche)", icon: "🏃" },
      { value: "active", label: "Sehr aktiv (5+x/Woche)", icon: "🏋️" },
      { value: "athlete", label: "Athlet/Profi", icon: "🏆" }
    ]
  },
  {
    id: "training_type",
    icon: Dumbbell,
    question: "Welche Art von Training machst du hauptsächlich?",
    subtitle: "Falls du trainierst",
    type: "select",
    options: [
      { value: "none", label: "Kein Training", icon: "❌" },
      { value: "strength", label: "Krafttraining", icon: "🏋️" },
      { value: "cardio", label: "Ausdauer/Cardio", icon: "🏃" },
      { value: "mixed", label: "Beides", icon: "💪" },
      { value: "sports", label: "Mannschaftssport", icon: "⚽" },
      { value: "yoga", label: "Yoga/Pilates", icon: "🧘" }
    ]
  },
  {
    id: "sleep_quality",
    icon: Moon,
    question: "Wie würdest du deinen Schlaf bewerten?",
    subtitle: "Schlafqualität beeinflusst viele Biomarker",
    type: "select",
    options: [
      { value: "poor", label: "Schlecht (< 5 Stunden)", icon: "😫" },
      { value: "fair", label: "Okay (5-6 Stunden)", icon: "😐" },
      { value: "good", label: "Gut (7-8 Stunden)", icon: "😊" },
      { value: "excellent", label: "Exzellent (8+ Stunden)", icon: "😴" }
    ]
  },
  {
    id: "diet",
    icon: Apple,
    question: "Wie ernährst du dich?",
    subtitle: "Für passende Ernährungsempfehlungen",
    type: "select",
    options: [
      { value: "standard", label: "Standard/Gemischt", icon: "🍽️" },
      { value: "vegetarian", label: "Vegetarisch", icon: "🥗" },
      { value: "vegan", label: "Vegan", icon: "🌱" },
      { value: "keto", label: "Keto/Low-Carb", icon: "🥓" },
      { value: "paleo", label: "Paleo", icon: "🍖" },
      { value: "mediterranean", label: "Mediterran", icon: "🫒" }
    ]
  },
  {
    id: "health_conditions",
    icon: Heart,
    question: "Hast du bekannte gesundheitliche Einschränkungen?",
    subtitle: "Mehrfachauswahl möglich",
    type: "multiselect",
    options: [
      { value: "none", label: "Keine", icon: "✅" },
      { value: "diabetes", label: "Diabetes", icon: "💉" },
      { value: "thyroid", label: "Schilddrüse", icon: "🦋" },
      { value: "heart", label: "Herz-Kreislauf", icon: "❤️" },
      { value: "autoimmune", label: "Autoimmun", icon: "🛡️" },
      { value: "allergies", label: "Allergien", icon: "🤧" }
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
    const currentQuestion = questions[step];
    
    if (currentQuestion.type === 'multiselect') {
      const currentValues = answers[currentQuestion.id] || [];
      let newValues;
      
      if (value === 'none') {
        newValues = ['none'];
      } else {
        newValues = currentValues.filter(v => v !== 'none');
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
      if (currentQuestion.type === 'select') {
        setTimeout(() => {
          if (step < questions.length - 1) {
            setStep(step + 1);
          }
        }, 300);
      }
    }
  };

  const handleInputChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [questions[step].id]: value
    }));
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      updateUserMutation.mutate({
        onboarding_completed: true,
        ...answers,
        health_conditions: answers.health_conditions?.join(',') || ''
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

  const isAnswered = () => {
    if (currentQuestion.type === 'multiselect') {
      return currentAnswer && currentAnswer.length > 0;
    }
    return currentAnswer && currentAnswer.toString().trim() !== '';
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Progress Bar */}
      <div className="px-6 pt-6">
        <div className="flex gap-1.5 max-w-md mx-auto">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                idx <= step ? "bg-[#B7323F]" : "bg-[var(--bg-tertiary)]"
              }`}
            />
          ))}
        </div>
        <p className="text-center text-[var(--text-tertiary)] text-sm mt-4">
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
              <div className="w-16 h-16 rounded-2xl bg-[#B7323F20] flex items-center justify-center mx-auto mb-6">
                <Icon className="w-8 h-8 text-[#B7323F]" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                {currentQuestion.question}
              </h1>
              <p className="text-[var(--text-secondary)]">
                {currentQuestion.subtitle}
              </p>
            </div>

            {currentQuestion.type === 'input' ? (
              <div className="space-y-4">
                <Input
                  type={currentQuestion.inputType}
                  placeholder={currentQuestion.placeholder}
                  value={currentAnswer || ''}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full p-4 text-lg bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-center"
                />
                <Button
                  onClick={handleNext}
                  disabled={!isAnswered()}
                  className="w-full bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 rounded-xl"
                >
                  Weiter
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentQuestion.type === 'multiselect'
                    ? (currentAnswer || []).includes(option.value)
                    : currentAnswer === option.value;
                    
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        isSelected
                          ? "bg-[#B7323F20] border-[#B7323F] text-[var(--text-primary)]"
                          : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]"
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
            
            {currentQuestion.type === 'multiselect' && (
              <Button
                onClick={handleNext}
                disabled={!isAnswered()}
                className="w-full mt-4 bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 rounded-xl"
              >
                Weiter
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-[var(--border-color)]">
        <div className="flex gap-4 max-w-md mx-auto">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          )}
          {step === questions.length - 1 && (
            <Button
              onClick={handleNext}
              disabled={!isAnswered() || updateUserMutation.isPending}
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