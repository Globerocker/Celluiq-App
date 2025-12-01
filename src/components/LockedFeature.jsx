import React from 'react';
import { Lock } from 'lucide-react';

export default function LockedFeature({ title, description, onUnlock }) {
  return (
    <div 
      onClick={onUnlock}
      className="relative rounded-2xl p-6 bg-[#111111] border border-[#1A1A1A] cursor-pointer hover:border-[#B7323F] transition-all group"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent rounded-2xl" />
      
      <div className="relative flex flex-col items-center justify-center text-center py-8">
        <div className="w-12 h-12 rounded-full bg-[#B7323F20] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Lock className="w-6 h-6 text-[#B7323F]" />
        </div>
        <h3 className="text-white font-semibold mb-2">{title}</h3>
        <p className="text-[#666666] text-sm mb-4">{description}</p>
        <span className="text-xs text-[#B7323F] font-medium uppercase tracking-wider">
          Pro Feature • $9/mo
        </span>
      </div>
    </div>
  );
}