import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "../components/LanguageProvider";
import { 
  ChevronLeft,
  Bell,
  Droplet,
  Pill,
  Calendar,
  TrendingUp,
  ShoppingCart,
  Moon
} from "lucide-react";

export default function Notifications() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [settings, setSettings] = useState({
    blood_test_reminder: user?.notifications?.blood_test_reminder ?? true,
    supplement_reminder: user?.notifications?.supplement_reminder ?? true,
    weekly_report: user?.notifications?.weekly_report ?? true,
    new_recommendations: user?.notifications?.new_recommendations ?? true,
    shopping_reminder: user?.notifications?.shopping_reminder ?? false,
    evening_routine: user?.notifications?.evening_routine ?? false,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe({ notifications: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });

  const handleToggle = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateMutation.mutate(newSettings);
  };

  const notificationOptions = [
    {
      key: 'blood_test_reminder',
      icon: Droplet,
      title: t('bloodTestReminder') || 'Bluttest-Erinnerung',
      description: t('bloodTestReminderDesc') || 'Erinnerung alle 3 Monate für neuen Test',
      color: '#B7323F'
    },
    {
      key: 'supplement_reminder',
      icon: Pill,
      title: t('supplementReminder') || 'Supplement-Erinnerung',
      description: t('supplementReminderDesc') || 'Tägliche Einnahme-Erinnerung',
      color: '#F59E0B'
    },
    {
      key: 'weekly_report',
      icon: TrendingUp,
      title: t('weeklyReport') || 'Wöchentlicher Bericht',
      description: t('weeklyReportDesc') || 'Zusammenfassung deiner Fortschritte',
      color: '#3B7C9E'
    },
    {
      key: 'new_recommendations',
      icon: Calendar,
      title: t('newRecommendations') || 'Neue Empfehlungen',
      description: t('newRecommendationsDesc') || 'Benachrichtigung bei neuen Tipps',
      color: '#10B981'
    },
    {
      key: 'shopping_reminder',
      icon: ShoppingCart,
      title: t('shoppingReminder') || 'Einkaufs-Erinnerung',
      description: t('shoppingReminderDesc') || 'Wöchentliche Einkaufsliste',
      color: '#8B5CF6'
    },
    {
      key: 'evening_routine',
      icon: Moon,
      title: t('eveningRoutine') || 'Abend-Routine',
      description: t('eveningRoutineDesc') || 'Erinnerung für Abend-Supplements',
      color: '#6366F1'
    }
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to={createPageUrl("Settings")}>
          <Button variant="ghost" className="text-[#808080] hover:text-white">
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('backToSettings') || 'Zurück'}
          </Button>
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('notifications')}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('manageNotifications')}
          </p>
        </div>

        <Card className="bg-[#111111] border-[#1A1A1A]">
          <CardContent className="p-6 space-y-1">
            {notificationOptions.map((option, idx) => {
              const Icon = option.icon;
              return (
                <div 
                  key={option.key}
                  className={`flex items-center justify-between py-4 ${idx < notificationOptions.length - 1 ? 'border-b border-[#1A1A1A]' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${option.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: option.color }} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{option.title}</p>
                      <p className="text-[#666666] text-xs">{option.description}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings[option.key]} 
                    onCheckedChange={(v) => handleToggle(option.key, v)}
                    className="data-[state=checked]:bg-[#3B7C9E]"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#1A1A1A]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-[#808080]" />
              <h3 className="text-white font-semibold">{t('quietHours') || 'Ruhezeiten'}</h3>
            </div>
            <p className="text-[#666666] text-sm mb-4">
              {t('quietHoursDesc') || 'Keine Benachrichtigungen während dieser Zeit'}
            </p>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[#808080] text-xs mb-1 block">{t('from') || 'Von'}</label>
                <input 
                  type="time" 
                  defaultValue="22:00"
                  className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-[#808080] text-xs mb-1 block">{t('to') || 'Bis'}</label>
                <input 
                  type="time" 
                  defaultValue="07:00"
                  className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}