import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Upload, TrendingUp, TrendingDown, Minus, ChevronRight, Info, ShoppingBag, Calendar, AlertCircle, Sparkles } from "lucide-react";
import { useLanguage } from "../LanguageProvider";
import BloodMarkerUpload from "../BloodMarkerUpload";
import BloodMarkerDetailModal from "../bloodmarkers/BloodMarkerDetailModal";
import { Button } from "@/components/ui/button";

export default function BloodMarkersSection() {
  const { t } = useLanguage();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bloodMarkers = [], isLoading } = useQuery({
    queryKey: ['bloodMarkers'],
    queryFn: () => base44.entities.BloodMarker.list('-test_date'),
  });

  const { data: markerReferences = [] } = useQuery({
    queryKey: ['markerReferences'],
    queryFn: () => base44.entities.BloodMarkerReference.list(),
  });

  // Get latest value for each marker
  const latestMarkers = bloodMarkers.reduce((acc, marker) => {
    if (!acc[marker.marker_name] || new Date(marker.test_date) > new Date(acc[marker.marker_name].test_date)) {
      acc[marker.marker_name] = marker;
    }
    return acc;
  }, {});

  const sortedMarkers = Object.values(latestMarkers).sort((a, b) => {
    const priority = { critical: 0, high: 1, low: 2, suboptimal: 3, optimal: 4 };
    return (priority[a.status] || 5) - (priority[b.status] || 5);
  });

  // Calculate days since last test
  const lastTestDate = user?.last_blood_test ? new Date(user.last_blood_test) : null;
  const daysSinceTest = lastTestDate ? Math.floor((new Date() - lastTestDate) / (1000 * 60 * 60 * 24)) : null;
  const needsNewTest = daysSinceTest && daysSinceTest > 90;

  // Get recommended markers that user hasn't tested
  const testedMarkerNames = Object.keys(latestMarkers).map(n => n.toLowerCase());
  const recommendedMarkers = markerReferences
    .filter(ref => !testedMarkerNames.includes(ref.marker_name?.toLowerCase()))
    .slice(0, 6);

  const getReference = (markerName) => {
    return markerReferences.find(ref => 
      ref.marker_name?.toLowerCase() === markerName?.toLowerCase() ||
      ref.short_name?.toLowerCase() === markerName?.toLowerCase()
    );
  };

  const getPreviousValue = (markerName) => {
    const markerHistory = bloodMarkers
      .filter(m => m.marker_name === markerName)
      .sort((a, b) => new Date(b.test_date) - new Date(a.test_date));
    return markerHistory.length > 1 ? markerHistory[1].value : null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return 'text-green-400 bg-green-500/20';
      case 'suboptimal': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
      default: return 'text-[#808080] bg-[#1A1A1A]';
    }
  };

  const getTrend = (current, previous) => {
    if (!previous) return null;
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'same';
  };

  const getMarkerPosition = (value, min, max) => {
    if (!min || !max) return 50;
    const range = max - min;
    const position = ((value - min) / range) * 100;
    return Math.max(0, Math.min(100, position));
  };

  // Check if user is in supported region for blood test orders
  const canOrderBloodTest = user?.postal_code && (
    user.postal_code.startsWith('1') || // Germany starts with various
    user.postal_code.startsWith('2') ||
    user.postal_code.startsWith('3') ||
    user.postal_code.startsWith('4') ||
    user.postal_code.startsWith('5') ||
    user.postal_code.startsWith('6') ||
    user.postal_code.startsWith('7') ||
    user.postal_code.startsWith('8') ||
    user.postal_code.startsWith('9') ||
    user.postal_code.startsWith('0')
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#111111] rounded-2xl p-4 animate-pulse">
            <div className="h-6 bg-[#1A1A1A] rounded w-1/3 mb-2" />
            <div className="h-4 bg-[#1A1A1A] rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Empty State for new users
  if (sortedMarkers.length === 0) {
    return (
      <div className="p-6">
        <BloodMarkerUpload isOpen={showUpload} onClose={() => setShowUpload(false)} />
        
        <div className="text-center py-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#B7323F20] to-[#3B7C9E20] animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-[#111111] flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-[#B7323F]" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">Willkommen bei CELLUIQ</h2>
          <p className="text-[#808080] mb-8 max-w-sm mx-auto">
            Lade dein erstes Blutbild hoch und erhalte personalisierte Gesundheitsempfehlungen
          </p>

          <div className="space-y-3 max-w-sm mx-auto">
            {/* Upload Option */}
            <button
              onClick={() => setShowUpload(true)}
              className="w-full bg-gradient-to-r from-[#B7323F] to-[#8B1F2F] rounded-2xl p-5 flex items-center gap-4 hover:opacity-90 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="text-white font-semibold text-lg">Blutbild hochladen</p>
                <p className="text-white/60 text-sm">PDF, PNG oder JPG</p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/60" />
            </button>

            {/* Order Option */}
            {canOrderBloodTest && (
              <button
                className="w-full bg-[#111111] border-2 border-[#3B7C9E] rounded-2xl p-5 flex items-center gap-4 hover:bg-[#3B7C9E10] transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-[#3B7C9E20] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-7 h-7 text-[#3B7C9E]" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-semibold text-lg">Bluttest bestellen</p>
                  <p className="text-[#808080] text-sm">Komplettes Panel ab 89€</p>
                </div>
                <ChevronRight className="w-6 h-6 text-[#3B7C9E]" />
              </button>
            )}
          </div>

          {/* Recommended Markers Preview */}
          {recommendedMarkers.length > 0 && (
            <div className="mt-10">
              <h3 className="text-white font-semibold mb-4 text-left">Empfohlene Marker</h3>
              <div className="grid grid-cols-2 gap-2">
                {recommendedMarkers.slice(0, 4).map((ref, idx) => (
                  <div key={idx} className="bg-[#111111] rounded-xl p-3 text-left border border-[#1A1A1A]">
                    <p className="text-white text-sm font-medium">{ref.marker_name}</p>
                    <p className="text-[#666666] text-xs">{ref.category}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <BloodMarkerUpload isOpen={showUpload} onClose={() => setShowUpload(false)} />
      
      {selectedMarker && (
        <BloodMarkerDetailModal 
          marker={selectedMarker} 
          reference={getReference(selectedMarker.marker_name)}
          onClose={() => setSelectedMarker(null)} 
        />
      )}

      {/* Retest Reminder */}
      {needsNewTest && (
        <div className="bg-gradient-to-r from-[#B7323F20] to-[#B7323F10] border border-[#B7323F40] rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B7323F] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">Neuer Bluttest empfohlen</p>
              <p className="text-[#808080] text-sm">
                Dein letzter Test war vor {daysSinceTest} Tagen. Für optimale Ergebnisse empfehlen wir alle 3 Monate einen Check.
              </p>
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  className="bg-[#B7323F] hover:bg-[#9A2835] text-white"
                  onClick={() => setShowUpload(true)}
                >
                  Neues Ergebnis hochladen
                </Button>
                {canOrderBloodTest && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-[#B7323F] text-[#B7323F] hover:bg-[#B7323F10]"
                  >
                    Test bestellen
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={() => setShowUpload(true)}
        className="w-full bg-gradient-to-r from-[#B7323F] to-[#8B1F2F] rounded-2xl p-4 mb-6 flex items-center justify-between hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold">{t('uploadResults')}</p>
            <p className="text-white/60 text-xs">PDF, PNG oder JPG</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/60" />
      </button>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20">
          <p className="text-green-400 font-bold text-xl">
            {sortedMarkers.filter(m => m.status === 'optimal').length}
          </p>
          <p className="text-green-400/70 text-xs">Optimal</p>
        </div>
        <div className="bg-yellow-500/10 rounded-xl p-3 text-center border border-yellow-500/20">
          <p className="text-yellow-400 font-bold text-xl">
            {sortedMarkers.filter(m => m.status === 'suboptimal').length}
          </p>
          <p className="text-yellow-400/70 text-xs">Suboptimal</p>
        </div>
        <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
          <p className="text-red-400 font-bold text-xl">
            {sortedMarkers.filter(m => ['low', 'high', 'critical'].includes(m.status)).length}
          </p>
          <p className="text-red-400/70 text-xs">Achtung</p>
        </div>
      </div>

      {/* Markers List */}
      <div className="space-y-3 mb-8">
        {sortedMarkers.map((marker) => {
          const reference = getReference(marker.marker_name);
          const previousValue = getPreviousValue(marker.marker_name);
          const trend = getTrend(marker.value, previousValue);
          const position = getMarkerPosition(
            marker.value, 
            marker.optimal_min || reference?.celluiq_range_min, 
            marker.optimal_max || reference?.celluiq_range_max
          );

          return (
            <button
              key={marker.id}
              onClick={() => setSelectedMarker(marker)}
              className="w-full bg-[#111111] rounded-2xl p-4 border border-[#1A1A1A] hover:border-[#333333] transition-all text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{marker.marker_name}</h3>
                    {reference && (
                      <Info className="w-3.5 h-3.5 text-[#3B7C9E]" />
                    )}
                  </div>
                  <p className="text-[#666666] text-xs mt-0.5 capitalize">{marker.category?.replace('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg">{marker.value}</span>
                    <span className="text-[#666666] text-sm">{marker.unit}</span>
                    {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                    {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                    {trend === 'same' && <Minus className="w-4 h-4 text-[#666666]" />}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(marker.status)}`}>
                    {marker.status}
                  </span>
                </div>
              </div>

              {/* Range Bar */}
              <div className="relative">
                <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-[20%] right-[20%] bg-green-500/30 rounded-full" />
                </div>
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#B7323F] shadow-lg"
                  style={{ left: `calc(${position}% - 6px)` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[#666666] text-xs">
                  {marker.optimal_min || reference?.celluiq_range_min || '—'}
                </span>
                <span className="text-[#666666] text-xs">{t('optimalRange')}</span>
                <span className="text-[#666666] text-xs">
                  {marker.optimal_max || reference?.celluiq_range_max || '—'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Recommended Additional Markers */}
      {recommendedMarkers.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-[#3B7C9E]" />
            <h3 className="text-white font-semibold">Empfohlene zusätzliche Marker</h3>
          </div>
          <p className="text-[#666666] text-sm mb-4">
            Diese Werte empfehlen wir bei deinem nächsten Bluttest zu überprüfen:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {recommendedMarkers.map((ref, idx) => (
              <div key={idx} className="bg-[#111111] rounded-xl p-3 border border-[#1A1A1A]">
                <p className="text-white text-sm font-medium">{ref.marker_name}</p>
                <p className="text-[#666666] text-xs capitalize">{ref.category?.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
          
          {canOrderBloodTest && (
            <Button className="w-full mt-4 bg-[#3B7C9E] hover:bg-[#2D5F7A] text-white">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Komplettes Panel bestellen
            </Button>
          )}
        </div>
      )}
    </div>
  );
}