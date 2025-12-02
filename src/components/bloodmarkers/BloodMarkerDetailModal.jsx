import React from "react";
import { X, Pill, Apple, Activity, AlertTriangle, BookOpen, Calendar } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function BloodMarkerDetailModal({ marker, reference, onClose }) {
  if (!marker) return null;

  const isLow = marker.status === 'low' || marker.value < (marker.optimal_min || 0);
  const isHigh = marker.status === 'high' || marker.status === 'critical';

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
      case 'optimal': return 'Optimal';
      case 'suboptimal': return 'Suboptimal';
      case 'high': return 'Erhöht';
      case 'low': return 'Niedrig';
      case 'critical': return 'Kritisch';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#111111] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto border border-[#1A1A1A]">
        {/* Header */}
        <div className="sticky top-0 bg-[#111111] p-6 border-b border-[#1A1A1A]">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-[#666666] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl ${getStatusColor(marker.status)} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">{marker.value}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{marker.marker_name}</h2>
              <p className="text-[#808080] text-sm">{marker.unit} • {marker.category?.replace('_', ' ')}</p>
              {marker.test_date && (
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-[#666666]" />
                  <span className="text-[#666666] text-xs">
                    Stand: {format(new Date(marker.test_date), 'dd. MMM yyyy', { locale: de })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Range */}
          <div className="bg-[#0A0A0A] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#808080] text-sm">Dein Status</span>
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
                <p className="text-[#666666] text-xs mb-1">CELLUIQ Optimal</p>
                <p className="text-white font-semibold">
                  {marker.optimal_min || reference?.celluiq_range_min || '—'} - {marker.optimal_max || reference?.celluiq_range_max || '—'}
                </p>
              </div>
              <div>
                <p className="text-[#666666] text-xs mb-1">Klinischer Bereich</p>
                <p className="text-[#808080]">
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
                <h3 className="text-white font-semibold">Mögliche Symptome</h3>
              </div>
              <p className="text-[#808080] text-sm bg-[#0A0A0A] rounded-xl p-4">
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
                <h3 className="text-white font-semibold">Supplement Empfehlung</h3>
              </div>
              <div className="bg-[#0A0A0A] rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white font-medium">
                    {isLow ? reference.supplement_low : reference.supplement_high}
                  </span>
                  <span className="text-[#3B7C9E]">
                    {isLow ? reference.dosage_low : reference.dosage_high}
                  </span>
                </div>
                {(isLow ? reference.form_low : reference.form_high) && 
                 (isLow ? reference.form_low : reference.form_high) !== 'N/A' && (
                  <p className="text-[#666666] text-sm">
                    Form: {isLow ? reference.form_low : reference.form_high}
                  </p>
                )}
                {(isLow ? reference.mechanism_low : reference.mechanism_high) && 
                 (isLow ? reference.mechanism_low : reference.mechanism_high) !== 'N/A' && (
                  <p className="text-[#808080] text-sm">
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
                <h3 className="text-white font-semibold">Ernährungsempfehlung</h3>
              </div>
              <p className="text-[#808080] text-sm bg-[#0A0A0A] rounded-xl p-4">
                {isLow ? reference.food_low : reference.food_high}
              </p>
            </div>
          )}

          {/* Lifestyle */}
          {reference && (isLow ? reference.lifestyle_low : reference.lifestyle_high) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="text-white font-semibold">Lifestyle Änderungen</h3>
              </div>
              <p className="text-[#808080] text-sm bg-[#0A0A0A] rounded-xl p-4">
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
                <h3 className="text-red-400 font-semibold text-sm">Warnhinweise</h3>
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
                <BookOpen className="w-4 h-4 text-[#808080]" />
                <h3 className="text-white font-semibold">Studien & Quellen</h3>
              </div>
              <p className="text-[#666666] text-sm">{reference.studies}</p>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[#666666] text-xs text-center px-4 py-2 border-t border-[#1A1A1A] mt-4">
            Diese Informationen ersetzen keine ärztliche Beratung. Besprich Änderungen immer mit deinem Arzt.
          </p>
        </div>
      </div>
    </div>
  );
}