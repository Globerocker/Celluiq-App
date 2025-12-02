import React from 'react';
import { X, Pill, ExternalLink, Beaker, Target, AlertTriangle, Clock } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

export default function SupplementDetailModal({ supplement, reference, onClose }) {
  const { t } = useLanguage();
  const [theme] = React.useState(localStorage.getItem('theme') || 'dark');
  const isDark = theme === 'dark';

  if (!supplement) return null;

  const mechanism = reference?.mechanism_low || reference?.mechanism_high;
  const form = supplement.form || reference?.form_low || reference?.form_high;
  const warnings = reference?.warnings_low || reference?.warnings_high;
  const studies = reference?.studies;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div 
        className={`rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border ${isDark ? 'bg-[#111111] border-[#333333]' : 'bg-white border-[#E2E8F0]'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 border-b p-4 flex items-start justify-between z-10 ${isDark ? 'bg-[#111111] border-[#1A1A1A]' : 'bg-white border-[#E2E8F0]'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B7C9E] to-[#2D5F7A] flex items-center justify-center">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{supplement.name}</h2>
              <p className="text-[#3B7C9E] text-sm">Für {supplement.forMarker}</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#1A1A1A]' : 'hover:bg-[#F1F5F9]'}`}>
            <X className={`w-5 h-5 ${isDark ? 'text-[#808080]' : 'text-[#64748B]'}`} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Dosage */}
          <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F1F5F9]'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-[#3B7C9E]" />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{t('recommendedDosage')}</h3>
            </div>
            <p className={isDark ? 'text-[#808080]' : 'text-[#64748B]'}>{supplement.dosage || t('determineIndividually')}</p>
            {form && (
              <p className={`text-sm mt-2 ${isDark ? 'text-[#666666]' : 'text-[#64748B]'}`}>
                <span className={isDark ? 'text-[#808080]' : 'text-[#475569]'}>{t('recommendedForm')}:</span> {form}
              </p>
            )}
          </div>

          {/* Mechanism */}
          {mechanism && (
            <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F1F5F9]'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Beaker className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{t('howItWorks')}</h3>
              </div>
              <p className={`text-sm ${isDark ? 'text-[#808080]' : 'text-[#64748B]'}`}>{mechanism}</p>
            </div>
          )}

          {/* Best Time */}
          <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F1F5F9]'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#3B7C9E]" />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{t('intakeTime')}</h3>
            </div>
            <p className={`text-sm ${isDark ? 'text-[#808080]' : 'text-[#64748B]'}`}>
              {supplement.name?.toLowerCase().includes('magnesium') ? t('eveningBeforeSleep') :
               supplement.name?.toLowerCase().includes('vitamin d') ? t('morningWithFattyMeal') :
               supplement.name?.toLowerCase().includes('iron') || supplement.name?.toLowerCase().includes('eisen') ? t('onEmptyOrWithVitC') :
               supplement.name?.toLowerCase().includes('omega') ? t('withFattyMeal') :
               t('withAMeal')}
            </p>
          </div>

          {/* Warnings */}
          {warnings && warnings !== 'None' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <h3 className="text-yellow-500 font-semibold">{t('notes')}</h3>
              </div>
              <p className="text-yellow-500/80 text-sm">{warnings}</p>
            </div>
          )}

          {/* Why this supplement */}
          <div className="bg-[#3B7C9E10] border border-[#3B7C9E30] rounded-xl p-4">
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{t('whyThisSupplement')}</h3>
            <p className={`text-sm ${isDark ? 'text-[#808080]' : 'text-[#64748B]'}`}>
              {t('basedOnYourLevel')} {supplement.status === 'low' || supplement.status === 'critical' ? t('low') : t('elevated')} {supplement.forMarker} {t('canHelpOptimize')}
            </p>
          </div>

          {/* Studies */}
          {studies && (
            <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F1F5F9]'}`}>
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{t('studiesAndSources')}</h3>
              </div>
              <p className={`text-sm break-words ${isDark ? 'text-[#666666]' : 'text-[#64748B]'}`}>{studies}</p>
            </div>
          )}

          {/* Disclaimer */}
          <p className={`text-xs text-center px-4 py-2 ${isDark ? 'text-[#666666]' : 'text-[#94A3B8]'}`}>
            {t('medicalDisclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}