import React from 'react';
import { X, Pill, ExternalLink, Beaker, Target, AlertTriangle, Clock } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

export default function SupplementDetailModal({ supplement, reference, onClose }) {
  const { t } = useLanguage();

  if (!supplement) return null;

  // Get info from reference if available
  const mechanism = reference?.mechanism_low || reference?.mechanism_high;
  const form = supplement.form || reference?.form_low || reference?.form_high;
  const warnings = reference?.warnings_low || reference?.warnings_high;
  const studies = reference?.studies;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#111111] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-[#333333]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#111111] border-b border-[#1A1A1A] p-4 flex items-start justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B7C9E] to-[#2D5F7A] flex items-center justify-center">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{supplement.name}</h2>
              <p className="text-[#3B7C9E] text-sm">Für {supplement.forMarker}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#808080]" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Dosage */}
          <div className="bg-[#0A0A0A] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-[#3B7C9E]" />
              <h3 className="text-white font-semibold">Empfohlene Dosierung</h3>
            </div>
            <p className="text-[#808080]">{supplement.dosage || 'Individuell bestimmen'}</p>
            {form && (
              <p className="text-[#666666] text-sm mt-2">
                <span className="text-[#808080]">Empfohlene Form:</span> {form}
              </p>
            )}
          </div>

          {/* Mechanism */}
          {mechanism && (
            <div className="bg-[#0A0A0A] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Beaker className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="text-white font-semibold">Wirkungsweise</h3>
              </div>
              <p className="text-[#808080] text-sm">{mechanism}</p>
            </div>
          )}

          {/* Best Time */}
          <div className="bg-[#0A0A0A] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#3B7C9E]" />
              <h3 className="text-white font-semibold">Einnahmezeitpunkt</h3>
            </div>
            <p className="text-[#808080] text-sm">
              {supplement.name?.toLowerCase().includes('magnesium') ? 'Abends vor dem Schlafengehen' :
               supplement.name?.toLowerCase().includes('vitamin d') ? 'Morgens mit fetthaltiger Mahlzeit' :
               supplement.name?.toLowerCase().includes('iron') || supplement.name?.toLowerCase().includes('eisen') ? 'Nüchtern oder mit Vitamin C' :
               supplement.name?.toLowerCase().includes('omega') ? 'Mit fetthaltiger Mahlzeit' :
               'Mit einer Mahlzeit einnehmen'}
            </p>
          </div>

          {/* Warnings */}
          {warnings && warnings !== 'None' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <h3 className="text-yellow-500 font-semibold">Hinweise</h3>
              </div>
              <p className="text-yellow-500/80 text-sm">{warnings}</p>
            </div>
          )}

          {/* Why this supplement */}
          <div className="bg-[#3B7C9E10] border border-[#3B7C9E30] rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">Warum dieses Supplement?</h3>
            <p className="text-[#808080] text-sm">
              Basierend auf deinem {supplement.status === 'low' || supplement.status === 'critical' ? 'niedrigen' : 'erhöhten'} {supplement.forMarker}-Wert 
              kann {supplement.name} helfen, deine Werte zu optimieren.
            </p>
          </div>

          {/* Studies */}
          {studies && (
            <div className="bg-[#0A0A0A] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-[#3B7C9E]" />
                <h3 className="text-white font-semibold">Studien & Quellen</h3>
              </div>
              <p className="text-[#666666] text-sm break-words">{studies}</p>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[#666666] text-xs text-center px-4 py-2">
            Diese Empfehlung ersetzt keine ärztliche Beratung. Besprich Supplementierung immer mit deinem Arzt.
          </p>
        </div>
      </div>
    </div>
  );
}