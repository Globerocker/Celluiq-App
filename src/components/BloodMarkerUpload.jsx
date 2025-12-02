import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Upload, FileText, Check, AlertCircle, Dna, Search, FlaskConical, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const loadingSteps = [
  { icon: Upload, text: "Datei wird hochgeladen...", duration: 2000 },
  { icon: Search, text: "Dokument wird analysiert...", duration: 3000 },
  { icon: Dna, text: "Biomarker werden extrahiert...", duration: 4000 },
  { icon: FlaskConical, text: "Werte werden mit Datenbank abgeglichen...", duration: 3000 },
  { icon: Sparkles, text: "Empfehlungen werden generiert...", duration: 2000 }
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
    
    const min = reference.celluiq_range_min ?? reference.clinical_range_min;
    const max = reference.celluiq_range_max ?? reference.clinical_range_max;
    
    if (min == null || max == null) return 'suboptimal';
    
    if (value >= min && value <= max) return 'optimal';
    
    const range = max - min;
    const deviation = value < min ? min - value : value - max;
    
    if (deviation > range * 0.5) return 'critical';
    if (value < min) return 'low';
    if (value > max) return 'high';
    return 'suboptimal';
  };

  const simulateLoadingSteps = async () => {
    for (let i = 0; i < loadingSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, loadingSteps[i].duration));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setCurrentStep(0);
    
    // Start loading animation
    const loadingPromise = simulateLoadingSteps();
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const user = await base44.auth.me();
      const userGender = user?.gender || 'both';
      
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

      // Wait for loading animation to complete
      await loadingPromise;

      if (result.status === "success" && result.output?.markers) {
        const markers = result.output.markers;
        const today = new Date().toISOString().split('T')[0];
        
        const processedMarkers = markers.map(m => {
          const reference = findMatchingReference(m.marker_name, userGender);
          const status = determineStatus(m.value, reference);
          
          return {
            marker_name: m.marker_name,
            value: m.value,
            unit: m.unit || reference?.unit || '',
            optimal_min: reference?.celluiq_range_min ?? reference?.clinical_range_min ?? m.reference_min,
            optimal_max: reference?.celluiq_range_max ?? reference?.clinical_range_max ?? m.reference_max,
            test_date: today,
            status,
            category: reference?.category || 'other'
          };
        });

        setExtractedMarkers(processedMarkers);
        
        await base44.entities.BloodMarker.bulkCreate(processedMarkers);
        
        // Update last test date on user
        await base44.auth.updateMe({ last_blood_test: today });
        
        queryClient.invalidateQueries({ queryKey: ['bloodMarkers'] });
        setSuccess(true);
        
        setTimeout(() => {
          onClose();
          setFile(null);
          setSuccess(false);
          setExtractedMarkers([]);
          setCurrentStep(0);
        }, 4000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Fehler beim Verarbeiten. Bitte versuche es erneut.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const CurrentStepIcon = loadingSteps[currentStep]?.icon || Upload;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!uploading ? onClose : undefined} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-[var(--bg-secondary)] rounded-3xl p-6 max-w-md w-full border border-[var(--border-color)] shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {!uploading && !success && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
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
              className="py-12"
            >
              {/* Animated DNA Helix */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#B7323F]" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#3B7C9E]" />
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-4 rounded-full bg-[#3B7C9E]" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-4 h-4 rounded-full bg-[#B7323F]" />
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CurrentStepIcon className="w-8 h-8 text-[#B7323F]" />
                </div>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3 mb-6">
                {loadingSteps.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isActive = idx === currentStep;
                  const isComplete = idx < currentStep;
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0.3 }}
                      animate={{ 
                        opacity: isActive ? 1 : isComplete ? 0.6 : 0.3,
                        scale: isActive ? 1.02 : 1
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isActive ? 'bg-[#B7323F20]' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isComplete ? 'bg-green-500/20' : isActive ? 'bg-[#B7323F]' : 'bg-[var(--bg-tertiary)]'
                      }`}>
                        {isComplete ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <StepIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--text-tertiary)]'}`} />
                        )}
                      </div>
                      <span className={`text-sm ${isActive ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                        {step.text}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              <p className="text-center text-[var(--text-tertiary)] text-xs">
                Dies kann einen Moment dauern...
              </p>
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <Check className="w-10 h-10 text-green-400" />
                </motion.div>
              </div>
              
              <h2 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
                Analyse abgeschlossen!
              </h2>
              <p className="text-[var(--text-secondary)] text-center text-sm mb-6">
                {extractedMarkers.length} Biomarker erkannt
              </p>
              
              {/* Results Summary */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-green-500/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {extractedMarkers.filter(m => m.status === 'optimal').length}
                  </p>
                  <p className="text-xs text-green-400/80">Optimal</p>
                </div>
                <div className="bg-yellow-500/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-400">
                    {extractedMarkers.filter(m => m.status === 'suboptimal').length}
                  </p>
                  <p className="text-xs text-yellow-400/80">Suboptimal</p>
                </div>
                <div className="bg-red-500/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-400">
                    {extractedMarkers.filter(m => ['low', 'high', 'critical'].includes(m.status)).length}
                  </p>
                  <p className="text-xs text-red-400/80">Achtung</p>
                </div>
              </div>

              {/* Marker List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {extractedMarkers.slice(0, 8).map((marker, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between bg-[var(--bg-primary)] rounded-lg p-3"
                  >
                    <div>
                      <span className="text-[var(--text-primary)] text-sm font-medium">{marker.marker_name}</span>
                      <span className="text-[var(--text-tertiary)] text-xs ml-2">{marker.value} {marker.unit}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      marker.status === 'optimal' ? 'bg-green-500/20 text-green-400' :
                      marker.status === 'suboptimal' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {marker.status === 'optimal' ? 'Optimal' : 
                       marker.status === 'suboptimal' ? 'Suboptimal' : 
                       marker.status === 'low' ? 'Niedrig' :
                       marker.status === 'high' ? 'Hoch' : 'Kritisch'}
                    </span>
                  </motion.div>
                ))}
                {extractedMarkers.length > 8 && (
                  <p className="text-[var(--text-tertiary)] text-xs text-center py-2">
                    +{extractedMarkers.length - 8} weitere Marker
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
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Blutbild hochladen</h2>
                <p className="text-[var(--text-secondary)] text-sm">
                  Lade deine Laborergebnisse hoch für personalisierte Empfehlungen
                </p>
              </div>

              <label className="block">
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  file ? 'border-[#3B7C9E] bg-[#3B7C9E10]' : 'border-[var(--border-color)] hover:border-[var(--text-tertiary)]'
                }`}>
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-[#3B7C9E]" />
                      <div className="text-left">
                        <p className="text-[var(--text-primary)] text-sm font-medium">{file.name}</p>
                        <p className="text-[var(--text-tertiary)] text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3" />
                      <p className="text-[var(--text-secondary)] text-sm">
                        Datei hier ablegen oder <span className="text-[#3B7C9E]">durchsuchen</span>
                      </p>
                      <p className="text-[var(--text-tertiary)] text-xs mt-2">PDF, PNG, JPG bis 10MB</p>
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
                  <p className="text-[var(--text-secondary)] text-xs">
                    Deine Ergebnisse werden mit unserer Datenbank von {markerReferences.length} Biomarkern 
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