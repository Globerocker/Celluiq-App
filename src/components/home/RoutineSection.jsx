import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "../LanguageProvider";
import { 
  Sun, Moon, Dumbbell, Droplets, Wind, Brain, Heart, 
  Flame, Timer, CheckCircle2, Circle, ChevronRight, 
  Sparkles, Target, Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RoutineSection() {
  const { t } = useLanguage();
  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem('routine_checked_today');
    if (saved) {
      const { date, items } = JSON.parse(saved);
      if (date === new Date().toISOString().split('T')[0]) {
        return items;
      }
    }
    return [];
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bloodMarkers = [] } = useQuery({
    queryKey: ['bloodMarkers'],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
  });

  const { data: markerReferences = [] } = useQuery({
    queryKey: ['markerReferences'],
    queryFn: () => base44.entities.BloodMarkerReference.list(),
  });

  // Get suboptimal markers
  const latestMarkers = bloodMarkers.reduce((acc, marker) => {
    if (!acc[marker.marker_name] || new Date(marker.test_date) > new Date(acc[marker.marker_name].test_date)) {
      acc[marker.marker_name] = marker;
    }
    return acc;
  }, {});

  const suboptimalMarkers = Object.values(latestMarkers).filter(m => 
    ['suboptimal', 'low', 'high', 'critical'].includes(m.status)
  );

  // Generate personalized routine based on user data and markers
  const routine = useMemo(() => {
    const morningRoutine = [];
    const eveningRoutine = [];
    const exerciseRoutine = [];
    
    // Base routines everyone should do
    morningRoutine.push({
      id: 'cold_shower',
      icon: Droplets,
      title: t('coldShower'),
      description: t('coldShowerDesc'),
      duration: '2-3 min',
      benefits: ['Cortisol', 'Immunsystem', 'Energie'],
      color: 'blue'
    });

    morningRoutine.push({
      id: 'sunlight',
      icon: Sun,
      title: t('morningSunlight'),
      description: t('morningSunlightDesc'),
      duration: '10-15 min',
      benefits: ['Vitamin D', 'Melatonin', 'Circadian'],
      color: 'yellow'
    });

    morningRoutine.push({
      id: 'breathing',
      icon: Wind,
      title: t('breathingExercise'),
      description: t('breathingExerciseDesc'),
      duration: '5 min',
      benefits: ['Cortisol', 'HRV', 'Fokus'],
      color: 'cyan'
    });

    eveningRoutine.push({
      id: 'no_screens',
      icon: Moon,
      title: t('noScreens'),
      description: t('noScreensDesc'),
      duration: '1h vor Schlaf',
      benefits: ['Melatonin', 'Schlafqualität'],
      color: 'purple'
    });

    eveningRoutine.push({
      id: 'meditation',
      icon: Brain,
      title: t('meditation'),
      description: t('meditationDesc'),
      duration: '10 min',
      benefits: ['Cortisol', 'Stressabbau'],
      color: 'indigo'
    });

    // Activity level based exercise
    const activityLevel = user?.activity_level || 'moderate';
    
    if (activityLevel === 'sedentary' || activityLevel === 'light') {
      exerciseRoutine.push({
        id: 'walking',
        icon: Heart,
        title: t('dailyWalk'),
        description: t('dailyWalkDesc'),
        duration: '30 min',
        benefits: ['Cardio', 'Insulin', 'Stimmung'],
        color: 'green'
      });
    }

    if (activityLevel === 'moderate' || activityLevel === 'active' || activityLevel === 'athlete') {
      exerciseRoutine.push({
        id: 'strength',
        icon: Dumbbell,
        title: t('strengthTraining'),
        description: t('strengthTrainingDesc'),
        duration: '45 min',
        benefits: ['Testosteron', 'Insulin', 'Muskeln'],
        color: 'red'
      });
    }

    if (activityLevel === 'active' || activityLevel === 'athlete') {
      exerciseRoutine.push({
        id: 'hiit',
        icon: Flame,
        title: t('hiitTraining'),
        description: t('hiitTrainingDesc'),
        duration: '20 min',
        benefits: ['HGH', 'Metabolismus', 'VO2max'],
        color: 'orange'
      });
    }

    // Goal-based additions
    const goal = user?.goal;
    if (goal === 'sleep') {
      eveningRoutine.push({
        id: 'magnesium',
        icon: Timer,
        title: t('magnesiumRoutine'),
        description: t('magnesiumRoutineDesc'),
        duration: '30 min vor Schlaf',
        benefits: ['Schlafqualität', 'Entspannung'],
        color: 'violet'
      });
    }

    if (goal === 'energy' || goal === 'performance') {
      morningRoutine.push({
        id: 'fasting',
        icon: Zap,
        title: t('intermittentFasting'),
        description: t('intermittentFastingDesc'),
        duration: '16h Fasten',
        benefits: ['Energie', 'Autophagie', 'Insulin'],
        color: 'amber'
      });
    }

    // Add lifestyle recommendations from suboptimal markers
    suboptimalMarkers.forEach(marker => {
      const ref = markerReferences.find(r => 
        r.marker_name?.toLowerCase() === marker.marker_name?.toLowerCase()
      );
      
      if (ref?.lifestyle_low && marker.status === 'low') {
        const existing = [...morningRoutine, ...eveningRoutine, ...exerciseRoutine];
        if (!existing.some(r => r.markerBased === ref.marker_name)) {
          const recommendation = {
            id: `marker_${ref.marker_name}`,
            icon: Target,
            title: `${ref.marker_name} ${t('optimize')}`,
            description: ref.lifestyle_low.substring(0, 100) + '...',
            duration: t('daily'),
            benefits: [ref.marker_name],
            color: 'teal',
            markerBased: ref.marker_name
          };
          morningRoutine.push(recommendation);
        }
      }
      
      if (ref?.lifestyle_high && marker.status === 'high') {
        const existing = [...morningRoutine, ...eveningRoutine, ...exerciseRoutine];
        if (!existing.some(r => r.markerBased === ref.marker_name)) {
          const recommendation = {
            id: `marker_${ref.marker_name}`,
            icon: Target,
            title: `${ref.marker_name} ${t('reduce')}`,
            description: ref.lifestyle_high.substring(0, 100) + '...',
            duration: t('daily'),
            benefits: [ref.marker_name],
            color: 'rose',
            markerBased: ref.marker_name
          };
          eveningRoutine.push(recommendation);
        }
      }
    });

    return { morningRoutine, eveningRoutine, exerciseRoutine };
  }, [user, suboptimalMarkers, markerReferences, t]);

  const toggleCheck = (id) => {
    const newChecked = checkedItems.includes(id) 
      ? checkedItems.filter(i => i !== id)
      : [...checkedItems, id];
    
    setCheckedItems(newChecked);
    localStorage.setItem('routine_checked_today', JSON.stringify({
      date: new Date().toISOString().split('T')[0],
      items: newChecked
    }));
  };

  const allItems = [...routine.morningRoutine, ...routine.eveningRoutine, ...routine.exerciseRoutine];
  const completedCount = checkedItems.length;
  const totalCount = allItems.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    violet: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    teal: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };

  const RoutineItem = ({ item }) => {
    const Icon = item.icon;
    const isChecked = checkedItems.includes(item.id);
    
    return (
      <button
        onClick={() => toggleCheck(item.id)}
        className={`w-full p-4 rounded-xl border transition-all text-left ${
          isChecked 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-[#111111] border-[#1A1A1A] hover:border-[#333333]'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClasses[item.color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isChecked ? 'text-green-400 line-through' : 'text-white'}`}>
                {item.title}
              </h4>
              {isChecked ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-[#333333] shrink-0" />
              )}
            </div>
            <p className="text-[#666666] text-sm mt-1 line-clamp-2">{item.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[#808080] text-xs flex items-center gap-1">
                <Timer className="w-3 h-3" /> {item.duration}
              </span>
              <div className="flex gap-1">
                {item.benefits.slice(0, 2).map((b, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A1A1A] text-[#808080]">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-br from-[#111111] to-[#1A1A1A] border-[#1A1A1A]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">{t('yourDailyRoutine')}</h2>
              <p className="text-[#808080] text-sm">{t('routineDescription')}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{progress}%</p>
              <p className="text-[#666666] text-xs">{completedCount}/{totalCount} {t('completed')}</p>
            </div>
          </div>
          <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#B7323F] to-[#3B7C9E] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Morning Routine */}
      {routine.morningRoutine.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">{t('morningRoutine')}</h3>
          </div>
          <div className="space-y-3">
            {routine.morningRoutine.map(item => (
              <RoutineItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Exercise Routine */}
      {routine.exerciseRoutine.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-white">{t('exerciseRoutine')}</h3>
          </div>
          <div className="space-y-3">
            {routine.exerciseRoutine.map(item => (
              <RoutineItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Evening Routine */}
      {routine.eveningRoutine.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-white">{t('eveningRoutine')}</h3>
          </div>
          <div className="space-y-3">
            {routine.eveningRoutine.map(item => (
              <RoutineItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Personalization Note */}
      <div className="bg-[#3B7C9E10] border border-[#3B7C9E30] rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#3B7C9E] shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium text-sm">{t('personalizedRoutine')}</p>
            <p className="text-[#808080] text-xs mt-1">
              {t('personalizedRoutineDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}