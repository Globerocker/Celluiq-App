import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import { Check, Sparkles, Dna, Brain, FlaskConical } from "lucide-react";

const loadingSteps = [
  { icon: Check, text: "Account erstellt", subtext: "Willkommen bei CELLUIQ" },
  { icon: Dna, text: "Profil wird analysiert", subtext: "Deine Angaben werden verarbeitet" },
  { icon: FlaskConical, text: "Referenzwerte werden geladen", subtext: "Personalisierte Bereiche" },
  { icon: Brain, text: "Empfehlungen werden erstellt", subtext: "Basierend auf deinem Profil" },
  { icon: Sparkles, text: "Alles bereit!", subtext: "Weiterleitung zu deinem Dashboard" }
];

export default function OnboardingComplete() {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const completeOnboarding = async () => {
      try {
        // Step 1: Account created (already done via login)
        setCurrentStep(1);
        await new Promise(r => setTimeout(r, 800));

        // Step 2: Load saved onboarding data
        setCurrentStep(2);
        const saved = localStorage.getItem('onboarding_data');
        let onboardingData = {};
        
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            onboardingData = parsed.answers || {};
            if (Array.isArray(onboardingData.health_conditions)) {
              onboardingData.health_conditions = onboardingData.health_conditions.join(',');
            }
          } catch (e) {}
        }
        await new Promise(r => setTimeout(r, 800));

        // Step 3: Processing
        setCurrentStep(3);
        await new Promise(r => setTimeout(r, 800));

        // Step 4: Save to user profile
        setCurrentStep(4);
        await base44.auth.updateMe({
          onboarding_completed: true,
          ...onboardingData
        });
        await new Promise(r => setTimeout(r, 800));

        // Step 5: Complete
        setCurrentStep(5);
        localStorage.removeItem('onboarding_data');
        await new Promise(r => setTimeout(r, 1000));

        // Redirect to Home
        window.location.href = createPageUrl("Home");
      } catch (err) {
        console.error('Onboarding completion error:', err);
        setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      }
    };

    completeOnboarding();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = createPageUrl("Splash")}
            className="px-6 py-3 bg-[#B7323F] text-white rounded-xl"
          >
            Zurück zum Start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_#B7323F15,transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_#3B7C9E15,transparent_40%)]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#1A1A1A]" />
            <div 
              className="absolute inset-0 rounded-full border-4 border-t-[#B7323F] animate-spin"
              style={{ animationDuration: '1s' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#B7323F]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Dein Account wird eingerichtet</h1>
          <p className="text-[#808080]">Nur noch einen Moment...</p>
        </div>

        <div className="space-y-3">
          {loadingSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep - 1;
            const isComplete = index < currentStep - 1;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0.3 }}
                animate={{ 
                  opacity: isComplete || isActive ? 1 : 0.3,
                  scale: isActive ? 1.02 : 1
                }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isActive ? 'bg-[#B7323F20] border border-[#B7323F40]' : 
                  isComplete ? 'bg-[#3B7C9E20] border border-[#3B7C9E40]' : 
                  'bg-[#111111] border border-transparent'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isComplete ? 'bg-[#3B7C9E]' : 
                  isActive ? 'bg-[#B7323F]' : 
                  'bg-[#1A1A1A]'
                }`}>
                  {isComplete ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#666666]'}`} />
                  )}
                </div>
                <div>
                  <p className={`font-medium ${isActive || isComplete ? 'text-white' : 'text-[#666666]'}`}>
                    {step.text}
                  </p>
                  <p className="text-[#666666] text-xs">{step.subtext}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}