import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Upload, FileText, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function BloodMarkerUpload({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [extractedMarkers, setExtractedMarkers] = useState([]);
  const queryClient = useQueryClient();

  // Fetch reference data for matching
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
    if (!reference) return 'other';
    
    const celluiqMin = reference.celluiq_range_min;
    const celluiqMax = reference.celluiq_range_max;
    const clinicalMin = reference.clinical_range_min;
    const clinicalMax = reference.clinical_range_max;
    
    // Use CELLUIQ ranges if available, otherwise clinical
    const min = celluiqMin ?? clinicalMin;
    const max = celluiqMax ?? clinicalMax;
    
    if (min == null || max == null) return 'suboptimal';
    
    if (value >= min && value <= max) return 'optimal';
    
    const range = max - min;
    const deviation = value < min ? min - value : value - max;
    
    if (deviation > range * 0.5) return 'critical';
    if (deviation > range * 0.2) return 'high';
    return 'suboptimal';
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    
    try {
      // Upload the file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Get user gender for gender-specific references
      const user = await base44.auth.me();
      const userGender = user?.gender || 'both';
      
      // Extract data from the uploaded file
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

      if (result.status === "success" && result.output?.markers) {
        const markers = result.output.markers;
        const today = new Date().toISOString().split('T')[0];
        
        // Match with reference data and determine status
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
        
        // Bulk create the markers
        await base44.entities.BloodMarker.bulkCreate(processedMarkers);
        
        queryClient.invalidateQueries({ queryKey: ['bloodMarkers'] });
        setSuccess(true);
        
        setTimeout(() => {
          onClose();
          setFile(null);
          setSuccess(false);
          setExtractedMarkers([]);
        }, 3000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#111111] rounded-3xl p-6 max-w-md w-full border border-[#1A1A1A] shadow-2xl max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#666666] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Upload Blood Results</h2>
          <p className="text-[#808080] text-sm">
            Upload your lab results and we'll match them with our database
          </p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#3B7C9E20] flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[#3B7C9E]" />
            </div>
            <p className="text-white font-semibold mb-2">Successfully uploaded!</p>
            <p className="text-[#666666] text-sm mb-4">{extractedMarkers.length} markers extracted</p>
            
            <div className="space-y-2 text-left max-h-40 overflow-y-auto">
              {extractedMarkers.slice(0, 5).map((marker, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#0A0A0A] rounded-lg p-3">
                  <span className="text-white text-sm">{marker.marker_name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    marker.status === 'optimal' ? 'bg-green-500/20 text-green-400' :
                    marker.status === 'suboptimal' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {marker.status}
                  </span>
                </div>
              ))}
              {extractedMarkers.length > 5 && (
                <p className="text-[#666666] text-xs text-center">
                  +{extractedMarkers.length - 5} more markers
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
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
                      Drop your file here or <span className="text-[#3B7C9E]">browse</span>
                    </p>
                    <p className="text-[#666666] text-xs mt-2">PDF, PNG, JPG up to 10MB</p>
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
                  Your results will be matched with our database of {markerReferences.length} biomarkers 
                  for personalized recommendations.
                </p>
              </div>
            </div>

            <Button 
              className="w-full mt-6 bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 rounded-xl font-semibold disabled:opacity-50"
              disabled={!file || uploading}
              onClick={handleUpload}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Results'
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}