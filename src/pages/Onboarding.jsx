import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, User, Target, Moon, Apple, MapPin, Heart, Dumbbell, Upload, FileText, Check, Loader2, ArrowRight, Mail, Lock, Sparkles } from "lucide-react";
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
  },
  {
    id: "blood_upload",
    icon: Upload,
    question: "Hast du bereits ein Blutbild?",
    subtitle: "Lade es jetzt hoch für personalisierte Empfehlungen",
    type: "file_upload"
  },
  {
    id: "register",
    icon: Sparkles,
    question: "Erstelle deinen Account",
    subtitle: "Um deine personalisierten Ergebnisse zu sehen",
    type: "register"
  }
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        setIsAuthenticated(auth);
        if (auth) {
          const user = await base44.auth.me();
          if (user.onboarding_completed) {
            window.location.href = createPageUrl("Home");
          }
        }
      } catch (e) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Load saved onboarding data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnswers(parsed.answers || {});
        if (parsed.uploadedFileName) {
          setUploadedFile({ name: parsed.uploadedFileName });
          setUploadSuccess(true);
        }
      } catch (e) {}
    }
  }, []);

  // Save answers to localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('onboarding_data', JSON.stringify({
        answers,
        uploadedFileName: uploadedFile?.name
      }));
    }
  }, [answers, uploadedFile]);

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      localStorage.removeItem('onboarding_data');
      window.location.href = createPageUrl("Home");
    }
  });

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setUploadedFile(file);
    setIsUploading(true);
    
    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Get blood marker references for analysis
      const references = await base44.entities.BloodMarkerReference.list();
      
      // Extract data from PDF/image
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            test_date: { type: "string", description: "Date of the blood test in YYYY-MM-DD format" },
            markers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  marker_name: { type: "string", description: "Name of blood marker" },
                  value: { type: "number", description: "Numeric value" },
                  unit: { type: "string", description: "Unit of measurement" }
                }
              }
            }
          }
        }
      });
      
      if (result.status === "success" && result.output?.markers && result.output.markers.length > 0) {
        const testDate = result.output.test_date || new Date().toISOString().split('T')[0];
        const gender = answers.gender || 'both';
        
        const markersToCreate = result.output.markers
          .filter(m => m.marker_name && m.value !== undefined && m.value !== null)
          .map(marker => {
            const ref = references.find(r => 
              (r.marker_name?.toLowerCase() === marker.marker_name?.toLowerCase() ||
               r.short_name?.toLowerCase() === marker.marker_name?.toLowerCase()) &&
              (r.gender === 'both' || r.gender === gender)
            );
            
            let status = 'optimal';
            const optMin = ref?.celluiq_range_min;
            const optMax = ref?.celluiq_range_max;
            
            if (optMin !== undefined && optMax !== undefined) {
              if (marker.value < optMin * 0.8 || marker.value > optMax * 1.2) {
                status = marker.value < optMin ? 'low' : 'high';
              } else if (marker.value < optMin || marker.value > optMax) {
                status = 'suboptimal';
              }
            }
            
            return {
              test_date: testDate,
              marker_name: marker.marker_name,
              value: marker.value,
              unit: marker.unit || ref?.unit || '',
              optimal_min: optMin,
              optimal_max: optMax,
              status,
              category: ref?.category || 'other'
            };
          });
        
        if (markersToCreate.length > 0) {
          await base44.entities.BloodMarker.bulkCreate(markersToCreate);
          await base44.entities.BloodTestFile.create({
            file_url,
            file_name: file.name,
            upload_date: new Date().toISOString().split('T')[0],
            test_date: testDate,
            markers_extracted: markersToCreate.length,
            status: 'processed'
          });
          
          queryClient.invalidateQueries({ queryKey: ['bloodMarkers'] });
          setUploadSuccess(true);
        } else {
          alert('Keine gültigen Biomarker im Dokument gefunden.');
        }
      } else {
        alert('Keine Biomarker erkannt. Bitte ein gültiges Blutbild hochladen.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Fehler: ' + (error.message || 'Upload fehlgeschlagen'));
    }
    
    setIsUploading(false);
  };

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
    }
  };

  const handleRegister = () => {
    // Save current answers before redirecting to login
    localStorage.setItem('onboarding_data', JSON.stringify({
      answers,
      uploadedFileName: uploadedFile?.name,
      pendingComplete: true
    }));
    // Redirect to login/register - after auth, user comes back and we complete onboarding
    base44.auth.redirectToLogin(createPageUrl("OnboardingComplete"));
  };

  const handleFinishOnboarding = async () => {
    setIsProcessing(true);
    
    const processedAnswers = { ...answers };
    if (Array.isArray(processedAnswers.health_conditions)) {
      processedAnswers.health_conditions = processedAnswers.health_conditions.join(',');
    }
    
    updateUserMutation.mutate({
      onboarding_completed: true,
      ...processedAnswers
    });
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

            {currentQuestion.type === "register" ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#3B7C9E20] to-[#3B7C9E10] border border-[#3B7C9E30] rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#3B7C9E] flex items-center justify-center shrink-0">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Fast geschafft!</p>
                      <p className="text-[#808080] text-sm">
                        Erstelle jetzt deinen kostenlosen Account, um deine personalisierten Empfehlungen zu sehen.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[#111111] rounded-xl border border-[#1A1A1A]">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-white text-sm">Personalisierte Biomarker-Analyse</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#111111] rounded-xl border border-[#1A1A1A]">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-white text-sm">Supplement-Empfehlungen</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#111111] rounded-xl border border-[#1A1A1A]">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-white text-sm">Ernährungs- & Lifestyle-Tipps</span>
                  </div>
                </div>

                <Button
                  onClick={handleRegister}
                  className="w-full py-6 bg-[#B7323F] hover:bg-[#9A2835] text-white rounded-xl text-lg font-semibold"
                >
                  Account erstellen
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-center text-[#666666] text-xs">
                  Mit der Registrierung akzeptierst du unsere Datenschutzbestimmungen
                </p>
              </div>
            ) : currentQuestion.type === "file_upload" ? (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />
                
                {!uploadedFile ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-8 rounded-2xl border-2 border-dashed border-[#333333] bg-[#111111] hover:border-[#B7323F] hover:bg-[#B7323F10] transition-all group"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-[#B7323F20] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-[#B7323F]" />
                      </div>
                      <p className="text-white font-semibold mb-2">Blutbild hochladen</p>
                      <p className="text-[#666666] text-sm">PDF, PNG oder JPG</p>
                    </div>
                  </button>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#111111] border border-[#1A1A1A]">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        uploadSuccess ? 'bg-green-500/20' : isUploading ? 'bg-[#3B7C9E20]' : 'bg-[#1A1A1A]'
                      }`}>
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 text-[#3B7C9E] animate-spin" />
                        ) : uploadSuccess ? (
                          <Check className="w-6 h-6 text-green-500" />
                        ) : (
                          <FileText className="w-6 h-6 text-[#808080]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium truncate">{uploadedFile.name}</p>
                        <p className="text-[#666666] text-sm">
                          {isUploading ? 'Wird analysiert...' : uploadSuccess ? 'Erfolgreich analysiert!' : 'Bereit'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleNext}
                    variant="outline"
                    className="flex-1 bg-[#1A1A1A] border-[#333333] text-white hover:bg-[#222222]"
                  >
                    Überspringen
                  </Button>
                  {uploadSuccess && (
                    <Button
                      onClick={handleNext}
                      className="flex-1 bg-[#B7323F] hover:bg-[#9A2835] text-white"
                    >
                      Weiter
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            ) : currentQuestion.type === "input" ? (
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
      {currentQuestion.type !== "register" && (
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
          </div>
        </div>
      )}
    </div>
  );
}