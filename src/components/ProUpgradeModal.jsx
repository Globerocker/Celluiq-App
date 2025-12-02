import React from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from './LanguageProvider';

export default function ProUpgradeModal({ isOpen, onClose, feature }) {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  const features = [
    t('proFeature1'),
    t('proFeature2'),
    t('proFeature3'),
    t('proFeature4'),
    t('proFeature5')
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative rounded-3xl p-6 max-w-sm w-full border shadow-2xl" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('upgradeToPro')}</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('unlockAllFeatures')}
          </p>
        </div>

        <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <div className="flex items-baseline justify-center gap-1 mb-4">
            <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>9€</span>
            <span style={{ color: 'var(--text-tertiary)' }}>{t('perMonth')}</span>
          </div>
          
          <div className="space-y-3">
            {features.map((feat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#3B7C9E20] flex items-center justify-center">
                  <Check className="w-3 h-3 text-[#3B7C9E]" />
                </div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feat}</span>
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
        
        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-tertiary)' }}>
          {t('cancelAnytime')}
        </p>
      </div>
    </div>
  );
}