import React, { useMemo, useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ChevronRight, AlertCircle, Plus, Download, FileText, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from "../LanguageProvider";

// Priority markers - top 50 essential markers for health optimization
const PRIORITY_MARKERS = {
  both: [
    // Core vitamins
    'Vitamin D', 'Vitamin B12', 'Folate', 'Vitamin B6',
    // Minerals
    'Iron', 'Ferritin', 'Magnesium', 'Zinc', 'Selenium',
    // Thyroid
    'TSH', 'Free T3', 'Free T4',
    // Metabolic
    'Fasting Glucose', 'HbA1c', 'Fasting Insulin', 'HOMA-IR',
    // Lipids
    'Total Cholesterol', 'LDL Cholesterol', 'HDL Cholesterol', 'Triglycerides', 'ApoB',
    // Inflammation
    'hs-CRP', 'Homocysteine',
    // Liver
    'ALT', 'AST', 'GGT',
    // Kidney
    'Creatinine', 'eGFR', 'Uric Acid',
    // Blood cells
    'Hemoglobin', 'Hematocrit', 'RBC', 'WBC', 'Platelets',
    // Other
    'Cortisol', 'DHEA-S', 'Omega-3 Index'
  ],
  male: [
    'Total Testosterone', 'Free Testosterone', 'SHBG', 'Estradiol', 'PSA'
  ],
  female: [
    'Estradiol', 'Progesterone', 'FSH', 'LH', 'AMH', 'SHBG'
  ]
};

// Related markers logic - if marker A is suboptimal, suggest marker B
const RELATED_MARKERS = {
  'Vitamin D': ['Calcium', 'PTH', 'Magnesium'],
  'Iron': ['Ferritin', 'TIBC', 'Transferrin Saturation', 'Hemoglobin'],
  'Ferritin': ['Iron', 'TIBC', 'hs-CRP'],
  'TSH': ['Free T3', 'Free T4', 'Thyroid Antibodies'],
  'Free T3': ['TSH', 'Free T4', 'Reverse T3'],
  'Free T4': ['TSH', 'Free T3'],
  'Total Testosterone': ['Free Testosterone', 'SHBG', 'Estradiol', 'LH', 'FSH'],
  'Free Testosterone': ['Total Testosterone', 'SHBG', 'Estradiol'],
  'Fasting Glucose': ['HbA1c', 'Fasting Insulin', 'HOMA-IR'],
  'HbA1c': ['Fasting Glucose', 'Fasting Insulin'],
  'LDL Cholesterol': ['ApoB', 'Lp(a)', 'Total Cholesterol', 'HDL Cholesterol'],
  'Total Cholesterol': ['LDL Cholesterol', 'HDL Cholesterol', 'Triglycerides'],
  'hs-CRP': ['Homocysteine', 'Ferritin', 'ESR'],
  'Homocysteine': ['Vitamin B12', 'Folate', 'Vitamin B6'],
  'Vitamin B12': ['Folate', 'Homocysteine', 'MMA'],
  'ALT': ['AST', 'GGT', 'Bilirubin Total'],
  'Hemoglobin': ['Iron', 'Ferritin', 'Vitamin B12', 'Folate'],
  'Cortisol': ['DHEA-S', 'Fasting Glucose'],
};

export default function RecommendedMarkersSection({ onAddMarker }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bloodMarkers = [] } = useQuery({
    queryKey: ['bloodMarkers'],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
  });

  const { data: markerReferences = [] } = useQuery({
    queryKey: ['markerReferences'],
    queryFn: () => base44.entities.BloodMarkerReference.list(),
  });

  // Get user's current markers
  const currentMarkerNames = useMemo(() => {
    return [...new Set(bloodMarkers.map(m => m.marker_name.toLowerCase()))];
  }, [bloodMarkers]);

  // Get latest markers and find suboptimal ones
  const latestMarkers = useMemo(() => {
    return bloodMarkers.reduce((acc, marker) => {
      if (!acc[marker.marker_name] || new Date(marker.test_date) > new Date(acc[marker.marker_name].test_date)) {
        acc[marker.marker_name] = marker;
      }
      return acc;
    }, {});
  }, [bloodMarkers]);

  const suboptimalMarkers = useMemo(() => {
    return Object.values(latestMarkers).filter(m => 
      ['suboptimal', 'low', 'high', 'critical'].includes(m.status)
    );
  }, [latestMarkers]);

  // Find reference for a marker name
  const findReference = (markerName) => {
    return markerReferences.find(ref => 
      ref.marker_name?.toLowerCase() === markerName.toLowerCase() ||
      ref.short_name?.toLowerCase() === markerName.toLowerCase()
    );
  };

  // Calculate recommended markers
  const recommendedMarkers = useMemo(() => {
    const userGender = user?.gender || 'male';
    const recommendations = [];
    const addedNames = new Set();

    // 1. Add related markers based on suboptimal markers
    suboptimalMarkers.forEach(marker => {
      const related = RELATED_MARKERS[marker.marker_name] || [];
      related.forEach(relatedName => {
        if (!currentMarkerNames.includes(relatedName.toLowerCase()) && !addedNames.has(relatedName)) {
          const reference = findReference(relatedName);
          if (reference) {
            recommendations.push({
              ...reference,
              reason: `Empfohlen wegen suboptimalem ${marker.marker_name}`,
              priority: 'high'
            });
            addedNames.add(relatedName);
          }
        }
      });
    });

    // 2. Add missing priority markers
    const priorityList = [...PRIORITY_MARKERS.both, ...(PRIORITY_MARKERS[userGender] || [])];
    priorityList.forEach(markerName => {
      if (!currentMarkerNames.includes(markerName.toLowerCase()) && !addedNames.has(markerName)) {
        const reference = findReference(markerName);
        if (reference) {
          recommendations.push({
            ...reference,
            reason: 'Wichtiger Basismarker',
            priority: 'normal'
          });
          addedNames.add(markerName);
        }
      }
    });

    // Sort by priority
    return recommendations.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return 0;
    }).slice(0, 10);
  }, [suboptimalMarkers, currentMarkerNames, markerReferences, user?.gender]);

  // Generate downloadable/copyable list
  const generateMarkerList = () => {
    const lines = [
      'CELLUIQ - Empfohlene Blutmarker',
      '================================',
      '',
      `Erstellt am: ${new Date().toLocaleDateString('de-DE')}`,
      '',
    ];

    if (highPriorityMarkers.length > 0) {
      lines.push('PRIORITÄT - Erweiterte Diagnostik:');
      lines.push('---------------------------------');
      highPriorityMarkers.forEach(m => {
        lines.push(`• ${m.marker_name} (${m.category?.replace('_', ' ')})`);
        lines.push(`  Grund: ${m.reason}`);
      });
      lines.push('');
    }

    if (normalPriorityMarkers.length > 0) {
      lines.push('BASIS - Fehlende Standardmarker:');
      lines.push('--------------------------------');
      normalPriorityMarkers.forEach(m => {
        lines.push(`• ${m.marker_name} (${m.category?.replace('_', ' ')})`);
      });
    }

    return lines.join('\n');
  };

  const copyMarkerList = async () => {
    await navigator.clipboard.writeText(generateMarkerList());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkerList = () => {
    const content = generateMarkerList();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `celluiq-marker-liste-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (recommendedMarkers.length === 0) {
    return null;
  }

  const highPriorityMarkers = recommendedMarkers.filter(m => m.priority === 'high');
  const normalPriorityMarkers = recommendedMarkers.filter(m => m.priority === 'normal');

  return (
    <div className="space-y-4">
      {/* High Priority - Based on suboptimal markers */}
      {highPriorityMarkers.length > 0 && (
        <div className="bg-gradient-to-r from-[#B7323F15] to-[#B7323F05] rounded-2xl p-4 border border-[#B7323F30]">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-[#B7323F]" />
            <h3 className="text-white font-semibold">Erweiterte Diagnostik empfohlen</h3>
          </div>
          <p className="text-[#808080] text-sm mb-4">
            Basierend auf deinen suboptimalen Markern könnten diese Tests weitere Einblicke geben:
          </p>
          <div className="space-y-2">
            {highPriorityMarkers.map((marker) => (
              <div 
                key={marker.id}
                className="flex items-center justify-between p-3 bg-[#0A0A0A80] rounded-xl"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{marker.marker_name}</p>
                  <p className="text-[#B7323F] text-xs">{marker.reason}</p>
                </div>
                <button
                  onClick={() => onAddMarker?.(marker)}
                  className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#808080]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Normal Priority - Missing basic markers */}
      {normalPriorityMarkers.length > 0 && (
        <div className="bg-[#111111] rounded-2xl p-4 border border-[#1A1A1A]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[#3B7C9E]" />
            <h3 className="text-white font-semibold">Empfohlene Marker</h3>
          </div>
          <p className="text-[#808080] text-sm mb-4">
            Diese wichtigen Marker fehlen noch in deinem Profil:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {normalPriorityMarkers.slice(0, 6).map((marker) => (
              <div 
                key={marker.id}
                className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl border border-[#1A1A1A]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{marker.marker_name}</p>
                  <p className="text-[#666666] text-xs capitalize">{marker.category?.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={() => onAddMarker?.(marker)}
                  className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#808080]" />
                </button>
              </div>
            ))}
          </div>
          
          {normalPriorityMarkers.length > 6 && (
            <Button 
              variant="ghost" 
              className="w-full mt-3 text-[#3B7C9E] hover:text-[#3B7C9E] hover:bg-[#3B7C9E10]"
            >
              Alle {normalPriorityMarkers.length} Marker anzeigen
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      )}

      {/* Download/Copy List for Doctor */}
      {recommendedMarkers.length > 0 && (
        <div className="bg-[#111111] rounded-2xl p-4 border border-[#1A1A1A]">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-[#808080]" />
            <h3 className="text-white font-semibold">{t('markersToTest')}</h3>
          </div>
          <p className="text-[#808080] text-sm mb-4">
            Liste für deinen Arzt oder das Labor herunterladen
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={copyMarkerList}
              variant="outline" 
              className="flex-1 border-[#333333] text-white hover:bg-[#1A1A1A]"
            >
              {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Kopiert!' : 'Kopieren'}
            </Button>
            <Button 
              onClick={downloadMarkerList}
              className="flex-1 bg-[#3B7C9E] hover:bg-[#2D5F7A] text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('downloadMarkerList')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}