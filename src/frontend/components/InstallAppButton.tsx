import React from 'react';
import { Download } from 'lucide-react';

const InstallAppButton: React.FC = () => {
    const handleInstall = (e: React.MouseEvent) => {
        e.preventDefault();
        // Logic for PWA install or App Store redirect
        alert("Install App feature triggered");
    };

    return (
        <button
            onClick={handleInstall}
            // Position calculation:
            // WhatsApp: bottom-6 (24px)
            // UnifiedChat: bottom-24 (96px) -> Delta ~72px
            // InstallApp: bottom-44 (176px) -> Delta ~80px (Safe stack)
            className="fixed bottom-44 right-6 z-50 transition-transform hover:scale-110 duration-200 group"
            title="Install App"
        >
            <div className="bg-blue-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white ring-4 ring-white/50 relative">
                <Download size={24} />
            </div>
            <div className="bg-white px-3 py-1.5 rounded-lg shadow-md border border-gray-100 text-xs font-bold text-gray-800 hidden group-hover:block absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap animate-in fade-in slide-in-from-right-2">
                Install App
            </div>
        </button>
    );
};

export default InstallAppButton;
