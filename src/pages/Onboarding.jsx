import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, User, Target, Activity, Moon, Utensils, Heart, Calendar, Weight } from "lucide-react";

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
    id: "age",
    icon: Calendar,
    question: "Wie alt bist du?",
    subtitle: "Für altersgerechte Empfehlungen",
    type: "select",
    options: [
      { value: "18-25", label: "18-25 Jahre" },
      { value: "26-35", label: "26-35 Jahre" },
      { value: "36-45", label: "36-45 Jahre" },
      { value: "46-55", label: "46-55 Jahre" },
      { value: "56+", label: "56+ Jahre" }
    ]
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
      { value: "weight", label: "Gewichtsmanagement" }
    ]
  },
  {
    id: "activity_level",
    icon: Activity,
    question: "Wie aktiv bist du?",
    subtitle: "Dein durchschnittliches Aktivitätslevel",
    type: "select",
    options: [
      { value: "sedentary", label: "Wenig aktiv (Bürojob)" },
      { value: "light", label: "Leicht aktiv (1-2x/Woche)" },
      { value: "moderate", label: "Moderat aktiv (3-4x/Woche)" },
      { value: "very_active", label: "Sehr aktiv (5-6x/Woche)" },
      { value: "athlete", label: "Athlet (täglich)" }
    ]
  },
  {
    id: "sleep_quality",
    icon: Moon,
    question: "Wie ist deine Schlafqualität?",
    subtitle: "Durchschnittlich pro Nacht",
    type: "select",
    options: [
      { value: "poor", label: "Schlecht (<5h)" },
      { value: "fair", label: "Okay (5-6h)" },
      { value: "good", label: "Gut (7-8h)" },
      { value: "excellent", label: "Exzellent (8-9h)" }
    ]
  },
  {
    id: "diet",
    icon: Utensils,
    question: "Welche Ernährungsweise verfolgst du?",
    subtitle: "Für passende Food-Empfehlungen",
    type: "select",
    options: [
      { value: "omnivore", label: "Alles (Omnivor)" },
      { value: "vegetarian", label: "Vegetarisch" },
      { value: "vegan", label: "Vegan" },
      { value: "keto", label: "Keto/Low-Carb" },
      { value: "paleo", label: "Paleo" }
    ]
  },
  {
    id: "health_conditions",
    icon: Heart,
    question: "Hast du bekannte Gesundheitsprobleme?",
    subtitle: "Für sichere Empfehlungen",
    type: "select",
    options: [
      { value: "none", label: "Keine" },
      { value: "diabetes", label: "Diabetes" },
      { value: "hypertension", label: "Bluthochdruck" },
      { value: "thyroid", label: "Schilddrüsenprobleme" },
      { value: "other", label: "Andere" }
    ]
  }
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentQuestion = questions[step];
  const Icon = currentQuestion.icon;

  const handleSelect = async (value) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value
    };

    setAnswers(newAnswers);

    // Auto-advance or finish
    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      // Last question - save to Supabase
      await saveProfile(newAnswers);
    }
  };

  const saveProfile = async (data) => {
    setSaving(true);

    try {
      // Update user profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          gender: data.gender,
          age_range: data.age,
          goal: data.goal,
          activity_level: data.activity_level,
          sleep_quality: data.sleep_quality,
          diet: data.diet,
          health_conditions: data.health_conditions,
          onboarding_completed: true
        })
        .eq('id', user.id);

      if (error) throw error;

      // Navigate to upload
      navigate('/upload');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Fehler beim Speichern. Bitte versuche es erneut.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentAnswer = answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Progress Bar */}
      <div className="px-6 pt-6">
        <div className="flex gap-1.5 max-w-md mx-auto">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${idx < step ? "bg-[#3B7C9E]" :
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

            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = currentAnswer === option.value;

                return (
                  <motion.button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    disabled={saving}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${isSelected
                        ? "bg-[#B7323F20] border-[#B7323F] text-white"
                        : "bg-[#111111] border-[#1A1A1A] text-[#808080] hover:border-[#333333] hover:text-white"
                      } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-[#B7323F] bg-[#B7323F]" : "border-[#666666]"
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

            {saving && (
              <div className="mt-6 text-center">
                <div className="inline-block w-6 h-6 border-4 border-[#B7323F] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400 mt-2">Speichere dein Profil...</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-[#1A1A1A]">
        <div className="flex gap-4 max-w-md mx-auto">
          {step > 0 && !saving && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 bg-[#1A1A1A] border-[#333333] text-white hover:bg-[#222222]"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}