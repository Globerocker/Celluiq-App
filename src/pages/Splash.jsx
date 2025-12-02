import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

export default function Splash() {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show splash for 2 seconds then redirect to onboarding
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        window.location.href = createPageUrl("Onboarding");
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#B7323F15,transparent_60%)]" />
      
      {/* Logo Animation */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6918fb0cf6a9e7160138f9da/30649b179_IconCELLUIQ.png"
          alt="CELLUIQ"
          className="w-24 h-24 mb-6"
          initial={{ rotate: -180 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        <motion.h1 
          className="text-4xl font-bold text-white tracking-wider"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          CELLUIQ
        </motion.h1>
        
        <motion.p 
          className="text-[#808080] mt-2 text-sm"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Optimize Your Health
        </motion.p>
      </motion.div>

      {/* Loading indicator */}
      <motion.div 
        className="absolute bottom-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#B7323F]"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}