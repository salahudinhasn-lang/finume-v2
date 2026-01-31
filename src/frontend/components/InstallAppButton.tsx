import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallAppButton: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            alert("To install the app, tap 'Share' then 'Add to Home Screen' (iOS) or use your browser menu (Android/Desktop).");
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    // Always show for demo purposes if desired, or strictly follow logic.
    // User seems to want it VISIBLE always based on requests. 
    // I will make it visible by default but handle the logic gracefully.

    return (
        <button
            onClick={handleInstall}
            // Stack Order:
            // WhatsApp: bottom-6 (24px)
            // UnifiedChat: bottom-24 (96px)
            // InstallApp: bottom-44 (176px) -> Stacks purely vertically on the right
            className="fixed bottom-44 right-6 z-[50] transition-transform hover:scale-110 duration-200 group"
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
