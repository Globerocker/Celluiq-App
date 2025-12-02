import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Upload, FileText, Check, AlertCircle, Sparkles, Dna, FlaskConical, Brain, Cloud } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { convertToReferenceUnit } from './utils/unitConversion';

const loadingSteps = [
  { id: 1, icon: Upload, text: "Datei wird hochgeladen...", subtext: "Sichere Übertragung" },
  { id: 2, icon: Cloud, text: "Backup in Google Drive...", subtext: "Sichere Speicherung" },
  { id: 3, icon: Dna, text: "Biomarker werden erkannt...", subtext: "KI-gestützte Analyse" },
  { id: 4, icon: FlaskConical, text: "Werte werden konvertiert...", subtext: "Einheiten-Normalisierung" },
  { id: 5, icon: Brain, text: "Empfehlungen werden erstellt...", subtext: "Personalisierte Auswertung" },
];

export default function BloodMarkerUpload({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [extractedMarkers, setExtractedMarkers] = useState([]);
  const queryClient = useQueryClient();

  const { data: markerReferences = [] } = useQuery({
    queryKey: ['markerReferences'],
    queryFn: () => base44.entities.BloodMarkerReference.list(),
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const findMatchingReference = (markerName, gender = 'both') => {
    const normalizedName = markerName.toLowerCase().trim();
    
    return markerReferences.find(ref => {
      const refName = (ref.marker_name || '').toLowerCase();
      const refShort = (ref.short_name || '').toLowerCase();
      const matchesGender = ref.gender === 'both' || ref.gender === gender;
      
      return matchesGender && (
        refName.includes(normalizedName) || 
        normalizedName.includes(refName) ||
        refShort === normalizedName ||
        normalizedName.includes(refShort)
      );
    });
  };

  const determineStatus = (value, reference) => {
    if (!reference) return 'suboptimal';
    
    const celluiqMin = reference.celluiq_range_min;
    const celluiqMax = reference.celluiq_range_max;
    const clinicalMin = reference.clinical_range_min;
    const clinicalMax = reference.clinical_range_max;
    
    const min = celluiqMin ?? clinicalMin;
    const max = celluiqMax ?? clinicalMax;
    
    if (min == null || max == null) return 'suboptimal';
    
    if (value >= min && value <= max) return 'optimal';
    
    const range = max - min;
    const deviation = value < min ? min - value : value - max;
    
    if (deviation > range * 0.5) return 'critical';
    if (value < min) return 'low';
    if (value > max) return 'high';
    return 'suboptimal';
  };

  const simulateProgress = () => {
    return new Promise((resolve) => {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setCurrentStep(step);
        if (step >= loadingSteps.length) {
          clearInterval(interval);
          resolve();
        }
      }, 1200);
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setCurrentStep(0);
    
    try {
      // Start progress animation
      const progressPromise = simulateProgress();
      
      // Upload the file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Get user gender
      const user = await base44.auth.me();
      const userGender = user?.gender || 'both';
      
      // Extract data
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            markers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  marker_name: { type: "string", description: "Name of the blood marker" },
                  value: { type: "number", description: "Measured value" },
                  unit: { type: "string", description: "Unit of measurement" },
                  reference_min: { type: "number", description: "Reference range minimum" },
                  reference_max: { type: "number", description: "Reference range maximum" }
                }
              }
            }
          }
        }
      });

      // Wait for animation to complete
      await progressPromise;

      if (result.status === "success" && result.output?.markers) {
        const markers = result.output.markers;
        const today = new Date().toISOString().split('T')[0];
        
        const processedMarkers = markers.map(m => {
          const reference = findMatchingReference(m.marker_name, userGender);
          
          // Convert value to reference unit if needed
          let finalValue = m.value;
          let finalUnit = m.unit || reference?.unit || '';
          
          if (reference?.unit && m.unit && reference.unit !== m.unit) {
            finalValue = convertToReferenceUnit(m.value, m.marker_name, m.unit, reference.unit);
            finalUnit = reference.unit;
          }
          
          const status = determineStatus(finalValue, reference);
          
          return {
            marker_name: m.marker_name,
            value: finalValue,
            original_value: m.value,
            original_unit: m.unit,
            unit: finalUnit,
            optimal_min: reference?.celluiq_range_min ?? reference?.clinical_range_min ?? m.reference_min,
            optimal_max: reference?.celluiq_range_max ?? reference?.clinical_range_max ?? m.reference_max,
            test_date: today,
            status,
            category: reference?.category || 'other'
          };
        });

        setExtractedMarkers(processedMarkers);
        
        await base44.entities.BloodMarker.bulkCreate(processedMarkers);
        
        // Update user's last test date
        await base44.auth.updateMe({ last_blood_test: today });
        
        queryClient.invalidateQueries({ queryKey: ['bloodMarkers'] });
        setSuccess(true);
        
        setTimeout(() => {
          onClose();
          setFile(null);
          setSuccess(false);
          setExtractedMarkers([]);
          setCurrentStep(0);
        }, 3000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Fehler beim Verarbeiten. Bitte erneut versuchen.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!uploading ? onClose : undefined} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-[#111111] rounded-3xl p-6 max-w-md w-full border border-[#1A1A1A] shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {!uploading && !success && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-[#666666] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <AnimatePresence mode="wait">
          {uploading && !success ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              <div className="text-center mb-8">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-[#1A1A1A]" />
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-t-[#B7323F] animate-spin"
                    style={{ animationDuration: '1s' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#B7323F]" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Analyse läuft</h2>
                <p className="text-[#666666] text-sm">Bitte warten Sie einen Moment</p>
              </div>

              <div className="space-y-3">
                {loadingSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep - 1;
                  const isComplete = index < currentStep - 1;
                  
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0.3 }}
                      animate={{ 
                        opacity: isComplete || isActive ? 1 : 0.3,
                        scale: isActive ? 1.02 : 1
                      }}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        isActive ? 'bg-[#B7323F20] border border-[#B7323F40]' : 
                        isComplete ? 'bg-[#3B7C9E20] border border-[#3B7C9E40]' : 
                        'bg-[#0A0A0A] border border-transparent'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isComplete ? 'bg-[#3B7C9E]' : 
                        isActive ? 'bg-[#B7323F]' : 
                        'bg-[#1A1A1A]'
                      }`}>
                        {isComplete ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#666666]'}`} />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${isActive || isComplete ? 'text-white' : 'text-[#666666]'}`}>
                          {step.text}
                        </p>
                        <p className="text-[#666666] text-xs">{step.subtext}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3B7C9E] to-[#2D5F7A] flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-2">Erfolgreich analysiert!</h2>
              <p className="text-[#808080] text-sm mb-6">{extractedMarkers.length} Biomarker erkannt</p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-green-500/10 rounded-xl p-3 text-center">
                  <p className="text-green-400 font-bold text-xl">
                    {extractedMarkers.filter(m => m.status === 'optimal').length}
                  </p>
                  <p className="text-green-400/70 text-xs">Optimal</p>
                </div>
                <div className="bg-yellow-500/10 rounded-xl p-3 text-center">
                  <p className="text-yellow-400 font-bold text-xl">
                    {extractedMarkers.filter(m => m.status === 'suboptimal').length}
                  </p>
                  <p className="text-yellow-400/70 text-xs">Suboptimal</p>
                </div>
                <div className="bg-red-500/10 rounded-xl p-3 text-center">
                  <p className="text-red-400 font-bold text-xl">
                    {extractedMarkers.filter(m => ['low', 'high', 'critical'].includes(m.status)).length}
                  </p>
                  <p className="text-red-400/70 text-xs">Achtung</p>
                </div>
              </div>
              
              <div className="space-y-2 text-left max-h-40 overflow-y-auto">
                {extractedMarkers.slice(0, 5).map((marker, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#0A0A0A] rounded-lg p-3">
                    <span className="text-white text-sm">{marker.marker_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#808080] text-sm">{marker.value} {marker.unit}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        marker.status === 'optimal' ? 'bg-green-500/20 text-green-400' :
                        marker.status === 'suboptimal' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {marker.status}
                      </span>
                    </div>
                  </div>
                ))}
                {extractedMarkers.length > 5 && (
                  <p className="text-[#666666] text-xs text-center py-2">
                    +{extractedMarkers.length - 5} weitere Marker
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Blutbild hochladen</h2>
                <p className="text-[#808080] text-sm">
                  Lade dein Laborergebnis hoch und erhalte personalisierte Empfehlungen
                </p>
              </div>

              <label className="block">
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  file ? 'border-[#3B7C9E] bg-[#3B7C9E10]' : 'border-[#333333] hover:border-[#666666]'
                }`}>
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-[#3B7C9E]" />
                      <div className="text-left">
                        <p className="text-white text-sm font-medium">{file.name}</p>
                        <p className="text-[#666666] text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-[#666666] mx-auto mb-3" />
                      <p className="text-[#808080] text-sm">
                        Datei hier ablegen oder <span className="text-[#3B7C9E]">durchsuchen</span>
                      </p>
                      <p className="text-[#666666] text-xs mt-2">PDF, PNG, JPG bis 10MB</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                />
              </label>

              <div className="mt-4 p-3 rounded-xl bg-[#3B7C9E10] border border-[#3B7C9E30]">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-[#3B7C9E] shrink-0 mt-0.5" />
                  <p className="text-[#808080] text-xs">
                    Deine Daten werden mit unserer Datenbank von {markerReferences.length} Biomarkern 
                    abgeglichen für personalisierte Empfehlungen.
                  </p>
                </div>
              </div>

              <Button 
                className="w-full mt-6 bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 rounded-xl font-semibold disabled:opacity-50"
                disabled={!file}
                onClick={handleUpload}
              >
                Analyse starten
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}