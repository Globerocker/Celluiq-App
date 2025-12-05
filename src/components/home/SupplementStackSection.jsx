import React, { useState } from 'react';
import { Sparkles, Lock } from "lucide-react";
import { useLanguage } from '../LanguageProvider';

export default function SupplementStackSection() {
  const { t } = useLanguage();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  React.useEffect(() => {
    const handleThemeChange = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);
  
  const isDark = theme === 'dark';

  return (
    <div className="p-6">
      <div className="text-center py-12">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-[#1A1A1A]' : 'bg-[#F1F5F9]'}`}>
          <Sparkles className={`w-10 h-10 ${isDark ? 'text-[#666666]' : 'text-[#94A3B8]'}`} />
        </div>
        <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
          Supplement Stack Coming Soon
        </h2>
        <p className={`max-w-sm mx-auto ${isDark ? 'text-[#808080]' : 'text-[#64748B]'}`}>
          Personalisierte Supplement-Empfehlungen basierend auf deinen Vital-Daten
        </p>
      </div>
    </div>
  );
}