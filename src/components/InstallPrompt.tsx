"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        );

        setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Optional: Auto-show button when prompt is ready
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
            }
        } else {
            // Fallback for iOS or if prompt unavailable (manual instructions)
            setShowInstructions(true);
        }
    };

    if (isStandalone) return null;

    return (
        <>
            <button
                onClick={handleInstallClick}
                className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all font-medium animate-in fade-in slide-in-from-bottom-4 group"
            >
                <Download className="w-5 h-5 group-hover:animate-bounce" />
                Install App
            </button>

            {/* Instructions Modal */}
            {showInstructions && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Install Finume</h3>
                            <button onClick={() => setShowInstructions(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {isIOS ? (
                            <div className="space-y-4">
                                <p className="text-gray-600 text-sm">To install on iOS:</p>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 font-medium">
                                    <li className="flex items-center gap-2">Tap the <span className="inline-flex"><ShareIcon /></span> Share button below</li>
                                    <li>Scroll down and select <span className="font-bold">Add to Home Screen</span></li>
                                </ol>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-gray-600 text-sm">To install on this device:</p>
                                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 font-medium">
                                    <li>Tap the browser menu (three dots)</li>
                                    <li>Select <span className="font-bold">Install App</span> or <span className="font-bold">Add to Home Screen</span></li>
                                </ul>
                            </div>
                        )}

                        <button onClick={() => setShowInstructions(false)} className="w-full py-3 bg-gray-100 font-bold rounded-xl text-gray-900 hover:bg-gray-200">Got it</button>
                    </div>
                </div>
            )}
        </>
    );
}

function ShareIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
    )
}
