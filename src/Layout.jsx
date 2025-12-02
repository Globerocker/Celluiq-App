import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Settings, User } from "lucide-react";
import { LanguageProvider } from "./components/LanguageProvider";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  // Apply theme on mount and watch for changes
  useEffect(() => {
    const applyTheme = () => {
      const theme = localStorage.getItem('theme');
      if (theme === 'light') {
        document.documentElement.classList.add('light-mode');
        document.body.classList.add('light-mode');
        document.body.style.backgroundColor = '#F8F9FA';
        document.body.style.color = '#1A1A1A';
      } else {
        document.documentElement.classList.remove('light-mode');
        document.body.classList.remove('light-mode');
        document.body.style.backgroundColor = '#0A0A0A';
        document.body.style.color = '#FFFFFF';
      }
    };
    
    applyTheme();
    
    // Listen for storage changes (theme updates from settings)
    const handleStorage = (e) => {
      if (e.key === 'theme') {
        applyTheme();
      }
    };
    window.addEventListener('storage', handleStorage);
    
    // Also listen for custom event
    const handleThemeChange = () => applyTheme();
    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  return (
    <LanguageProvider>
      <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary, #0A0A0A)' }}>
        {/* Header */}
        <header className="sticky top-0 z-50 border-b px-4 py-3 backdrop-blur-xl transition-colors duration-300" style={{ backgroundColor: 'var(--bg-secondary, #111111)', borderColor: 'var(--border-color, #1A1A1A)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to={createPageUrl("Home")} className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            <div className="relative">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6918fb0cf6a9e7160138f9da/30649b179_IconCELLUIQ.png"
                alt="CELLUIQ"
                className="w-8 h-8 transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#3B7C9E] opacity-0 group-hover:opacity-20 rounded-full blur-xl transition-opacity" />
            </div>
            <span className="font-bold text-xl tracking-wider" style={{ color: 'var(--text-primary, #FFFFFF)' }}>CELLUIQ</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link 
              to={createPageUrl("Profile")}
              className="p-2.5 rounded-xl hover:bg-[#1A1A1A] transition-all hover:scale-105"
            >
              <User className="w-5 h-5 text-[#808080] hover:text-white transition-colors" />
            </Link>
            <Link 
              to={createPageUrl("Settings")}
              className="p-2.5 rounded-xl hover:bg-[#1A1A1A] transition-all hover:scale-105"
            >
              <Settings className="w-5 h-5 text-[#808080] hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </header>

        {/* Main Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}