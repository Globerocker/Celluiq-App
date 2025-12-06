import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Upload, FileText, Check, Loader2, ArrowRight } from 'lucide-react';

export default function UploadBloodWork() {
    const { user, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFileUpload = async (file) => {
        if (!file) return;

        // Check if user is logged in
        if (!user) {
            // Save file info and redirect to login
            localStorage.setItem('pending_upload', file.name);
            await signInWithGoogle();
            return;
        }

        setUploadedFile(file);
        setIsUploading(true);

        try {
            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('blood-work')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Save to database
            const { error: dbError } = await supabase
                .from('blood_work')
                .insert({
                    user_id: user.id,
                    file_url: uploadData.path,
                    analysis_json: null // Will be populated by analysis service later
                });

            if (dbError) throw dbError;

            setUploadSuccess(true);

            // Redirect to dashboard after 1 second
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Fehler beim Hochladen: ' + error.message);
        }

        setIsUploading(false);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B7323F] to-[#8B1F2F] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#B7323F30]">
                        <Upload className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Blutbild hochladen</h1>
                    <p className="text-gray-400">
                        Lade dein Blutbild hoch für eine personalisierte Analyse
                    </p>
                </div>

                {!uploadedFile ? (
                    <div>
                        <input
                            type="file"
                            id="file-upload"
                            onChange={(e) => handleFileUpload(e.target.files?.[0])}
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden"
                        />
                        <label
                            htmlFor="file-upload"
                            className="block w-full p-8 rounded-2xl border-2 border-dashed border-[#333333] bg-[#111111] hover:border-[#B7323F] hover:bg-[#B7323F10] transition-all cursor-pointer group"
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-[#B7323F20] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8 text-[#B7323F]" />
                                </div>
                                <p className="text-white font-semibold mb-2">Datei auswählen</p>
                                <p className="text-gray-400 text-sm">PDF, PNG oder JPG</p>
                            </div>
                        </label>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-6 rounded-2xl bg-[#111111] border border-[#1A1A1A]">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${uploadSuccess ? 'bg-green-500/20' : isUploading ? 'bg-[#3B7C9E20]' : 'bg-[#1A1A1A]'
                                    }`}>
                                    {isUploading ? (
                                        <Loader2 className="w-6 h-6 text-[#3B7C9E] animate-spin" />
                                    ) : uploadSuccess ? (
                                        <Check className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <FileText className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium truncate">{uploadedFile.name}</p>
                                    <p className="text-gray-400 text-sm">
                                        {isUploading ? 'Wird hochgeladen...' : uploadSuccess ? 'Erfolgreich hochgeladen!' : 'Bereit'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {uploadSuccess && (
                            <Button
                                onClick={() => navigate('/dashboard')}
                                className="w-full bg-[#B7323F] hover:bg-[#9A2835] text-white py-6 rounded-xl"
                            >
                                Zum Dashboard
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                )}

                {!user && (
                    <div className="mt-6 p-4 bg-[#3B7C9E20] border border-[#3B7C9E30] rounded-xl">
                        <p className="text-sm text-gray-300 text-center">
                            Du musst dich anmelden, um dein Blutbild hochzuladen
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
