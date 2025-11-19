import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Settings, User } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#111111] border-b border-[#1A1A1A] px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6918fb0cf6a9e7160138f9da/30649b179_IconCELLUIQ.png"
              alt="CELLUIQ"
              className="w-7 h-7"
            />
            <span className="text-white font-bold text-lg tracking-wider">CELLUIQ</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link 
              to={createPageUrl("Profile")}
              className="p-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
            >
              <User className="w-6 h-6 text-[#808080] hover:text-white transition-colors" />
            </Link>
            <Link 
              to={createPageUrl("Settings")}
              className="p-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
            >
              <Settings className="w-6 h-6 text-[#808080] hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}