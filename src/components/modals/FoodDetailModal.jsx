import React from 'react';
import { X, Clock, Utensils, Sparkles, AlertTriangle, ExternalLink, Flame } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

export default function FoodDetailModal({ food, onClose }) {
  const { t } = useLanguage();

  if (!food) return null;

  const bestTimeLabels = {
    morning: 'Morgens',
    afternoon: 'Nachmittags', 
    evening: 'Abends',
    anytime: 'Jederzeit',
    with_meal: 'Mit einer Mahlzeit',
    before_workout: 'Vor dem Training',
    after_workout: 'Nach dem Training'
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div 
        className="rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 border-b p-4 flex items-start justify-between z-10" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
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
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{food.food_name}</h2>
              <p className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{food.category?.replace('_', ' ')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Primary Benefits */}
          {food.primary_benefits && (
            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('healthBenefits')}</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>{food.primary_benefits}</p>
            </div>
          )}

          {/* Influenced Markers */}
          {food.influenced_markers && (
            <div className="bg-[#3B7C9E10] border border-[#3B7C9E30] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('influencedBiomarkers')}</h3>
              </div>
              <p className="text-[#3B7C9E]">{food.influenced_markers}</p>
            </div>
          )}

          {/* Dosage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>{t('dailyAmount')}</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{food.daily_dosage || '-'}</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>{t('weeklyAmount')}</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{food.weekly_dosage || '-'}</p>
            </div>
          </div>

          {/* Best Time */}
          {food.best_time && (
            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('bestTime')}</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>{bestTimeLabels[food.best_time] || food.best_time}</p>
            </div>
          )}

          {/* Combinations */}
          {food.combinations && (
            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('optimalCombinations')}</h3>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{food.combinations}</p>
            </div>
          )}

          {/* Warnings */}
          {food.warnings && food.warnings !== 'None' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <h3 className="text-yellow-500 font-semibold">{t('warnings')}</h3>
              </div>
              <p className="text-yellow-500/80 text-sm">{food.warnings}</p>
            </div>
          )}

          {/* Studies */}
          {food.studies && (
            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('studiesAndSources')}</h3>
              </div>
              <p className="text-sm break-words" style={{ color: 'var(--text-tertiary)' }}>{food.studies}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}