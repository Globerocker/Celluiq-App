import React from 'react';
import { X, Clock, Utensils, Sparkles, AlertTriangle, ExternalLink, Flame } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

export default function FoodDetailModal({ food, onClose }) {
  const { t } = useLanguage();

  if (!food) return null;

  const bestTimeKeys = {
    morning: 'morning',
    afternoon: 'afternoon', 
    evening: 'evening',
    anytime: 'anytime',
    with_meal: 'withMeal',
    before_workout: 'beforeWorkout',
    after_workout: 'afterWorkout'
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#111111] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-[#333333]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#111111] border-b border-[#1A1A1A] p-4 flex items-start justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] flex items-center justify-center text-2xl">
              {food.category === 'protein' ? '🥩' :
               food.category === 'vegetables' ? '🥬' :
               food.category === 'fruits' ? '🍎' :
               food.category === 'seafood' ? '🐟' :
               food.category === 'nuts_seeds' ? '🥜' :
               food.category === 'fats' ? '🥑' : '🍽️'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{food.food_name}</h2>
              <p className="text-[#808080] text-sm capitalize">{food.category?.replace('_', ' ')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#808080]" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Primary Benefits */}
          {food.primary_benefits && (
            <div className="bg-[#0A0A0A] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="text-white font-semibold">{t('healthBenefits')}</h3>
              </div>
              <p className="text-[#808080]">{food.primary_benefits}</p>
            </div>
          )}

          {/* Influenced Markers */}
          {food.influenced_markers && (
            <div className="bg-[#3B7C9E10] border border-[#3B7C9E30] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="text-white font-semibold">{t('influencedBiomarkers')}</h3>
              </div>
              <p className="text-[#3B7C9E]">{food.influenced_markers}</p>
            </div>
          )}

          {/* Dosage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0A0A0A] rounded-xl p-4">
              <p className="text-[#666666] text-xs mb-1">{t('dailyAmount')}</p>
              <p className="text-white font-semibold">{food.daily_dosage || '-'}</p>
            </div>
            <div className="bg-[#0A0A0A] rounded-xl p-4">
              <p className="text-[#666666] text-xs mb-1">{t('weeklyAmount')}</p>
              <p className="text-white font-semibold">{food.weekly_dosage || '-'}</p>
            </div>
          </div>

          {/* Best Time */}
          {food.best_time && (
            <div className="bg-[#0A0A0A] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="text-white font-semibold">{t('bestIntakeTime')}</h3>
              </div>
              <p className="text-[#808080]">{t(bestTimeKeys[food.best_time]) || food.best_time}</p>
            </div>
          )}

          {/* Combinations */}
          {food.combinations && (
            <div className="bg-[#0A0A0A] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="text-white font-semibold">{t('optimalCombinations')}</h3>
              </div>
              <p className="text-[#808080] text-sm">{food.combinations}</p>
            </div>
          )}

          {/* Warnings */}
          {food.warnings && food.warnings !== 'None' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <h3 className="text-yellow-500 font-semibold">{t('notes')}</h3>
              </div>
              <p className="text-yellow-500/80 text-sm">{food.warnings}</p>
            </div>
          )}

          {/* Studies */}
          {food.studies && (
            <div className="bg-[#0A0A0A] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="text-white font-semibold">{t('studiesAndSources')}</h3>
              </div>
              <p className="text-[#666666] text-sm break-words">{food.studies}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}