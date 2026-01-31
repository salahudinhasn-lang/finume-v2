import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const InstallAppButton: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    // Default to true so user can see the button immediately. 
    // In a strict production PWA, this might start as false, but for user verification we show it.
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert("App installation is not available yet. Please ensure you are viewing this in a supported browser/environment or the app is already installed.");
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        // We've used the prompt, and can't use it again, discard it
        setDeferredPrompt(null);
        // Optional: Hide button after install? 
        // setIsVisible(false); 
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={handleInstallClick}
            // Positioned above UnifiedChat (bottom-24) -> roughly bottom-44 (11rem = 176px)
            // WhatsApp: bottom-6
            // UnifiedChat: bottom-24
            // This: bottom-44
            className="fixed bottom-44 right-6 z-[55] transition-transform hover:scale-110 duration-200 group"
            title="Install App"
        >
            <div className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white ring-4 ring-white/50 relative ${deferredPrompt ? 'bg-blue-600' : 'bg-gray-400'}`}>
                <Download size={24} />
            </div>
            <div className="bg-white px-3 py-1.5 rounded-lg shadow-md border border-gray-100 text-xs font-bold text-gray-800 hidden group-hover:block absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap animate-in fade-in slide-in-from-right-2">
                {deferredPrompt ? 'Install App' : 'Install Unavailable'}
            </div>
        </button>
    );
};

export default InstallAppButton;
