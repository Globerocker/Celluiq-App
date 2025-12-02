import React from 'react';
import { X, Pill, ExternalLink, Beaker, Target, AlertTriangle, Clock } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

export default function SupplementDetailModal({ supplement, reference, onClose }) {
  const { t } = useLanguage();

  if (!supplement) return null;

  const mechanism = reference?.mechanism_low || reference?.mechanism_high;
  const form = supplement.form || reference?.form_low || reference?.form_high;
  const warnings = reference?.warnings_low || reference?.warnings_high;
  const studies = reference?.studies;

  const getIntakeTime = () => {
    const name = supplement.name?.toLowerCase() || '';
    if (name.includes('magnesium')) return t('eveningBeforeSleep');
    if (name.includes('vitamin d')) return t('morningWithFattyMeal');
    if (name.includes('iron') || name.includes('eisen')) return t('onEmptyOrWithVitC');
    if (name.includes('omega')) return t('withFattyMeal');
    return t('withAMeal');
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div 
        className="rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 border-b p-4 flex items-start justify-between z-10" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B7C9E] to-[#2D5F7A] flex items-center justify-center">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{supplement.name}</h2>
              <p className="text-[#3B7C9E] text-sm">{supplement.forMarker}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-[#3B7C9E]" />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('recommendedDosage')}</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>{supplement.dosage || t('determineIndividually')}</p>
            {form && (
              <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t('recommendedForm')}:</span> {form}
              </p>
            )}
          </div>

          {mechanism && (
            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Beaker className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('howItWorks')}</h3>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{mechanism}</p>
            </div>
          )}

          <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#3B7C9E]" />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('intakeTime')}</h3>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{getIntakeTime()}</p>
          </div>

          {warnings && warnings !== 'None' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <h3 className="text-yellow-500 font-semibold">{t('notes')}</h3>
              </div>
              <p className="text-yellow-500/80 text-sm">{warnings}</p>
            </div>
          )}

          <div className="bg-[#3B7C9E10] border border-[#3B7C9E30] rounded-xl p-4">
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{t('whyThisSupplement')}</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('basedOnYourLevel')} {supplement.status === 'low' || supplement.status === 'critical' ? t('low') : t('elevated')} {supplement.forMarker}-{t('levelValue')}
            </p>
          </div>

          {studies && (
            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('studiesAndSources')}</h3>
              </div>
              <p className="text-sm break-words" style={{ color: 'var(--text-tertiary)' }}>{studies}</p>
            </div>
          )}

          <p className="text-xs text-center px-4 py-2" style={{ color: 'var(--text-tertiary)' }}>
            {t('medicalDisclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}