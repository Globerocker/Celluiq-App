import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "../components/LanguageProvider";
import ProUpgradeModal from "../components/ProUpgradeModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { de, enUS, es } from "date-fns/locale";
import { 
  User, 
  Moon, 
  Bell, 
  Lock, 
  LogOut,
  Activity,
  Sparkles,
  ChevronLeft,
  Camera,
  Droplet,
  TrendingUp,
  Award,
  Pencil,
  Check,
  X
} from "lucide-react";

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });
  const [showProModal, setShowProModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bloodMarkers = [] } = useQuery({
    queryKey: ['bloodMarkers'],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
  });

  // Calculate stats
  const latestMarkers = bloodMarkers.reduce((acc, marker) => {
    if (!acc[marker.marker_name] || new Date(marker.test_date) > new Date(acc[marker.marker_name].test_date)) {
      acc[marker.marker_name] = marker;
    }
    return acc;
  }, {});
  const markerCount = Object.keys(latestMarkers).length;
  const optimalCount = Object.values(latestMarkers).filter(m => m.status === 'optimal').length;
  const healthScore = markerCount > 0 ? Math.round((optimalCount / markerCount) * 100) : 0;
  const testDates = [...new Set(bloodMarkers.map(m => m.test_date))];

  const stats = [
    { label: "Bluttests", value: testDates.length, icon: Droplet },
    { label: "Health Score", value: `${healthScore}%`, icon: TrendingUp },
    { label: "Marker", value: markerCount, icon: Activity },
    { label: "Optimal", value: optimalCount, icon: Award }
  ];

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setIsEditing(false);
    }
  });

  // Initialize edit data when user loads
  useEffect(() => {
    if (user && !isEditing) {
      setEditData({
        full_name: user.full_name || '',
        gender: user.gender || '',
        age_range: user.age_range || '',
        activity_level: user.activity_level || '',
        diet: user.diet || '',
        goal: user.goal || ''
      });
    }
  }, [user, isEditing]);

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
      document.body.style.backgroundColor = '#0A0A0A';
      document.body.style.color = '#FFFFFF';
    } else {
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
      document.body.style.backgroundColor = '#F8F9FA';
      document.body.style.color = '#1A1A1A';
    }
    window.dispatchEvent(new Event('themeChange'));
  };

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_photo: file_url });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = () => {
    updateUserMutation.mutate(editData);
  };

  const isPro = user?.subscription_tier === 'pro';

  const goalOptions = [
    { value: 'performance', label: 'Peak Performance' },
    { value: 'longevity', label: 'Longevity & Anti-Aging' },
    { value: 'energy', label: 'Mehr Energie' },
    { value: 'weight', label: 'Gewichtsmanagement' },
    { value: 'sleep', label: 'Besserer Schlaf' },
    { value: 'mental', label: 'Mentale Klarheit' },
    { value: 'muscle', label: 'Muskelaufbau' },
    { value: 'recovery', label: 'Schnellere Regeneration' }
  ];

  const dateLocale = language === 'de' ? de : language === 'es' ? es : enUS;

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <ProUpgradeModal 
        isOpen={showProModal} 
        onClose={() => setShowProModal(false)} 
        feature="health integrations"
      />
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link to={createPageUrl("Home")}>
          <Button variant="ghost" className="text-[#808080] hover:text-white">
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('backToHome')}
          </Button>
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('profile')} & {t('settings')}</h1>
          <p className="text-[#808080]">{t('manageAccount')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card with Photo */}
          <div className="md:col-span-1 space-y-6">
            <Card className="bg-[#111111] border-[#1A1A1A]">
              <CardContent className="p-6 text-center">
                {/* Profile Photo */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {user?.profile_photo ? (
                    <img 
                      src={user.profile_photo} 
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#3B7C9E] flex items-center justify-center hover:bg-[#2D5F7A] transition-colors"
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
                
                <h2 className="text-xl font-semibold text-white mb-1">
                  {user?.full_name || 'User'}
                </h2>
                <p className="text-[#808080] text-sm mb-4">{user?.email}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="bg-[#0A0A0A] rounded-xl p-3">
                        <Icon className="w-4 h-4 text-[#3B7C9E] mx-auto mb-1" />
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                        <span className="text-[10px] text-[#666666]">{stat.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Pro Upgrade */}
            {!isPro && (
              <Card 
                className="bg-gradient-to-r from-[#B7323F20] to-[#3B7C9E20] border-[#B7323F30] cursor-pointer hover:border-[#B7323F] transition-all"
                onClick={() => setShowProModal(true)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#B7323F] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">Upgrade auf Pro</p>
                      <p className="text-[#808080] text-xs">9€/Monat</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Profile Details & Settings */}
          <div className="md:col-span-2 space-y-6">
            {/* Editable Profile Info */}
            <Card className="bg-[#111111] border-[#1A1A1A]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{t('about')}</h3>
                  {!isEditing ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="text-[#3B7C9E] hover:text-[#3B7C9E]"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Bearbeiten
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        className="text-[#808080]"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={updateUserMutation.isPending}
                        className="bg-[#3B7C9E] hover:bg-[#2D5F7A] text-white"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {t('save')}
                      </Button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[#808080] text-xs block mb-1">Name</label>
                      <Input
                        value={editData.full_name}
                        onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="bg-[#0A0A0A] border-[#333333] text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[#808080] text-xs block mb-1">Geschlecht</label>
                        <Select value={editData.gender} onValueChange={(v) => setEditData(prev => ({ ...prev, gender: v }))}>
                          <SelectTrigger className="bg-[#0A0A0A] border-[#333333] text-white">
                            <SelectValue placeholder="Auswählen" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111111] border-[#333333]">
                            <SelectItem value="male">Männlich</SelectItem>
                            <SelectItem value="female">Weiblich</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[#808080] text-xs block mb-1">Alter</label>
                        <Select value={editData.age_range} onValueChange={(v) => setEditData(prev => ({ ...prev, age_range: v }))}>
                          <SelectTrigger className="bg-[#0A0A0A] border-[#333333] text-white">
                            <SelectValue placeholder="Auswählen" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111111] border-[#333333]">
                            <SelectItem value="18-24">18-24</SelectItem>
                            <SelectItem value="25-34">25-34</SelectItem>
                            <SelectItem value="35-44">35-44</SelectItem>
                            <SelectItem value="45-54">45-54</SelectItem>
                            <SelectItem value="55+">55+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[#808080] text-xs block mb-1">Aktivität</label>
                        <Select value={editData.activity_level} onValueChange={(v) => setEditData(prev => ({ ...prev, activity_level: v }))}>
                          <SelectTrigger className="bg-[#0A0A0A] border-[#333333] text-white">
                            <SelectValue placeholder="Auswählen" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111111] border-[#333333]">
                            <SelectItem value="sedentary">Wenig aktiv</SelectItem>
                            <SelectItem value="light">Leicht aktiv</SelectItem>
                            <SelectItem value="moderate">Moderat aktiv</SelectItem>
                            <SelectItem value="active">Sehr aktiv</SelectItem>
                            <SelectItem value="athlete">Athlet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[#808080] text-xs block mb-1">Ernährung</label>
                        <Select value={editData.diet} onValueChange={(v) => setEditData(prev => ({ ...prev, diet: v }))}>
                          <SelectTrigger className="bg-[#0A0A0A] border-[#333333] text-white">
                            <SelectValue placeholder="Auswählen" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111111] border-[#333333]">
                            <SelectItem value="omnivore">Omnivor</SelectItem>
                            <SelectItem value="vegetarian">Vegetarisch</SelectItem>
                            <SelectItem value="vegan">Vegan</SelectItem>
                            <SelectItem value="keto">Keto</SelectItem>
                            <SelectItem value="paleo">Paleo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[#808080] text-xs block mb-1">{t('goal')}</label>
                      <Select value={editData.goal} onValueChange={(v) => setEditData(prev => ({ ...prev, goal: v }))}>
                        <SelectTrigger className="bg-[#0A0A0A] border-[#333333] text-white">
                          <SelectValue placeholder="Ziel auswählen" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111111] border-[#333333]">
                          {goalOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-[#1A1A1A]">
                      <span className="text-[#666666]">Geschlecht</span>
                      <span className="text-white font-medium">{user?.gender === 'male' ? 'Männlich' : user?.gender === 'female' ? 'Weiblich' : '-'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[#1A1A1A]">
                      <span className="text-[#666666]">{t('age')}</span>
                      <span className="text-white font-medium">{user?.age_range || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[#1A1A1A]">
                      <span className="text-[#666666]">Aktivität</span>
                      <span className="text-white font-medium capitalize">{user?.activity_level?.replace('_', ' ') || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[#1A1A1A]">
                      <span className="text-[#666666]">Ernährung</span>
                      <span className="text-white font-medium capitalize">{user?.diet || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 col-span-2">
                      <span className="text-[#666666]">{t('goal')}</span>
                      <span className="text-white font-medium">{goalOptions.find(g => g.value === user?.goal)?.label || '-'}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* App Settings */}
            <Card className="bg-[#111111] border-[#1A1A1A]">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">{t('preferences')}</h3>
                
                <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#808080]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">{t('language')}</p>
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
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-[#808080]" />
                    <div>
                      <p className="text-white font-medium">{t('darkMode')}</p>
                      <p className="text-xs text-[#666666]">{darkMode ? t('currentlyEnabled') : 'Deaktiviert'}</p>
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
                      <p className="text-white font-medium">{t('notifications')}</p>
                      <p className="text-xs text-[#666666]">{t('getHealthReminders')}</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-[#666666] rotate-180" />
                </Link>

                <Link to={createPageUrl("Subscription")} className="flex items-center justify-between py-3 border-b border-[#1A1A1A] hover:bg-[#1A1A1A] -mx-2 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#808080]" />
                    <div>
                      <p className="text-white font-medium">{t('subscription')}</p>
                      <p className="text-xs text-[#666666]">{t('manageSubscriptionDesc')}</p>
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
                      <p className="text-white font-medium">{t('privacySecurity')}</p>
                      <p className="text-xs text-[#666666]">{t('manageYourData')}</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-[#666666] rotate-180" />
                </a>
              </CardContent>
            </Card>

            {/* Recent Blood Tests */}
            {testDates.length > 0 && (
              <Card className="bg-[#111111] border-[#1A1A1A]">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">{t('bloodTests')}</h3>
                  <div className="space-y-3">
                    {testDates.slice(0, 3).map((date, idx) => {
                      const markersOnDate = bloodMarkers.filter(m => m.test_date === date);
                      const optOnDate = markersOnDate.filter(m => m.status === 'optimal').length;
                      
                      return (
                        <div key={idx} className="flex items-center justify-between py-3 border-b border-[#1A1A1A] last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#3B7C9E20] flex items-center justify-center">
                              <Droplet className="w-5 h-5 text-[#3B7C9E]" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{format(new Date(date), 'dd. MMMM yyyy', { locale: dateLocale })}</p>
                              <p className="text-[#666666] text-xs">{markersOnDate.length} Marker</p>
                            </div>
                          </div>
                          <span className="text-green-400 text-sm font-medium">{optOnDate} optimal</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Logout */}
            <Button 
              onClick={handleLogout}
              className="w-full bg-[#B7323F] text-white hover:bg-[#9A2835]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}