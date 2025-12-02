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
  const [darkMode, setDarkMode] = useState(true);
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
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    
    if (!isDark) {
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
      document.body.classList.remove('light-mode');
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
    const newTheme = checked ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    
    const html = document.documentElement;
    const body = document.body;
    
    if (checked) {
      html.classList.remove('light-mode');
      body.classList.remove('light-mode');
    } else {
      html.classList.add('light-mode');
      body.classList.add('light-mode');
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
    { value: 'performance', labelKey: 'peakPerformance' },
    { value: 'longevity', labelKey: 'longevity' },
    { value: 'energy', labelKey: 'moreEnergy' },
    { value: 'weight', labelKey: 'weightManagement' },
    { value: 'sleep', labelKey: 'betterSleep' },
    { value: 'mental', labelKey: 'mentalClarity' },
    { value: 'muscle', labelKey: 'muscleGain' },
    { value: 'recovery', labelKey: 'fasterRecovery' }
  ];

  const activityOptions = [
    { value: 'sedentary', labelKey: 'sedentary' },
    { value: 'light', labelKey: 'lightActive' },
    { value: 'moderate', labelKey: 'moderateActive' },
    { value: 'active', labelKey: 'veryActive' },
    { value: 'athlete', labelKey: 'athlete' }
  ];

  const dietOptions = [
    { value: 'omnivore', labelKey: 'omnivore' },
    { value: 'vegetarian', labelKey: 'vegetarian' },
    { value: 'vegan', labelKey: 'vegan' },
    { value: 'keto', labelKey: 'keto' },
    { value: 'paleo', labelKey: 'paleo' }
  ];

  const dateLocale = language === 'de' ? de : language === 'es' ? es : enUS;

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-[#0A0A0A]' : 'bg-[#F8FAFC]'}`}>
      <ProUpgradeModal isOpen={showProModal} onClose={() => setShowProModal(false)} feature="health integrations" />
      <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link to={createPageUrl("Home")}>
          <Button variant="ghost" className={darkMode ? 'text-[#808080] hover:text-white' : 'text-[#64748B] hover:text-[#0F172A]'}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('backToHome')}
          </Button>
        </Link>

        {/* Profile Header Card */}
        <Card className={`overflow-hidden ${darkMode ? 'bg-gradient-to-br from-[#111111] to-[#1A1A1A] border-[#1A1A1A]' : 'bg-white border-[#E2E8F0]'}`}>
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
                <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{user?.full_name || 'User'}</h1>
                <p className={`text-sm mb-4 ${darkMode ? 'text-[#808080]' : 'text-[#64748B]'}`}>{user?.email}</p>
                
                {/* Stats Row */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${darkMode ? 'bg-[#0A0A0A]' : 'bg-[#F1F5F9]'}`}>
                    <Droplet className="w-4 h-4 text-[#3B7C9E]" />
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{testDates.length}</span>
                    <span className={`text-sm ${darkMode ? 'text-[#666666]' : 'text-[#64748B]'}`}>Tests</span>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${darkMode ? 'bg-[#0A0A0A]' : 'bg-[#F1F5F9]'}`}>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{healthScore}%</span>
                    <span className={`text-sm ${darkMode ? 'text-[#666666]' : 'text-[#64748B]'}`}>Score</span>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${darkMode ? 'bg-[#0A0A0A]' : 'bg-[#F1F5F9]'}`}>
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{optimalCount}</span>
                    <span className={`text-sm ${darkMode ? 'text-[#666666]' : 'text-[#64748B]'}`}>Optimal</span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-[#1A1A1A] text-white hover:bg-[#222222]"
              >
                <Pencil className="w-4 h-4 mr-2" />
                {t('editProfile')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className={`max-w-md ${darkMode ? 'bg-[#111111] border-[#333333] text-white' : 'bg-white border-[#E2E8F0] text-[#0F172A]'}`}>
            <DialogHeader>
              <DialogTitle>{t('editProfile')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className={`text-sm mb-1 block ${darkMode ? 'text-[#808080]' : 'text-[#64748B]'}`}>{t('name')}</label>
                <Input
                  value={editData.full_name || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                  className={darkMode ? 'bg-[#0A0A0A] border-[#333333] text-white' : 'bg-white border-[#E2E8F0] text-[#0F172A]'}
                />
              </div>
              
              <div>
                <label className={`text-sm mb-1 block ${darkMode ? 'text-[#808080]' : 'text-[#64748B]'}`}>{t('gender')}</label>
                <Select value={editData.gender} onValueChange={(v) => setEditData(prev => ({ ...prev, gender: v }))}>
                  <SelectTrigger className={darkMode ? 'bg-[#0A0A0A] border-[#333333] text-white' : 'bg-white border-[#E2E8F0] text-[#0F172A]'}>
                    <SelectValue placeholder={t('select')} />
                  </SelectTrigger>
                  <SelectContent className={darkMode ? 'bg-[#111111] border-[#333333]' : 'bg-white border-[#E2E8F0]'}>
                    <SelectItem value="male" className={darkMode ? 'text-white' : 'text-[#0F172A]'}>{t('male')}</SelectItem>
                    <SelectItem value="female" className={darkMode ? 'text-white' : 'text-[#0F172A]'}>{t('female')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={`text-sm mb-1 block ${darkMode ? 'text-[#808080]' : 'text-[#64748B]'}`}>Altersgruppe</label>
                <Select value={editData.age_range} onValueChange={(v) => setEditData(prev => ({ ...prev, age_range: v }))}>
                  <SelectTrigger className={darkMode ? 'bg-[#0A0A0A] border-[#333333] text-white' : 'bg-white border-[#E2E8F0] text-[#0F172A]'}>
                    <SelectValue placeholder={t('select')} />
                  </SelectTrigger>
                  <SelectContent className={darkMode ? 'bg-[#111111] border-[#333333]' : 'bg-white border-[#E2E8F0]'}>
                    <SelectItem value="18-25" className={darkMode ? 'text-white' : 'text-[#0F172A]'}>18 - 25</SelectItem>
                    <SelectItem value="26-35" className={darkMode ? 'text-white' : 'text-[#0F172A]'}>26 - 35</SelectItem>
                    <SelectItem value="36-45" className={darkMode ? 'text-white' : 'text-[#0F172A]'}>36 - 45</SelectItem>
                    <SelectItem value="46-55" className={darkMode ? 'text-white' : 'text-[#0F172A]'}>46 - 55</SelectItem>
                    <SelectItem value="56+" className={darkMode ? 'text-white' : 'text-[#0F172A]'}>56+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={`text-sm mb-1 block ${darkMode ? 'text-[#808080]' : 'text-[#64748B]'}`}>Aktivitätslevel</label>
                <Select value={editData.activity_level} onValueChange={(v) => setEditData(prev => ({ ...prev, activity_level: v }))}>
                  <SelectTrigger className={darkMode ? 'bg-[#0A0A0A] border-[#333333] text-white' : 'bg-white border-[#E2E8F0] text-[#0F172A]'}>
                    <SelectValue placeholder={t('select')} />
                  </SelectTrigger>
                  <SelectContent className={darkMode ? 'bg-[#111111] border-[#333333]' : 'bg-white border-[#E2E8F0]'}>
                    {activityOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className={darkMode ? 'text-white' : 'text-[#0F172A]'}>{t(opt.labelKey)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={`text-sm mb-1 block ${darkMode ? 'text-[#808080]' : 'text-[#64748B]'}`}>Ernährung</label>
                <Select value={editData.diet} onValueChange={(v) => setEditData(prev => ({ ...prev, diet: v }))}>
                  <SelectTrigger className={darkMode ? 'bg-[#0A0A0A] border-[#333333] text-white' : 'bg-white border-[#E2E8F0] text-[#0F172A]'}>
                    <SelectValue placeholder={t('select')} />
                  </SelectTrigger>
                  <SelectContent className={darkMode ? 'bg-[#111111] border-[#333333]' : 'bg-white border-[#E2E8F0]'}>
                    {dietOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className={darkMode ? 'text-white' : 'text-[#0F172A]'}>{t(opt.labelKey)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={`text-sm mb-1 block ${darkMode ? 'text-[#808080]' : 'text-[#64748B]'}`}>{t('goal')}</label>
                <Select value={editData.goal} onValueChange={(v) => setEditData(prev => ({ ...prev, goal: v }))}>
                  <SelectTrigger className={darkMode ? 'bg-[#0A0A0A] border-[#333333] text-white' : 'bg-white border-[#E2E8F0] text-[#0F172A]'}>
                    <SelectValue placeholder={t('select')} />
                  </SelectTrigger>
                  <SelectContent className={darkMode ? 'bg-[#111111] border-[#333333]' : 'bg-white border-[#E2E8F0]'}>
                    {goalOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className={darkMode ? 'text-white' : 'text-[#0F172A]'}>{t(opt.labelKey)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className={`flex-1 ${darkMode ? 'border-[#333333] text-white hover:bg-[#1A1A1A]' : 'border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]'}`} onClick={() => setIsEditing(false)}>
                  {t('cancel')}
                </Button>
                <Button 
                  className="flex-1 bg-[#B7323F] hover:bg-[#9A2835] text-white" 
                  onClick={handleSaveProfile}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? t('saving') : t('save')}
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
                        <p className="text-white font-semibold">{t('upgradeToPro')}</p>
                        <p className="text-[#808080] text-xs">{t('allFeaturesFor')}</p>
                      </div>
                    </div>
                    <Button className="bg-[#B7323F] hover:bg-[#9A2835] text-white text-sm">Upgrade</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* About You Card */}
            <Card className={darkMode ? 'bg-[#111111] border-[#1A1A1A]' : 'bg-white border-[#E2E8F0]'}>
              <CardContent className="p-6">
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{t('aboutYou')}</h3>
                <div className="space-y-3">
                  <div className={`flex justify-between py-2 border-b ${darkMode ? 'border-[#1A1A1A]' : 'border-[#E2E8F0]'}`}>
                    <span className={darkMode ? 'text-[#666666]' : 'text-[#64748B]'}>{t('gender')}</span>
                    <span className={darkMode ? 'text-white' : 'text-[#0F172A]'}>{user?.gender ? t(user.gender) : '-'}</span>
                  </div>
                  <div className={`flex justify-between py-2 border-b ${darkMode ? 'border-[#1A1A1A]' : 'border-[#E2E8F0]'}`}>
                    <span className={darkMode ? 'text-[#666666]' : 'text-[#64748B]'}>Altersgruppe</span>
                    <span className={darkMode ? 'text-white' : 'text-[#0F172A]'}>{user?.age_range ? user.age_range.replace('-', ' - ') : '-'}</span>
                  </div>
                  <div className={`flex justify-between py-2 border-b ${darkMode ? 'border-[#1A1A1A]' : 'border-[#E2E8F0]'}`}>
                    <span className={darkMode ? 'text-[#666666]' : 'text-[#64748B]'}>{t('activityLevel')}</span>
                    <span className={darkMode ? 'text-white' : 'text-[#0F172A]'}>{user?.activity_level ? t(activityOptions.find(o => o.value === user.activity_level)?.labelKey) || user.activity_level : '-'}</span>
                  </div>
                  <div className={`flex justify-between py-2 border-b ${darkMode ? 'border-[#1A1A1A]' : 'border-[#E2E8F0]'}`}>
                    <span className={darkMode ? 'text-[#666666]' : 'text-[#64748B]'}>Ernährung</span>
                    <span className={darkMode ? 'text-white' : 'text-[#0F172A]'}>{user?.diet ? (t(dietOptions.find(o => o.value === user.diet)?.labelKey) || user.diet) : '-'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className={darkMode ? 'text-[#666666]' : 'text-[#64748B]'}>{t('goal')}</span>
                    <span className={darkMode ? 'text-white' : 'text-[#0F172A]'}>{user?.goal ? (t(goalOptions.find(o => o.value === user.goal)?.labelKey) || user.goal) : '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Tests */}
            {testDates.length > 0 && (
              <Card className={darkMode ? 'bg-[#111111] border-[#1A1A1A]' : 'bg-white border-[#E2E8F0]'}>
                <CardContent className="p-6">
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{t('lastBloodTests')}</h3>
                  <div className="space-y-3">
                    {testDates.slice(0, 3).map((date, idx) => {
                      const markersOnDate = bloodMarkers.filter(m => m.test_date === date);
                      const optOnDate = markersOnDate.filter(m => m.status === 'optimal').length;
                      return (
                        <div key={idx} className={`flex items-center justify-between py-2 border-b last:border-0 ${darkMode ? 'border-[#1A1A1A]' : 'border-[#E2E8F0]'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#3B7C9E20] flex items-center justify-center">
                              <Droplet className="w-4 h-4 text-[#3B7C9E]" />
                            </div>
                            <div>
                              <p className={`text-sm ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{format(new Date(date), 'dd. MMM yyyy', { locale: dateLocale })}</p>
                              <p className={`text-xs ${darkMode ? 'text-[#666666]' : 'text-[#64748B]'}`}>{markersOnDate.length} Marker</p>
                            </div>
                          </div>
                          <span className="text-green-400 text-sm">{optOnDate} Optimal</span>
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
            <Card className={darkMode ? 'bg-[#111111] border-[#1A1A1A]' : 'bg-white border-[#E2E8F0]'}>
              <CardContent className="p-6">
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{t('subscription')}</h3>
                <p className={`text-sm mb-4 ${darkMode ? 'text-[#808080]' : 'text-[#64748B]'}`}>{t('manageSubscriptionDesc')}</p>
                <Link to={createPageUrl("Subscription")}>
                  <Button className="w-full bg-[#B7323F] text-white hover:bg-[#9A2835]">
                    {t('manageSubscription')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className={darkMode ? 'bg-[#111111] border-[#1A1A1A]' : 'bg-white border-[#E2E8F0]'}>
              <CardContent className="p-6 space-y-4">
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{t('preferences')}</h3>
                
                {/* Language */}
                <div className={`flex items-center justify-between py-3 border-b ${darkMode ? 'border-[#1A1A1A]' : 'border-[#E2E8F0]'}`}>
                  <div className="flex items-center gap-3">
                    <svg className={`w-5 h-5 ${darkMode ? 'text-[#808080]' : 'text-[#64748B]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{t('language')}</p>
                      <p className={`text-xs ${darkMode ? 'text-[#666666]' : 'text-[#64748B]'}`}>
                        {language === 'en' ? 'English' : language === 'de' ? 'Deutsch' : 'Español'}
                      </p>
                    </div>
                  </div>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className={`w-32 ${darkMode ? 'bg-[#0A0A0A] border-[#333333] text-white' : 'bg-white border-[#E2E8F0] text-[#0F172A]'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={darkMode ? 'bg-[#111111] border-[#333333]' : 'bg-white border-[#E2E8F0]'}>
                      <SelectItem value="de" className={darkMode ? 'text-white' : 'text-[#0F172A]'}>Deutsch</SelectItem>
                      <SelectItem value="en" className={darkMode ? 'text-white' : 'text-[#0F172A]'}>English</SelectItem>
                      <SelectItem value="es" className={darkMode ? 'text-white' : 'text-[#0F172A]'}>Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dark Mode */}
                <div className={`flex items-center justify-between py-3 border-b ${darkMode ? 'border-[#1A1A1A]' : 'border-[#E2E8F0]'}`}>
                  <div className="flex items-center gap-3">
                    <Moon className={`w-5 h-5 ${darkMode ? 'text-[#808080]' : 'text-[#64748B]'}`} />
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{t('darkMode')}</p>
                      <p className={`text-xs ${darkMode ? 'text-[#666666]' : 'text-[#64748B]'}`}>{darkMode ? t('enabled') : t('disabled')}</p>
                    </div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={toggleDarkMode} className="data-[state=checked]:bg-[#3B7C9E]" />
                </div>

                {/* Notifications */}
                <Link to={createPageUrl("Notifications")} className={`flex items-center justify-between py-3 border-b -mx-2 px-2 rounded-lg transition-colors ${darkMode ? 'border-[#1A1A1A] hover:bg-[#1A1A1A]' : 'border-[#E2E8F0] hover:bg-[#F1F5F9]'}`}>
                  <div className="flex items-center gap-3">
                    <Bell className={`w-5 h-5 ${darkMode ? 'text-[#808080]' : 'text-[#64748B]'}`} />
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{t('notifications')}</p>
                      <p className={`text-xs ${darkMode ? 'text-[#666666]' : 'text-[#64748B]'}`}>{t('getHealthReminders')}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-[#666666]' : 'text-[#94A3B8]'}`} />
                </Link>

                {/* Privacy */}
                <a href="https://celluiq.com/privacy" target="_blank" rel="noopener noreferrer" className={`flex items-center justify-between py-3 -mx-2 px-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-[#1A1A1A]' : 'hover:bg-[#F1F5F9]'}`}>
                  <div className="flex items-center gap-3">
                    <Lock className={`w-5 h-5 ${darkMode ? 'text-[#808080]' : 'text-[#64748B]'}`} />
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{t('privacySecurity')}</p>
                      <p className={`text-xs ${darkMode ? 'text-[#666666]' : 'text-[#64748B]'}`}>{t('manageYourData')}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-[#666666]' : 'text-[#94A3B8]'}`} />
                </a>
              </CardContent>
            </Card>

            {/* Connected Devices - Pro Feature */}
            <Card className={`${darkMode ? 'bg-[#111111] border-[#1A1A1A]' : 'bg-white border-[#E2E8F0]'} ${!isPro ? 'relative overflow-hidden' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-[#3B7C9E]" />
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{t('connectedDevices')}</h3>
                  </div>
                  {!isPro && <span className="text-xs bg-[#B7323F20] text-[#B7323F] px-2 py-1 rounded-full font-medium">PRO</span>}
                </div>
                <p className={`text-sm mb-4 ${darkMode ? 'text-[#666666]' : 'text-[#64748B]'}`}>{t('syncFitnessData')}</p>
                
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
                      <p className="text-white font-medium text-sm">{t('unlockWithPro')}</p>
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