import React from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from './LanguageProvider';

export default function ProUpgradeModal({ isOpen, onClose, feature }) {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  const featureKeys = [
    'proFeature1',
    'proFeature2',
    'proFeature3',
    'proFeature4',
    'proFeature5'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#111111] rounded-3xl p-6 max-w-sm w-full border border-[#1A1A1A] shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#666666] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('upgradeToProTitle')}</h2>
          <p className="text-[#808080] text-sm">
            {t('unlockFeatures')}
          </p>
        </div>

        <div className="bg-[#0A0A0A] rounded-2xl p-4 mb-6">
          <div className="flex items-baseline justify-center gap-1 mb-4">
            <span className="text-4xl font-bold text-white">€9</span>
            <span className="text-[#666666]">/month</span>
          </div>
          
          <div className="space-y-3">
            {featureKeys.map((key, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#3B7C9E20] flex items-center justify-center">
                  <Check className="w-3 h-3 text-[#3B7C9E]" />
                </div>
                <span className="text-sm text-[#808080]">{t(key)}</span>
              </div>
            ))}
          </div>
        </div>

        <Button 
          className="w-full bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 rounded-xl font-semibold"
          onClick={() => {
            alert('Payment integration coming soon!');
          }}
        >
          {t('startProTrial')}
        </Button>
        
        <p className="text-center text-xs text-[#666666] mt-4">
          {t('cancelAnytime')}
        </p>
      </div>
    </div>
  );
}