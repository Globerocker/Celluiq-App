import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, User, Calendar, Ruler, Weight, Activity, Upload } from "lucide-react";
import { useLanguage } from '@/components/LanguageProvider';

export default function Onboarding() {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  // inputValue is now an object for composite steps: { height: "", weight: "" }
  const [inputValues, setInputValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Dynamic questions based on language
  const questions = [
    {
      id: "gender",
      icon: User,
      question: t('genderQuestion'),
      subtitle: t('genderSubtitle'),
      type: "select",
      options: [
        { value: "male", label: t('male') },
        { value: "female", label: t('female') }
      ]
    },
    {
      id: "age",
      icon: Calendar,
      question: t('ageQuestion'),
      subtitle: t('ageSubtitle'),
      type: "number",
      placeholder: "35",
      unit: t('years')
    },
    {
      id: "biometrics",
      icon: Ruler,
      question: t('biometricsQuestion'),
      subtitle: t('biometricsSubtitle'),
      type: "composite",
      fields: [
        { id: "height", label: t('height'), placeholder: "175", unit: t('cm') },
        { id: "weight", label: t('weight'), placeholder: "75", unit: t('kg') }
      ]
    },
    {
      id: "bloodwork",
      icon: Activity,
      question: t('bloodworkQuestion'),
      subtitle: t('bloodworkSubtitle'),
      type: "upload"
    }
  ];

  const currentQuestion = questions[step];
  const Icon = currentQuestion.icon;

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Critical: Gender must be set for analysis
    if (!answers.gender) {
      setError(t('validValueError') + " " + t('gender'));
      return;
    }

    setSaving(true);
    setError(null);
    let demoMode = false;
    const isDevUser = user?.id === 'dev-user-id' || localStorage.getItem('celluiq_dev_mode') === 'true';

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id || 'guest'}/${Date.now()}.${fileExt}`;

      // 1. Upload File
      const { error: uploadError } = await supabase.storage
        .from('blood-work')
        .upload(fileName, file);

      if (uploadError) {
        console.warn("Upload failed, switching to demo mode", uploadError);
        demoMode = true;
      }

      // 2. Ensure Profile data is synced
      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            gender: answers.gender,
            age: answers.age,
            height: answers.height,
            weight: answers.weight,
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          console.warn("Profile update failed, proceeding:", updateError);
          // Force demo mode if DB write failed
          if (!demoMode) demoMode = true;
        }
      } else {
        console.log("🛠️ Dev Mode: Skipping Profile DB Update");
        demoMode = true;
      }

      // Navigate to analysis
      navigate('/analyzing', {
        state: {
          filePath: fileName,
          demoMode: demoMode || isDevUser
        }
      });
    } catch (err) {
      console.error('Error saving profile (critical):', err);
      // Fallback: Proceed anyway
      navigate('/analyzing', { state: { demoMode: true } });
    }
    setSaving(false);
  };



  const handleSelect = async (value) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    setError(null);

    // Immediate Save
    if (['gender'].includes(currentQuestion.id) && user) {
      try {
        const { error } = await supabase.from('profiles').update({
          gender: value,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
        if (error) console.warn("Supabase update error (ignoring):", error);
      } catch (err) { console.error(err); }
    }

    if (step < questions.length - 1) {
      setTimeout(() => {
        setStep(step + 1);
        setInputValues({});
      }, 300);
    }
  };

  const handleCompositeSubmit = async () => {
    // Validate all fields in the current composite step
    const fields = currentQuestion.fields;
    const values = {};

    for (const field of fields) {
      const val = parseInt(inputValues[field.id]);
      if (!val || val <= 0) {
        setError(`${t('validValueError')} ${field.label}`);
        return;
      }
      values[field.id] = val;
    }

    const newAnswers = { ...answers, ...values };
    setAnswers(newAnswers);
    setError(null);

    // Save
    if (user) {
      try {
        const { error } = await supabase.from('profiles').update({
          ...values,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
        if (error) console.warn("Supabase update error (ignoring):", error);
      } catch (err) { console.error(err); }
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
      setInputValues({});
    }
  };

  const handleInputChange = (fieldId, value) => {
    setInputValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleNumberSubmit = async () => {
    const val = parseInt(inputValues.single);
    if (!val || val <= 0) {
      setError(t('validValueError') + " " + t('years'));
      return;
    }

    const newAnswers = { ...answers, [currentQuestion.id]: val };
    setAnswers(newAnswers);
    setError(null);

    // Save
    if (user) {
      try {
        const { error } = await supabase.from('profiles').update({
          [currentQuestion.id]: val,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
        if (error) console.warn("Supabase update error (ignoring):", error);
      } catch (err) { console.error(err); }
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
      setInputValues({});
    }
  };

  const handleSkipUpload = async () => {
    // Mark onboarding as complete even without file
    setSaving(true);
    let demoMode = localStorage.getItem('celluiq_dev_mode') === 'true';

    try {
      if (user && !demoMode) {
        const { error } = await supabase.from('profiles').update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
          ...answers
        }).eq('id', user.id);

        if (error) {
          console.warn("Skip upload DB save failed:", error);
          demoMode = true;
        }
      }
      navigate('/dashboard');
    } catch (e) {
      console.error("Error skipping", e);
      navigate('/dashboard');
    }
    setSaving(false);
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
          {t('step')} {step + 1} {t('of')} {questions.length}
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

            {currentQuestion.type === "select" && (
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
            )}

            {currentQuestion.type === "number" && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    value={inputValues.single || ""}
                    onChange={(e) => setInputValues({ ...inputValues, single: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleNumberSubmit()}
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
                <Button
                  onClick={handleNumberSubmit}
                  disabled={!inputValues.single || saving}
                  className="w-full bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 text-lg rounded-xl disabled:opacity-50"
                >
                  {t('next')}
                </Button>
              </div>
            )}

            {currentQuestion.type === "composite" && (
              <div className="space-y-4">
                {currentQuestion.fields.map((field) => (
                  <div key={field.id} className="relative">
                    <label className="text-xs text-gray-500 mb-1 block ml-2">{field.label}</label>
                    <input
                      type="number"
                      value={inputValues[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-6 py-4 bg-[#111111] border-2 border-[#1A1A1A] rounded-xl text-white text-lg focus:border-[#B7323F] focus:outline-none transition-colors"
                      disabled={saving}
                    />
                    <span className="absolute right-6 top-[38px] text-gray-500">
                      {field.unit}
                    </span>
                  </div>
                ))}
                <Button
                  onClick={handleCompositeSubmit}
                  disabled={saving}
                  className="w-full bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 text-lg rounded-xl mt-2"
                >
                  {t('next')}
                </Button>
              </div>
            )}

            {currentQuestion.type === "upload" && (
              <div className="space-y-4">
                <div className="relative border-2 border-dashed border-[#333333] rounded-xl p-8 text-center hover:border-[#B7323F] transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={saving}
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center group-hover:bg-[#222222] transition-colors">
                      <Upload className="w-8 h-8 text-[#666666] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">{t('selectFile')}</p>
                      <p className="text-sm text-gray-500">{t('bloodworkSubtitle')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <Button
                    onClick={handleSkipUpload}
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    {t('skipUpload')}
                  </Button>
                  <div className="text-center text-xs text-gray-600">
                    {t('manualEntryLater')}
                  </div>
                </div>

                <p className="text-xs text-center text-gray-600">
                  {t('encryptedData')}
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-bottom-2">
                <p className="text-red-500 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            {saving && (
              <div className="mt-6 text-center">
                <div className="inline-block w-6 h-6 border-4 border-[#B7323F] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400 mt-2">
                  {currentQuestion.type === 'upload' ? t('uploading') : t('saving')}
                </p>
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
              {t('back')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}