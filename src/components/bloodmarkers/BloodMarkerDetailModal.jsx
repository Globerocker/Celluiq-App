import React from "react";
import { X, Pill, Apple, Activity, AlertTriangle, BookOpen, Calendar } from "lucide-react";
import { format } from "date-fns";
import { de, enUS, es } from "date-fns/locale";
import { useLanguage } from "../LanguageProvider";

export default function BloodMarkerDetailModal({ marker, reference, onClose }) {
  const { t, language } = useLanguage();
  
  if (!marker) return null;

  const isLow = marker.status === 'low' || marker.value < (marker.optimal_min || 0);
  const isHigh = marker.status === 'high' || marker.status === 'critical';
  const dateLocale = language === 'de' ? de : language === 'es' ? es : enUS;

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return 'bg-green-500';
      case 'suboptimal': return 'bg-yellow-500';
      case 'high': case 'critical': return 'bg-red-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-[#808080]';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'optimal': return t('optimal');
      case 'suboptimal': return t('suboptimal');
      case 'high': return language === 'de' ? 'Erhöht' : 'High';
      case 'low': return language === 'de' ? 'Niedrig' : 'Low';
      case 'critical': return language === 'de' ? 'Kritisch' : 'Critical';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        {/* Header */}
        <div className="sticky top-0 p-6 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl ${getStatusColor(marker.status)} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">{marker.value}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{marker.marker_name}</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{marker.unit} • {marker.category?.replace('_', ' ')}</p>
              {marker.test_date && (
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {t('asOf')}: {format(new Date(marker.test_date), 'dd. MMM yyyy', { locale: dateLocale })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Range */}
          <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('yourStatus')}</span>
              <span className={`text-sm px-3 py-1 rounded-full ${
                marker.status === 'optimal' ? 'bg-green-500/20 text-green-400' :
                marker.status === 'suboptimal' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {getStatusLabel(marker.status)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>{t('celluiqOptimal')}</p>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {marker.optimal_min || reference?.celluiq_range_min || '—'} - {marker.optimal_max || reference?.celluiq_range_max || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>{t('clinicalRange')}</p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {reference?.clinical_range_min || '—'} - {reference?.clinical_range_max || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Symptoms */}
          {reference && (isLow ? reference.symptoms_if_low : reference.symptoms_if_high) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('possibleSymptoms')}</h3>
              </div>
              <p className="text-sm rounded-xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                {isLow ? reference.symptoms_if_low : reference.symptoms_if_high}
              </p>
            </div>
          )}

          {/* Supplement Recommendation */}
          {reference && (isLow ? reference.supplement_low : reference.supplement_high) && 
           (isLow ? reference.supplement_low : reference.supplement_high) !== 'N/A' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Pill className="w-4 h-4 text-[#B7323F]" />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('supplementRecommendation')}</h3>
              </div>
              <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="flex justify-between">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {isLow ? reference.supplement_low : reference.supplement_high}
                  </span>
                  <span className="text-[#3B7C9E]">
                    {isLow ? reference.dosage_low : reference.dosage_high}
                  </span>
                </div>
                {(isLow ? reference.form_low : reference.form_high) && 
                 (isLow ? reference.form_low : reference.form_high) !== 'N/A' && (
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    Form: {isLow ? reference.form_low : reference.form_high}
                  </p>
                )}
                {(isLow ? reference.mechanism_low : reference.mechanism_high) && 
                 (isLow ? reference.mechanism_low : reference.mechanism_high) !== 'N/A' && (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {isLow ? reference.mechanism_low : reference.mechanism_high}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Food Recommendation */}
          {reference && (isLow ? reference.food_low : reference.food_high) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Apple className="w-4 h-4 text-green-500" />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('nutritionRecommendation')}</h3>
              </div>
              <p className="text-sm rounded-xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                {isLow ? reference.food_low : reference.food_high}
              </p>
            </div>
          )}

          {/* Lifestyle */}
          {reference && (isLow ? reference.lifestyle_low : reference.lifestyle_high) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('lifestyleChanges')}</h3>
              </div>
              <p className="text-sm rounded-xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                {isLow ? reference.lifestyle_low : reference.lifestyle_high}
              </p>
            </div>
          )}

          {/* Warnings */}
          {reference && (isLow ? reference.warnings_low : reference.warnings_high) && 
           (isLow ? reference.warnings_low : reference.warnings_high) !== 'N/A' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h3 className="text-red-400 font-semibold text-sm">{t('warnings')}</h3>
              </div>
              <p className="text-red-300/80 text-sm">
                {isLow ? reference.warnings_low : reference.warnings_high}
              </p>
            </div>
          )}

          {/* Studies */}
          {reference?.studies && reference.studies !== 'N/A' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('studiesAndSources')}</h3>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{reference.studies}</p>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-center px-4 py-2 border-t mt-4" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-color)' }}>
            {t('medicalDisclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}