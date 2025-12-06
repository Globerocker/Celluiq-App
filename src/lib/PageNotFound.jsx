import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function PageNotFound() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-[#B7323F] mb-4">404</h1>
                    <h2 className="text-3xl font-bold mb-2">Seite nicht gefunden</h2>
                    <p className="text-gray-400">
                        Die Seite, die du suchst, existiert nicht oder wurde verschoben.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-[#B7323F] hover:bg-[#9A2835] rounded-xl font-semibold transition-colors"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Zur Startseite
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center px-6 py-3 bg-[#111111] hover:bg-[#222222] border border-[#333333] rounded-xl font-semibold transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Zurück
                    </button>
                </div>
            </div>
        </div>
    );
}