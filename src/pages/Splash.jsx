import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn } from "lucide-react";

export default function Splash() {
  const [showChoice, setShowChoice] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          if (user.onboarding_completed) {
            window.location.href = createPageUrl("Home");
          } else {
            window.location.href = createPageUrl("Onboarding");
          }
          return;
        }
      } catch (e) {
        // Not authenticated
      }
      setCheckingAuth(false);
      setTimeout(() => setShowChoice(true), 1500);
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl("Home"));
  };

  const handleNewUser = () => {
    window.location.href = createPageUrl("Onboarding");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B7323F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center relative overflow-hidden px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_#B7323F15,transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_#3B7C9E15,transparent_40%)]" />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6918fb0cf6a9e7160138f9da/30649b179_IconCELLUIQ.png"
          alt="CELLUIQ"
          className="w-24 h-24 mb-6"
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-4xl font-bold text-white tracking-wider mb-2"
      >
        CELLUIQ
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="text-[#808080] text-sm tracking-wide mb-12"
      >
        Optimize Your Biology
      </motion.p>

      {showChoice && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-4"
        >
          <Button
            onClick={handleNewUser}
            className="w-full py-6 bg-[#B7323F] hover:bg-[#9A2835] text-white rounded-xl text-lg font-semibold"
          >
            Jetzt starten
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <Button
            onClick={handleLogin}
            variant="outline"
            className="w-full py-6 bg-[#1A1A1A] border-[#333333] text-white hover:bg-[#222222] rounded-xl text-lg"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Ich habe bereits einen Account
          </Button>
        </motion.div>
      )}
    </div>
  );
}