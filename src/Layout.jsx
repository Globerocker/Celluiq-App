import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Settings, User } from "lucide-react";
import { LanguageProvider } from "./components/LanguageProvider";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  // Apply theme on mount
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, []);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#0A0A0A]">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#111111] border-b border-[#1A1A1A] px-4 py-3 backdrop-blur-xl bg-opacity-90">
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
            <span className="text-white font-bold text-xl tracking-wider">CELLUIQ</span>
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