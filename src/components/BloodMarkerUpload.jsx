import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Upload, FileText, Loader2, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function BloodMarkerUpload({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    
    try {
      // Upload the file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Extract data from the uploaded file
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              marker_name: { type: "string" },
              value: { type: "number" },
              unit: { type: "string" },
              optimal_min: { type: "number" },
              optimal_max: { type: "number" }
            }
          }
        }
      });

      if (result.status === "success" && result.output) {
        const markers = Array.isArray(result.output) ? result.output : [result.output];
        const today = new Date().toISOString().split('T')[0];
        
        // Determine status for each marker
        const markersWithStatus = markers.map(m => {
          let status = 'optimal';
          if (m.optimal_min && m.optimal_max) {
            if (m.value < m.optimal_min || m.value > m.optimal_max) {
              const diff = m.value < m.optimal_min 
                ? m.optimal_min - m.value 
                : m.value - m.optimal_max;
              const range = m.optimal_max - m.optimal_min;
              status = diff > range * 0.3 ? 'critical' : 'suboptimal';
            }
          }
          return {
            ...m,
            test_date: today,
            status,
            category: 'other'
          };
        });

        // Bulk create the markers
        await base44.entities.BloodMarker.bulkCreate(markersWithStatus);
        
        queryClient.invalidateQueries({ queryKey: ['bloodMarkers'] });
        setSuccess(true);
        
        setTimeout(() => {
          onClose();
          setFile(null);
          setSuccess(false);
        }, 2000);
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
      
      <div className="relative bg-[#111111] rounded-3xl p-6 max-w-sm w-full border border-[#1A1A1A] shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#666666] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Upload Blood Results</h2>
          <p className="text-[#808080] text-sm">
            Upload your lab results (PDF or image) and we'll extract your biomarkers
          </p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[#3B7C9E20] flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[#3B7C9E]" />
            </div>
            <p className="text-white font-semibold">Successfully uploaded!</p>
            <p className="text-[#666666] text-sm mt-2">Your markers have been added</p>
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

            <Button 
              className="w-full mt-6 bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 rounded-xl font-semibold disabled:opacity-50"
              disabled={!file || uploading}
              onClick={handleUpload}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
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