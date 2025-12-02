import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, TrendingUp, TrendingDown, Minus, ChevronRight, Info, ShoppingBag, Calendar, Plus, Sparkles, X } from "lucide-react";
import { useLanguage } from "../LanguageProvider";
import BloodMarkerUpload from "../BloodMarkerUpload";
import BloodMarkerDetailModal from "../bloodmarkers/BloodMarkerDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BloodMarkersSection() {
  const { t } = useLanguage();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null); // null = all, 'optimal', 'suboptimal', 'critical'
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualMarker, setManualMarker] = useState({ marker_name: '', value: '', unit: '', category: 'other' });
  
  const queryClient = useQueryClient();

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

  const addMarkerMutation = useMutation({
    mutationFn: (data) => base44.entities.BloodMarker.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodMarkers'] });
      setShowAddManual(false);
      setManualMarker({ marker_name: '', value: '', unit: '', category: 'other' });
    }
  });

  // Get latest value for each marker
  const latestMarkers = bloodMarkers.reduce((acc, marker) => {
    if (!acc[marker.marker_name] || new Date(marker.test_date) > new Date(acc[marker.marker_name].test_date)) {
      acc[marker.marker_name] = marker;
    }
    return acc;
  }, {});

  const allMarkers = Object.values(latestMarkers).sort((a, b) => {
    const priority = { critical: 0, high: 1, low: 2, suboptimal: 3, optimal: 4 };
    return (priority[a.status] || 5) - (priority[b.status] || 5);
  });

  // Filter markers based on selected status
  const sortedMarkers = statusFilter 
    ? allMarkers.filter(m => {
        if (statusFilter === 'critical') return ['critical', 'high', 'low'].includes(m.status);
        if (statusFilter === 'suboptimal') return m.status === 'suboptimal';
        if (statusFilter === 'optimal') return m.status === 'optimal';
        return true;
      })
    : allMarkers;

  // Stats
  const optimalCount = allMarkers.filter(m => m.status === 'optimal').length;
  const suboptimalCount = allMarkers.filter(m => m.status === 'suboptimal').length;
  const criticalCount = allMarkers.filter(m => ['low', 'high', 'critical'].includes(m.status)).length;

  // Calculate days since last test
  const lastTestDate = user?.last_blood_test ? new Date(user.last_blood_test) : null;
  const daysSinceTest = lastTestDate ? Math.floor((new Date() - lastTestDate) / (1000 * 60 * 60 * 24)) : null;
  const needsNewTest = daysSinceTest && daysSinceTest > 90;

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

  const canOrderBloodTest = user?.postal_code;

  const handleAddManualMarker = () => {
    if (!manualMarker.marker_name || !manualMarker.value) return;
    
    const reference = getReference(manualMarker.marker_name);
    const value = parseFloat(manualMarker.value);
    
    let status = 'suboptimal';
    if (reference) {
      const min = reference.celluiq_range_min ?? reference.clinical_range_min;
      const max = reference.celluiq_range_max ?? reference.clinical_range_max;
      if (min && max) {
        if (value >= min && value <= max) status = 'optimal';
        else if (value < min) status = 'low';
        else if (value > max) status = 'high';
      }
    }

    addMarkerMutation.mutate({
      ...manualMarker,
      value,
      test_date: new Date().toISOString().split('T')[0],
      status,
      optimal_min: reference?.celluiq_range_min,
      optimal_max: reference?.celluiq_range_max
    });
  };

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
  if (allMarkers.length === 0) {
    return (
      <div className="p-6">
        <BloodMarkerUpload isOpen={showUpload} onClose={() => setShowUpload(false)} />
        
        <div className="text-center py-8 max-w-lg mx-auto">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#B7323F20] to-[#3B7C9E20] animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-[#111111] flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-[#B7323F]" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">Willkommen bei CELLUIQ</h2>
          <p className="text-[#808080] mb-8">
            Lade dein erstes Blutbild hoch und erhalte personalisierte Gesundheitsempfehlungen
          </p>

          <div className="space-y-3">
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

            {canOrderBloodTest && (
              <button className="w-full bg-[#111111] border-2 border-[#3B7C9E] rounded-2xl p-5 flex items-center gap-4 hover:bg-[#3B7C9E10] transition-all group">
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

            <button
              onClick={() => setShowAddManual(true)}
              className="w-full bg-[#111111] border border-[#333333] rounded-2xl p-4 flex items-center gap-3 hover:bg-[#1A1A1A] transition-all"
            >
              <Plus className="w-5 h-5 text-[#808080]" />
              <span className="text-[#808080]">Marker manuell hinzufügen</span>
            </button>
          </div>
        </div>

        {/* Manual Add Dialog */}
        <Dialog open={showAddManual} onOpenChange={setShowAddManual}>
          <DialogContent className="bg-[#111111] border-[#333333] text-white">
            <DialogHeader>
              <DialogTitle>Marker manuell hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Marker Name (z.B. Vitamin D)"
                value={manualMarker.marker_name}
                onChange={(e) => setManualMarker(prev => ({ ...prev, marker_name: e.target.value }))}
                className="bg-[#0A0A0A] border-[#333333] text-white"
              />
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Wert"
                  value={manualMarker.value}
                  onChange={(e) => setManualMarker(prev => ({ ...prev, value: e.target.value }))}
                  className="bg-[#0A0A0A] border-[#333333] text-white flex-1"
                />
                <Input
                  placeholder="Einheit"
                  value={manualMarker.unit}
                  onChange={(e) => setManualMarker(prev => ({ ...prev, unit: e.target.value }))}
                  className="bg-[#0A0A0A] border-[#333333] text-white w-24"
                />
              </div>
              <Select 
                value={manualMarker.category} 
                onValueChange={(v) => setManualMarker(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger className="bg-[#0A0A0A] border-[#333333] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-[#333333]">
                  <SelectItem value="vitamins">Vitamine</SelectItem>
                  <SelectItem value="minerals">Mineralien</SelectItem>
                  <SelectItem value="hormones">Hormone</SelectItem>
                  <SelectItem value="lipids">Lipide</SelectItem>
                  <SelectItem value="liver">Leber</SelectItem>
                  <SelectItem value="kidney">Niere</SelectItem>
                  <SelectItem value="thyroid">Schilddrüse</SelectItem>
                  <SelectItem value="inflammation">Entzündung</SelectItem>
                  <SelectItem value="other">Sonstige</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddManualMarker}
                disabled={!manualMarker.marker_name || !manualMarker.value || addMarkerMutation.isPending}
                className="w-full bg-[#B7323F] hover:bg-[#9A2835]"
              >
                {addMarkerMutation.isPending ? 'Wird hinzugefügt...' : 'Hinzufügen'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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

      {/* Manual Add Dialog */}
      <Dialog open={showAddManual} onOpenChange={setShowAddManual}>
        <DialogContent className="bg-[#111111] border-[#333333] text-white">
          <DialogHeader>
            <DialogTitle>Marker manuell hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Marker Name (z.B. Vitamin D)"
              value={manualMarker.marker_name}
              onChange={(e) => setManualMarker(prev => ({ ...prev, marker_name: e.target.value }))}
              className="bg-[#0A0A0A] border-[#333333] text-white"
            />
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Wert"
                value={manualMarker.value}
                onChange={(e) => setManualMarker(prev => ({ ...prev, value: e.target.value }))}
                className="bg-[#0A0A0A] border-[#333333] text-white flex-1"
              />
              <Input
                placeholder="Einheit"
                value={manualMarker.unit}
                onChange={(e) => setManualMarker(prev => ({ ...prev, unit: e.target.value }))}
                className="bg-[#0A0A0A] border-[#333333] text-white w-24"
              />
            </div>
            <Select 
              value={manualMarker.category} 
              onValueChange={(v) => setManualMarker(prev => ({ ...prev, category: v }))}
            >
              <SelectTrigger className="bg-[#0A0A0A] border-[#333333] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-[#333333]">
                <SelectItem value="vitamins">Vitamine</SelectItem>
                <SelectItem value="minerals">Mineralien</SelectItem>
                <SelectItem value="hormones">Hormone</SelectItem>
                <SelectItem value="lipids">Lipide</SelectItem>
                <SelectItem value="liver">Leber</SelectItem>
                <SelectItem value="kidney">Niere</SelectItem>
                <SelectItem value="thyroid">Schilddrüse</SelectItem>
                <SelectItem value="inflammation">Entzündung</SelectItem>
                <SelectItem value="other">Sonstige</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddManualMarker}
              disabled={!manualMarker.marker_name || !manualMarker.value || addMarkerMutation.isPending}
              className="w-full bg-[#B7323F] hover:bg-[#9A2835]"
            >
              {addMarkerMutation.isPending ? 'Wird hinzugefügt...' : 'Hinzufügen'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
              <div className="flex flex-wrap gap-2 mt-3">
                <Button size="sm" className="bg-[#B7323F] hover:bg-[#9A2835] text-white" onClick={() => setShowUpload(true)}>
                  Neues Ergebnis hochladen
                </Button>
                {canOrderBloodTest && (
                  <Button size="sm" variant="outline" className="border-[#B7323F] text-[#B7323F] hover:bg-[#B7323F10]">
                    Test bestellen
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setShowUpload(true)}
          className="flex-1 min-w-[200px] bg-gradient-to-r from-[#B7323F] to-[#8B1F2F] rounded-xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold">{t('uploadResults')}</p>
            <p className="text-white/60 text-xs">PDF, PNG oder JPG</p>
          </div>
        </button>
        
        <button
          onClick={() => setShowAddManual(true)}
          className="bg-[#111111] border border-[#333333] rounded-xl p-4 flex items-center gap-2 hover:bg-[#1A1A1A] transition-all"
        >
          <Plus className="w-5 h-5 text-[#808080]" />
          <span className="text-[#808080] text-sm hidden md:block">Manuell hinzufügen</span>
        </button>
      </div>

      {/* Clickable Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => setStatusFilter(statusFilter === 'optimal' ? null : 'optimal')}
          className={`rounded-xl p-3 text-center border transition-all ${
            statusFilter === 'optimal' 
              ? 'bg-green-500/20 border-green-500' 
              : 'bg-green-500/10 border-green-500/20 hover:border-green-500/50'
          }`}
        >
          <p className="text-green-400 font-bold text-xl">{optimalCount}</p>
          <p className="text-green-400/70 text-xs">Optimal</p>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'suboptimal' ? null : 'suboptimal')}
          className={`rounded-xl p-3 text-center border transition-all ${
            statusFilter === 'suboptimal' 
              ? 'bg-yellow-500/20 border-yellow-500' 
              : 'bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/50'
          }`}
        >
          <p className="text-yellow-400 font-bold text-xl">{suboptimalCount}</p>
          <p className="text-yellow-400/70 text-xs">Suboptimal</p>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'critical' ? null : 'critical')}
          className={`rounded-xl p-3 text-center border transition-all ${
            statusFilter === 'critical' 
              ? 'bg-red-500/20 border-red-500' 
              : 'bg-red-500/10 border-red-500/20 hover:border-red-500/50'
          }`}
        >
          <p className="text-red-400 font-bold text-xl">{criticalCount}</p>
          <p className="text-red-400/70 text-xs">Achtung</p>
        </button>
      </div>

      {/* Active Filter Indicator */}
      {statusFilter && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[#808080] text-sm">
            Zeigt: {statusFilter === 'optimal' ? 'Optimale' : statusFilter === 'suboptimal' ? 'Suboptimale' : 'Kritische'} Marker
          </span>
          <button 
            onClick={() => setStatusFilter(null)}
            className="text-[#B7323F] text-sm flex items-center gap-1 hover:opacity-80"
          >
            <X className="w-3 h-3" /> Alle anzeigen
          </button>
        </div>
      )}

      {/* Markers List - Desktop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
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
                    {reference && <Info className="w-3.5 h-3.5 text-[#3B7C9E]" />}
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
                    {marker.status === 'optimal' ? 'Optimal' : 
                     marker.status === 'suboptimal' ? 'Suboptimal' : 
                     marker.status === 'low' ? 'Niedrig' :
                     marker.status === 'high' ? 'Hoch' : 'Kritisch'}
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

      {/* Empty filter result */}
      {sortedMarkers.length === 0 && statusFilter && (
        <div className="text-center py-8">
          <p className="text-[#808080]">Keine {statusFilter === 'optimal' ? 'optimalen' : statusFilter === 'suboptimal' ? 'suboptimalen' : 'kritischen'} Marker gefunden</p>
          <button onClick={() => setStatusFilter(null)} className="text-[#3B7C9E] mt-2 text-sm">Alle Marker anzeigen</button>
        </div>
      )}
    </div>
  );
}