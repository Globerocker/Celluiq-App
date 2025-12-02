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
  ChevronRight,
  Camera,
  Droplet,
  TrendingUp,
  Award,
  Pencil,
  Check,
  X
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bloodMarkers = [] } = useQuery({
    queryKey: ['bloodMarkers'],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setIsEditing(false);
    }
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

  useEffect(() => {
    const isDark = localStorage.getItem('theme') !== 'light';
    setDarkMode(isDark);
    if (!isDark) {
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
    }
  }, []);

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
    }
    setUploading(false);
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

  const activityOptions = [
    { value: 'sedentary', label: 'Wenig aktiv' },
    { value: 'light', label: 'Leicht aktiv' },
    { value: 'moderate', label: 'Moderat aktiv' },
    { value: 'active', label: 'Sehr aktiv' },
    { value: 'athlete', label: 'Athlet' }
  ];

  const dietOptions = [
    { value: 'omnivore', label: 'Mischkost' },
    { value: 'vegetarian', label: 'Vegetarisch' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' }
  ];

  const dateLocale = language === 'de' ? de : language === 'es' ? es : enUS;

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <ProUpgradeModal isOpen={showProModal} onClose={() => setShowProModal(false)} feature="health integrations" />
      <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link to={createPageUrl("Home")}>
          <Button variant="ghost" className="text-[#808080] hover:text-white">
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('backToHome')}
          </Button>
        </Link>

        {/* Profile Header Card */}
        <Card className="bg-gradient-to-br from-[#111111] to-[#1A1A1A] border-[#1A1A1A] overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Photo */}
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] flex items-center justify-center">
                  {user?.profile_photo ? (
                    <img src={user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-14 h-14 text-white" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#3B7C9E] flex items-center justify-center border-4 border-[#111111] hover:bg-[#2D5F7A] transition-colors"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-white mb-1">{user?.full_name || 'User'}</h1>
                <p className="text-[#808080] text-sm mb-4">{user?.email}</p>
                
                {/* Stats Row */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 bg-[#0A0A0A] px-4 py-2 rounded-xl">
                    <Droplet className="w-4 h-4 text-[#3B7C9E]" />
                    <span className="text-white font-semibold">{testDates.length}</span>
                    <span className="text-[#666666] text-sm">Tests</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#0A0A0A] px-4 py-2 rounded-xl">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-white font-semibold">{healthScore}%</span>
                    <span className="text-[#666666] text-sm">Score</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#0A0A0A] px-4 py-2 rounded-xl">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-white font-semibold">{optimalCount}</span>
                    <span className="text-[#666666] text-sm">Optimal</span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-[#1A1A1A] text-white hover:bg-[#222222]"
              >
                <Pencil className="w-4 h-4 mr-2" />
                {t('profile')} bearbeiten
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="bg-[#111111] border-[#333333] text-white max-w-md">
            <DialogHeader>
              <DialogTitle>{t('profile')} bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-[#808080] text-sm mb-1 block">Name</label>
                <Input
                  value={editData.full_name || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="bg-[#0A0A0A] border-[#333333] text-white"
                />
              </div>
              
              <div>
                <label className="text-[#808080] text-sm mb-1 block">Geschlecht</label>
                <Select value={editData.gender} onValueChange={(v) => setEditData(prev => ({ ...prev, gender: v }))}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#333333] text-white">
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#333333]">
                    <SelectItem value="male" className="text-white">Männlich</SelectItem>
                    <SelectItem value="female" className="text-white">Weiblich</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[#808080] text-sm mb-1 block">Altersgruppe</label>
                <Select value={editData.age_range} onValueChange={(v) => setEditData(prev => ({ ...prev, age_range: v }))}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#333333] text-white">
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#333333]">
                    <SelectItem value="18-25" className="text-white">18-25</SelectItem>
                    <SelectItem value="26-35" className="text-white">26-35</SelectItem>
                    <SelectItem value="36-45" className="text-white">36-45</SelectItem>
                    <SelectItem value="46-55" className="text-white">46-55</SelectItem>
                    <SelectItem value="56+" className="text-white">56+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[#808080] text-sm mb-1 block">Aktivitätslevel</label>
                <Select value={editData.activity_level} onValueChange={(v) => setEditData(prev => ({ ...prev, activity_level: v }))}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#333333] text-white">
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#333333]">
                    {activityOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-white">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[#808080] text-sm mb-1 block">Ernährung</label>
                <Select value={editData.diet} onValueChange={(v) => setEditData(prev => ({ ...prev, diet: v }))}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#333333] text-white">
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#333333]">
                    {dietOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-white">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[#808080] text-sm mb-1 block">Ziel</label>
                <Select value={editData.goal} onValueChange={(v) => setEditData(prev => ({ ...prev, goal: v }))}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#333333] text-white">
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#333333]">
                    {goalOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-white">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 border-[#333333] text-white hover:bg-[#1A1A1A]" onClick={() => setIsEditing(false)}>
                  Abbrechen
                </Button>
                <Button 
                  className="flex-1 bg-[#B7323F] hover:bg-[#9A2835]" 
                  onClick={handleSaveProfile}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? 'Speichern...' : 'Speichern'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Pro Banner */}
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
                    <Button className="bg-[#B7323F] hover:bg-[#9A2835] text-white text-sm">Upgrade</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* About You Card */}
            <Card className="bg-[#111111] border-[#1A1A1A]">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Über dich</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-[#1A1A1A]">
                    <span className="text-[#666666]">Geschlecht</span>
                    <span className="text-white">{user?.gender === 'male' ? 'Männlich' : user?.gender === 'female' ? 'Weiblich' : '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#1A1A1A]">
                    <span className="text-[#666666]">Altersgruppe</span>
                    <span className="text-white">{user?.age_range || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#1A1A1A]">
                    <span className="text-[#666666]">Aktivität</span>
                    <span className="text-white capitalize">{activityOptions.find(o => o.value === user?.activity_level)?.label || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#1A1A1A]">
                    <span className="text-[#666666]">Ernährung</span>
                    <span className="text-white">{dietOptions.find(o => o.value === user?.diet)?.label || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#666666]">Ziel</span>
                    <span className="text-white">{goalOptions.find(o => o.value === user?.goal)?.label || '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Tests */}
            {testDates.length > 0 && (
              <Card className="bg-[#111111] border-[#1A1A1A]">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Letzte Bluttests</h3>
                  <div className="space-y-3">
                    {testDates.slice(0, 3).map((date, idx) => {
                      const markersOnDate = bloodMarkers.filter(m => m.test_date === date);
                      const optOnDate = markersOnDate.filter(m => m.status === 'optimal').length;
                      return (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-[#1A1A1A] last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#3B7C9E20] flex items-center justify-center">
                              <Droplet className="w-4 h-4 text-[#3B7C9E]" />
                            </div>
                            <div>
                              <p className="text-white text-sm">{format(new Date(date), 'dd. MMM yyyy', { locale: dateLocale })}</p>
                              <p className="text-[#666666] text-xs">{markersOnDate.length} Marker</p>
                            </div>
                          </div>
                          <span className="text-green-400 text-sm">{optOnDate} optimal</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Subscription */}
            <Card className="bg-[#111111] border-[#1A1A1A]">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{t('subscription')}</h3>
                <p className="text-sm text-[#808080] mb-4">{t('manageSubscriptionDesc')}</p>
                <Link to={createPageUrl("Subscription")}>
                  <Button className="w-full bg-[#B7323F] text-white hover:bg-[#9A2835]">
                    {t('manageSubscription')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-[#111111] border-[#1A1A1A]">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">{t('preferences')}</h3>
                
                {/* Language */}
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
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32 bg-[#0A0A0A] border-[#333333] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#333333]">
                      <SelectItem value="de" className="text-white">Deutsch</SelectItem>
                      <SelectItem value="en" className="text-white">English</SelectItem>
                      <SelectItem value="es" className="text-white">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-[#808080]" />
                    <div>
                      <p className="text-white font-medium">{t('darkMode')}</p>
                      <p className="text-xs text-[#666666]">{darkMode ? 'Aktiviert' : 'Deaktiviert'}</p>
                    </div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={toggleDarkMode} className="data-[state=checked]:bg-[#3B7C9E]" />
                </div>

                {/* Notifications */}
                <Link to={createPageUrl("Notifications")} className="flex items-center justify-between py-3 border-b border-[#1A1A1A] hover:bg-[#1A1A1A] -mx-2 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#808080]" />
                    <div>
                      <p className="text-white font-medium">{t('notifications')}</p>
                      <p className="text-xs text-[#666666]">{t('getHealthReminders')}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#666666]" />
                </Link>

                {/* Privacy */}
                <a href="https://celluiq.com/privacy" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 hover:bg-[#1A1A1A] -mx-2 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-[#808080]" />
                    <div>
                      <p className="text-white font-medium">{t('privacySecurity')}</p>
                      <p className="text-xs text-[#666666]">{t('manageYourData')}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#666666]" />
                </a>
              </CardContent>
            </Card>

            {/* Connected Devices - Pro Feature */}
            <Card className={`bg-[#111111] border-[#1A1A1A] ${!isPro ? 'relative overflow-hidden' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-[#3B7C9E]" />
                    <h3 className="text-lg font-semibold text-white">{t('connectedDevices')}</h3>
                  </div>
                  {!isPro && <span className="text-xs bg-[#B7323F20] text-[#B7323F] px-2 py-1 rounded-full font-medium">PRO</span>}
                </div>
                <p className="text-sm text-[#666666] mb-4">{t('syncFitnessData')}</p>
                
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
                  <div onClick={() => setShowProModal(true)} className="grid grid-cols-2 gap-3 blur-sm opacity-50 cursor-pointer">
                    <div className="bg-[#1A1A1A] h-20 rounded-xl" />
                    <div className="bg-[#1A1A1A] h-20 rounded-xl" />
                  </div>
                )}
                
                {!isPro && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]/60 cursor-pointer" onClick={() => setShowProModal(true)}>
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
          </div>
        </div>

        {/* Logout Button */}
        <Button onClick={handleLogout} className="w-full bg-[#B7323F] text-white hover:bg-[#9A2835]">
          <LogOut className="w-4 h-4 mr-2" />
          {t('logout')}
        </Button>
      </div>
    </div>
  );
}