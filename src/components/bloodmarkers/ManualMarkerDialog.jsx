import React, { useState, useMemo } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, X, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ManualMarkerDialog({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReference, setSelectedReference] = useState(null);
  const [value, setValue] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: markerReferences = [] } = useQuery({
    queryKey: ['markerReferences'],
    queryFn: () => base44.entities.BloodMarkerReference.list(),
  });

  // Filter references by user gender
  const filteredReferences = useMemo(() => {
    const userGender = user?.gender || 'both';
    return markerReferences.filter(ref => 
      ref.gender === 'both' || ref.gender === userGender
    );
  }, [markerReferences, user?.gender]);

  // Search suggestions
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    return filteredReferences
      .filter(ref => 
        ref.marker_name?.toLowerCase().includes(query) ||
        ref.short_name?.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [searchQuery, filteredReferences]);

  // Get unique units from all references for fallback
  const availableUnits = useMemo(() => {
    const units = new Set();
    filteredReferences.forEach(ref => {
      if (ref.unit) units.add(ref.unit);
    });
    return Array.from(units).sort();
  }, [filteredReferences]);

  const addMarkerMutation = useMutation({
    mutationFn: (data) => base44.entities.BloodMarker.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodMarkers'] });
      handleClose();
    }
  });

  const handleSelectMarker = (reference) => {
    setSelectedReference(reference);
    setSearchQuery(reference.marker_name);
    setSelectedUnit(reference.unit || '');
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedReference(null);
    setValue('');
    setSelectedUnit('');
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedReference || !value) return;
    
    const numValue = parseFloat(value);
    const min = selectedReference.celluiq_range_min ?? selectedReference.clinical_range_min;
    const max = selectedReference.celluiq_range_max ?? selectedReference.clinical_range_max;
    
    let status = 'suboptimal';
    if (min !== null && max !== null) {
      if (numValue >= min && numValue <= max) status = 'optimal';
      else if (numValue < min) status = 'low';
      else if (numValue > max) status = 'high';
    }

    addMarkerMutation.mutate({
      marker_name: selectedReference.marker_name,
      value: numValue,
      unit: selectedUnit || selectedReference.unit,
      test_date: new Date().toISOString().split('T')[0],
      status,
      category: selectedReference.category || 'other',
      optimal_min: selectedReference.celluiq_range_min,
      optimal_max: selectedReference.celluiq_range_max
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#111111] border-[#333333] text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Marker manuell hinzufügen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* Marker Search */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
              <Input
                placeholder="Marker suchen (z.B. Vitamin D, Eisen, TSH...)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedReference && e.target.value !== selectedReference.marker_name) {
                    setSelectedReference(null);
                  }
                }}
                className="bg-[#0A0A0A] border-[#333333] text-white pl-10 pr-10"
              />
              {selectedReference && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && !selectedReference && (
              <div className="absolute z-50 w-full mt-1 bg-[#1A1A1A] border border-[#333333] rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {searchResults.map((ref) => (
                  <button
                    key={ref.id}
                    onClick={() => handleSelectMarker(ref)}
                    className="w-full px-4 py-3 text-left hover:bg-[#222222] transition-colors border-b border-[#333333] last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{ref.marker_name}</p>
                        <p className="text-[#666666] text-xs capitalize">{ref.category?.replace('_', ' ')}</p>
                      </div>
                      <span className="text-[#808080] text-sm">{ref.unit}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* No results message */}
            {searchQuery.length >= 2 && searchResults.length === 0 && !selectedReference && (
              <div className="absolute z-50 w-full mt-1 bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 text-center">
                <p className="text-[#808080] text-sm">Kein Marker gefunden</p>
                <p className="text-[#666666] text-xs mt-1">Bitte wähle einen Marker aus der Datenbank</p>
              </div>
            )}
          </div>

          {/* Selected Marker Info */}
          {selectedReference && (
            <div className="bg-[#0A0A0A] rounded-xl p-4 border border-[#333333]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-semibold">{selectedReference.marker_name}</p>
                  {selectedReference.short_name && selectedReference.short_name !== selectedReference.marker_name && (
                    <p className="text-[#666666] text-xs">Kurzform: {selectedReference.short_name}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedReference(null);
                    setSearchQuery('');
                  }}
                  className="text-[#666666] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-[#808080] capitalize">{selectedReference.category?.replace('_', ' ')}</span>
                {(selectedReference.celluiq_range_min || selectedReference.celluiq_range_max) && (
                  <span className="text-green-500/70">
                    Optimal: {selectedReference.celluiq_range_min ?? '—'} - {selectedReference.celluiq_range_max ?? '—'} {selectedReference.unit}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Value and Unit Input */}
          {selectedReference && (
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Wert eingeben"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-[#0A0A0A] border-[#333333] text-white flex-1"
                autoFocus
              />
              <Select 
                value={selectedUnit || selectedReference.unit} 
                onValueChange={setSelectedUnit}
              >
                <SelectTrigger className="bg-[#0A0A0A] border-[#333333] text-white w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-[#333333]">
                  {/* Primary unit from reference */}
                  {selectedReference.unit && (
                    <SelectItem value={selectedReference.unit} className="text-white">{selectedReference.unit}</SelectItem>
                  )}
                  {/* Other common units if different */}
                  {availableUnits
                    .filter(u => u !== selectedReference.unit)
                    .slice(0, 10)
                    .map(unit => (
                      <SelectItem key={unit} value={unit} className="text-white">{unit}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit}
            disabled={!selectedReference || !value || addMarkerMutation.isPending}
            className="w-full bg-[#B7323F] hover:bg-[#9A2835] disabled:opacity-50"
          >
            {addMarkerMutation.isPending ? 'Wird hinzugefügt...' : 'Marker hinzufügen'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}