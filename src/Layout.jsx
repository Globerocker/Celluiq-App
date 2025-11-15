import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Droplet, User, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "Blood Test",
    url: createPageUrl("BloodMarkers"),
    icon: Droplet,
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: User,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-[#F6F7F5] pb-20 md:pb-0">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b border-[#24272A1A] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6918fb0cf6a9e7160138f9da/30649b179_IconCELLUIQ.png"
              alt="CELLUIQ"
              className="w-8 h-8"
            />
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6918fb0cf6a9e7160138f9da/7b4f18e64_1.png"
              alt="CELLUIQ"
              className="h-5"
            />
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#24272A1A] flex-col">
        <div className="p-6 border-b border-[#24272A1A]">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6918fb0cf6a9e7160138f9da/30649b179_IconCELLUIQ.png"
              alt="CELLUIQ Icon"
              className="w-10 h-10"
            />
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6918fb0cf6a9e7160138f9da/7b4f18e64_1.png"
              alt="CELLUIQ"
              className="h-6"
            />
          </div>
          <p className="text-xs text-[#64676A] mt-2 font-medium">Personalized Health</p>
        </div>

        <nav className="flex-1 p-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${
                  isActive 
                    ? 'bg-[#B7323F] text-white shadow-md' 
                    : 'hover:bg-[#F6F7F5] text-[#111315]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#24272A1A]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-[#F6F7F5] rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 text-[#64676A]" />
            <span className="font-medium text-[#64676A]">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#24272A1A] px-2 py-2 z-50">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive ? 'text-[#B7323F]' : 'text-[#64676A]'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}