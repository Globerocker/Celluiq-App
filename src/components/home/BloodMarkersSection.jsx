import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Upload, TrendingUp, TrendingDown, Minus, Info, Calendar, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import BloodMarkerUpload from "../BloodMarkerUpload";
import BloodMarkerDetailModal from "../bloodmarkers/BloodMarkerDetailModal";

// Recommended markers for comprehensive health assessment
const recommendedMarkers = [
  { name: "Vitamin D", category: "vitamins", importance: "Immunsystem, Knochen, Stimmung" },
  { name: "Vitamin B12", category: "vitamins", importance: "Energie, Nervensystem" },
  { name: "Ferritin", category: "minerals", importance: "Eisenspeicher, Energie" },
  { name: "TSH", category: "thyroid", importance: "Schilddrüsenfunktion" },
  { name: "Testosteron", category: "hormones", importance: "Energie, Muskeln, Libido" },
  { name: "hsCRP", category: "inflammation", importance: "Entzündungsmarker" },
  { name: "HbA1c", category: "metabolic", importance: "Langzeit-Blutzucker" },
  { name: "LDL Cholesterin", category: "lipids", importance: "Herzgesundheit" },
  { name: "Omega-3 Index", category: "lipids", importance: "Entzündung, Gehirn" },
  { name: "Cortisol", category: "hormones", importance: "Stress, Energie" }
];

