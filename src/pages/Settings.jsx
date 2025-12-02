import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "../components/LanguageProvider";
import ProUpgradeModal from "../components/ProUpgradeModal";
import { 
  User, 
  Moon, 
  Bell, 
  Lock, 
  LogOut,
  Activity,
  Sparkles,
  ChevronLeft,
  ExternalLink
} from "lucide-react";

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });
  
  const [showProModal, setShowProModal] = useState(false);

  // Apply theme on mount
  useEffect(() => {
    const isDark = localStorage.getItem('theme') !== 'light';
    setDarkMode(isDark);
    if (!isDark) {
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
    }
  }, []);

  const toggleDarkMode = (checked) => {
    setDarkMode(checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
    if (checked) {
      document.documentElement.classList.remove('light-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
    }
  };

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const isPro = user?.subscription_tier === 'pro';

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <ProUpgradeModal 
        isOpen={showProModal} 
        onClose={() => setShowProModal(false)} 
        feature="health integrations"
      />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link to={createPageUrl("Home")}>
          <Button variant="ghost" className="text-[#808080] hover:text-white">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Zurück
          </Button>
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Einstellungen</h1>
          <p className="text-[#808080]">Konto und Präferenzen verwalten</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Pro Subscription Banner */}
            {!isPro && (
              <Card 
                className="bg-gradient-to-r from-[#B7323F20] to-[#3B7C9E20] border-[#B7323F30] cursor-pointer hover:border-[#B7323F] transition-all"
                onClick={() => setShowProModal(true)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#B7323F] flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Upgrade auf Pro</p>
                        <p className="text-[#808080] text-xs">Alle Features für 9€/Monat</p>
                      </div>
                    </div>
                    <Button className="bg-[#B7323F] hover:bg-[#9A2835] text-white text-sm">
                      Upgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile Section */}
            <Card className="bg-[#111111] border-[#1A1A1A]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{user?.full_name || 'User'}</h2>
                    <p className="text-[#808080] text-sm">{user?.email}</p>
                  </div>
                </div>
                <Link to={createPageUrl("Profile")}>
                  <Button className="w-full bg-[#1A1A1A] text-white hover:bg-[#222222]">
                    Profil anzeigen
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Subscription Management */}
            <Card className="bg-[#111111] border-[#1A1A1A]">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Abonnement</h3>
                <p className="text-sm text-[#808080] mb-4">
                  Verwalte dein Supplement-Abo
                </p>
                <Link to={createPageUrl("Subscription")}>
                  <Button className="w-full bg-[#B7323F] text-white hover:bg-[#9A2835]">
                    Abonnement verwalten
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Fitness Tracker Integration */}
            <Card className={`bg-[#111111] border-[#1A1A1A] ${!isPro ? 'relative overflow-hidden' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-[#3B7C9E]" />
                    <h3 className="text-lg font-semibold text-white">Verbundene Geräte</h3>
                  </div>
                  {!isPro && (
                    <span className="text-xs bg-[#B7323F20] text-[#B7323F] px-2 py-1 rounded-full font-medium">PRO</span>
                  )}
                </div>
                <p className="text-sm text-[#666666] mb-4">
                  Synchronisiere Fitnessdaten für personalisierte Empfehlungen
                </p>
                
                {isPro ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="bg-[#1A1A1A] text-white hover:bg-[#222222] h-auto py-3 flex-col gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#0A0A0A] flex items-center justify-center">
                        <Activity className="w-5 h-5 text-[#3B7C9E]" />
                      </div>
                      <span className="text-xs">Apple Health</span>
                    </Button>
                    <Button className="bg-[#1A1A1A] text-white hover:bg-[#222222] h-auto py-3 flex-col gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#0A0A0A] flex items-center justify-center">
                        <Activity className="w-5 h-5 text-[#3B7C9E]" />
                      </div>
                      <span className="text-xs">Garmin</span>
                    </Button>
                  </div>
                ) : (
                  <div 
                    onClick={() => setShowProModal(true)}
                    className="grid grid-cols-2 gap-3 blur-sm opacity-50 cursor-pointer"
                  >
                    <div className="bg-[#1A1A1A] h-20 rounded-xl" />
                    <div className="bg-[#1A1A1A] h-20 rounded-xl" />
                  </div>
                )}
                
                {!isPro && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]/60 cursor-pointer"
                    onClick={() => setShowProModal(true)}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-[#B7323F20] flex items-center justify-center mx-auto mb-2">
                        <Lock className="w-6 h-6 text-[#B7323F]" />
                      </div>
                      <p className="text-white font-medium text-sm">Mit Pro freischalten</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-[#111111] border-[#1A1A1A]">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Einstellungen</h3>
                
                <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#808080]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">Sprache</p>
                      <p className="text-xs text-[#666666]">
                        {language === 'en' ? 'English' : language === 'de' ? 'Deutsch' : 'Español'}
                      </p>
                    </div>
                  </div>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#0A0A0A] text-white text-sm px-3 py-1.5 rounded-lg border border-[#333333] focus:border-[#3B7C9E] focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-[#808080]" />
                    <div>
                      <p className="text-white font-medium">Dark Mode</p>
                      <p className="text-xs text-[#666666]">{darkMode ? 'Aktiviert' : 'Deaktiviert'}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={darkMode} 
                    onCheckedChange={toggleDarkMode}
                    className="data-[state=checked]:bg-[#3B7C9E]"
                  />
                </div>

                <Link to={createPageUrl("Notifications")} className="flex items-center justify-between py-3 border-b border-[#1A1A1A] hover:bg-[#1A1A1A] -mx-2 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#808080]" />
                    <div>
                      <p className="text-white font-medium">Benachrichtigungen</p>
                      <p className="text-xs text-[#666666]">Gesundheitserinnerungen</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-[#666666] rotate-180" />
                </Link>

                <a 
                  href="https://celluiq.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-3 hover:bg-[#1A1A1A] -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-[#808080]" />
                    <div>
                      <p className="text-white font-medium">Datenschutz</p>
                      <p className="text-xs text-[#666666]">Deine Daten verwalten</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-[#666666] rotate-180" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Logout */}
        <Button 
          onClick={handleLogout}
          className="w-full bg-[#B7323F] text-white hover:bg-[#9A2835]"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Abmelden
        </Button>
      </div>
    </div>
  );
}