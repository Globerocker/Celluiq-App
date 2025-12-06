import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, User, Calendar, Ruler, Weight, Activity, Upload } from "lucide-react";

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
    type: "number",
    placeholder: "z.B. 35",
    unit: "Jahre"
  },
  {
    id: "height",
    icon: Ruler,
    question: "Wie groß bist du?",
    subtitle: "In Zentimetern",
    type: "number",
    placeholder: "z.B. 175",
    unit: "cm"
  },
  {
    id: "weight",
    icon: Weight,
    question: "Wie viel wiegst du?",
    subtitle: "In Kilogramm",
    type: "number",
    placeholder: "z.B. 75",
    unit: "kg"
  },
  {
    id: "bloodwork",
    icon: Activity,
    question: "Lade dein Blutbild hoch",
    subtitle: "PDF oder Bild deiner Laborergebnisse",
    type: "upload"
  }
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
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
    setError(null);

    // Auto-advance
    if (step < questions.length - 1) {
      setTimeout(() => {
        setStep(step + 1);
        setInputValue("");
      }, 300);
    } else {
      // Last question - save
      await saveProfile(newAnswers);
    }
  };

  const handleNumberSubmit = async () => {
    const numValue = parseInt(inputValue);

    if (!inputValue || numValue <= 0) {
      setError("Bitte gib einen gültigen Wert ein");
      return;
    }

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: numValue
    };

    setAnswers(newAnswers);
    setError(null);

    if (step < questions.length - 1) {
      setStep(step + 1);
      setInputValue("");
    } else {
      await saveProfile(newAnswers);
    }
  };

  const saveProfile = async (data) => {
    if (!user) {
      setError("Nicht eingeloggt. Bitte melde dich an.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          gender: data.gender,
          age: data.age,
          height: data.height,
          weight: data.weight,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Success - navigate to upload
      navigate('/upload');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Fehler beim Speichern. Bitte versuche es erneut.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setError(null);
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

            {currentQuestion.type === "select" ? (
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
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNumberSubmit()}
                    placeholder={currentQuestion.placeholder}
                    className="w-full px-6 py-4 bg-[#111111] border-2 border-[#1A1A1A] rounded-xl text-white text-lg focus:border-[#B7323F] focus:outline-none transition-colors"
                    disabled={saving}
                  />
                  {currentQuestion.unit && (
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500">
                      {currentQuestion.unit}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleNumberSubmit}
                  disabled={!inputValue || saving}
                  className="w-full bg-[#B7323F] hover:bg-[#9A2835] text-white py-4 text-lg rounded-xl disabled:opacity-50 transition-colors"
                >
                  {step === questions.length - 1 ? 'Abschließen' : 'Weiter'}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-500 text-sm text-center">{error}</p>
              </div>
            )}

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
            <button
              onClick={handleBack}
              className="flex-1 bg-[#1A1A1A] border-2 border-[#333333] text-white hover:bg-[#222222] py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Zurück
            </button>
          )}
        </div>
      </div>
    </div>
  );
}