export default function BloodMarkersSection() {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showRecommended, setShowRecommended] = useState(false);

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

  // Check which recommended markers are missing
  const missingMarkers = recommendedMarkers.filter(rec => 
    !sortedMarkers.find(m => m.marker_name.toLowerCase().includes(rec.name.toLowerCase()))
  );

  // Calculate days since last test
  const lastTestDate = user?.last_blood_test ? new Date(user.last_blood_test) : null;
  const daysSinceTest = lastTestDate ? Math.floor((new Date() - lastTestDate) / (1000 * 60 * 60 * 24)) : null;
  const needsNewTest = daysSinceTest !== null && daysSinceTest >= 90;

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
      default: return 'text-[var(--text-secondary)] bg-[var(--bg-tertiary)]';
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

  // Empty State - New User
  if (!isLoading && sortedMarkers.length === 0) {
    return (
      <div className="p-6">
        <BloodMarkerUpload isOpen={showUpload} onClose={() => setShowUpload(false)} />

        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-[#B7323F20] via-[var(--bg-secondary)] to-[#3B7C9E20] rounded-3xl p-8 mb-6 border border-[var(--border-color)] text-center">
          <div className="w-20 h-20 rounded-full bg-[#B7323F20] flex items-center justify-center mx-auto mb-6">
            <Upload className="w-10 h-10 text-[#B7323F]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Willkommen bei CELLUIQ
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
            Lade dein erstes Blutbild hoch, um personalisierte Gesundheitsempfehlungen zu erhalten.
          </p>
          
          <Button 
            onClick={() => setShowUpload(true)}
            className="bg-[#B7323F] hover:bg-[#9A2835] text-white px-8 py-6 rounded-xl text-lg font-semibold mb-4 w-full"
          >
            <Upload className="w-5 h-5 mr-2" />
            Erstes Blutbild hochladen
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-color)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--bg-primary)] px-4 text-[var(--text-tertiary)] text-sm">oder</span>
            </div>
          </div>

          {/* Order Blood Test */}
          {user?.postal_code && (
            <Button 
              variant="outline"
              className="w-full border-[#3B7C9E] text-[#3B7C9E] hover:bg-[#3B7C9E20] py-6 rounded-xl"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Bluttest für PLZ {user.postal_code} bestellen
            </Button>
          )}
        </div>

        {/* Recommended Markers Info */}
        <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--border-color)]">
          <h3 className="text-[var(--text-primary)] font-semibold mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#3B7C9E]" />
            Empfohlene Marker für dein erstes Blutbild
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {recommendedMarkers.slice(0, 6).map((marker, idx) => (
              <div key={idx} className="bg-[var(--bg-primary)] rounded-xl p-3">
                <p className="text-[var(--text-primary)] text-sm font-medium">{marker.name}</p>
                <p className="text-[var(--text-tertiary)] text-xs">{marker.importance}</p>
              </div>
            ))}
          </div>
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
        <div className="bg-gradient-to-r from-[#B7323F20] to-[#B7323F10] rounded-2xl p-4 mb-6 border border-[#B7323F30]">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[#B7323F] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[var(--text-primary)] font-semibold text-sm">Zeit für ein neues Blutbild!</p>
              <p className="text-[var(--text-secondary)] text-xs mt-1">
                Dein letzter Test ist {daysSinceTest} Tage her. Wir empfehlen alle 3 Monate zu testen.
              </p>
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  className="bg-[#B7323F] hover:bg-[#9A2835] text-white text-xs"
                  onClick={() => setShowUpload(true)}
                >
                  Neues Blutbild hochladen
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-[#B7323F] text-[#B7323F] text-xs"
                >
                  Test bestellen
                </Button>
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
            <p className="text-white font-semibold">Blutbild hochladen</p>
            <p className="text-white/60 text-xs">PDF, PNG oder JPG</p>
          </div>
        </div>
        <Plus className="w-5 h-5 text-white/60" />
      </button>

      {/* Summary Stats */}
      {sortedMarkers.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-400">
              {sortedMarkers.filter(m => m.status === 'optimal').length}
            </p>
            <p className="text-xs text-green-400/80">Optimal</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {sortedMarkers.filter(m => m.status === 'suboptimal').length}
            </p>
            <p className="text-xs text-yellow-400/80">Suboptimal</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-400">
              {sortedMarkers.filter(m => ['low', 'high', 'critical'].includes(m.status)).length}
            </p>
            <p className="text-xs text-red-400/80">Achtung</p>
          </div>
        </div>
      )}

      {/* Markers List */}
      <div className="space-y-3 mb-6">
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
              className="w-full bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-color)] hover:border-[var(--text-tertiary)] transition-all text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[var(--text-primary)] font-semibold">{marker.marker_name}</h3>
                    {reference && <Info className="w-3.5 h-3.5 text-[#3B7C9E]" />}
                  </div>
                  <p className="text-[var(--text-tertiary)] text-xs mt-0.5 capitalize">{marker.category}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-primary)] font-bold text-lg">{marker.value}</span>
                    <span className="text-[var(--text-tertiary)] text-sm">{marker.unit}</span>
                    {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                    {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                    {trend === 'same' && <Minus className="w-4 h-4 text-[var(--text-tertiary)]" />}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(marker.status)}`}>
                    {marker.status === 'optimal' ? 'Optimal' : 
                     marker.status === 'suboptimal' ? 'Suboptimal' : 
                     marker.status === 'low' ? 'Niedrig' :
                     marker.status === 'high' ? 'Hoch' : 'Kritisch'}
                  </span>
                </div>
              </div>

              {/* Range Bar */}
              <div className="relative">
                <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-[20%] right-[20%] bg-green-500/30 rounded-full" />
                </div>
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#B7323F] shadow-lg"
                  style={{ left: `calc(${position}% - 6px)` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[var(--text-tertiary)] text-xs">
                  {marker.optimal_min || reference?.celluiq_range_min || '—'}
                </span>
                <span className="text-[var(--text-tertiary)] text-xs">Optimal</span>
                <span className="text-[var(--text-tertiary)] text-xs">
                  {marker.optimal_max || reference?.celluiq_range_max || '—'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Missing Recommended Markers */}
      {missingMarkers.length > 0 && (
        <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--border-color)]">
          <button 
            onClick={() => setShowRecommended(!showRecommended)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#3B7C9E]" />
              <h3 className="text-[var(--text-primary)] font-semibold">Empfohlene weitere Marker</h3>
            </div>
            <span className="text-[var(--text-tertiary)] text-sm">{missingMarkers.length} Marker</span>
          </button>
          
          {showRecommended && (
            <div className="mt-4 space-y-2">
              {missingMarkers.map((marker, idx) => (
                <div key={idx} className="bg-[var(--bg-primary)] rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[var(--text-primary)] text-sm font-medium">{marker.name}</p>
                    <p className="text-[var(--text-tertiary)] text-xs">{marker.importance}</p>
                  </div>
                  <span className="text-[#3B7C9E] text-xs bg-[#3B7C9E20] px-2 py-1 rounded-full">
                    Empfohlen
                  </span>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-3 border-[#3B7C9E] text-[#3B7C9E]"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Diese Marker bestellen
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}