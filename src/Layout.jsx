import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Droplet, User } from "lucide-react";

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "Test",
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

  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b border-[#E8E9E7] px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6918fb0cf6a9e7160138f9da/30649b179_IconCELLUIQ.png"
            alt="CELLUIQ"
            className="w-7 h-7"
          />
          <span className="text-[#111315] font-bold text-lg tracking-wider">CELLUIQ</span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#E8E9E7] flex-col">
        <div className="p-6 border-b border-[#E8E9E7]">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6918fb0cf6a9e7160138f9da/30649b179_IconCELLUIQ.png"
              alt="CELLUIQ Icon"
              className="w-10 h-10"
            />
            <div>
              <span className="text-[#111315] font-bold text-lg tracking-wider block">CELLUIQ</span>
              <p className="text-xs text-[#64676A]">Personalized Health</p>
            </div>
          </div>
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
                    ? 'bg-[#B7323F] text-white' 
                    : 'text-[#64676A] hover:bg-[#F6F7F5]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E9E7] px-2 py-2 z-50">
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