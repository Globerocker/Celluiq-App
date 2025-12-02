import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Settings, User } from "lucide-react";
import { LanguageProvider } from "./components/LanguageProvider";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Load user for profile photo
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Apply theme on mount and watch for changes
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      setTheme(savedTheme);
      const html = document.documentElement;
      const body = document.body;
      
      if (savedTheme === 'light') {
        html.classList.add('light-mode');
        body.classList.add('light-mode');
      } else {
        html.classList.remove('light-mode');
        body.classList.remove('light-mode');
      }
    };
    
    applyTheme();
    
    const handleStorage = (e) => {
      if (e.key === 'theme') applyTheme();
    };
    window.addEventListener('storage', handleStorage);
    
    const handleThemeChange = () => applyTheme();
    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  // Hide layout on Splash and Onboarding pages
  const hideLayout = currentPageName === 'Splash' || currentPageName === 'Onboarding';
  
  if (hideLayout) {
    return (
      <LanguageProvider>
        {children}
      </LanguageProvider>
    );
  }

  const isDark = theme === 'dark';

  return (
    <LanguageProvider>
      <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F8FAFC]'}`}>
        {/* Header - SOLID background, NOT transparent */}
        <header className={`sticky top-0 z-50 border-b px-4 py-3 ${isDark ? 'bg-[#111111] border-[#222222]' : 'bg-white border-[#E2E8F0]'}`}>
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
              <div className="relative">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6918fb0cf6a9e7160138f9da/30649b179_IconCELLUIQ.png"
                  alt="CELLUIQ"
                  className="w-8 h-8 transition-transform group-hover:scale-110"
                />
              </div>
              <span className={`font-bold text-xl tracking-wider ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>CELLUIQ</span>
            </Link>
            <Link to={createPageUrl("Settings")} className="p-1.5 rounded-xl">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] flex items-center justify-center">
                {user?.profile_photo ? (
                  <img src={user.profile_photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}