'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const dismissedKey = 'pwa-install-dismissed';
    const dismissed = sessionStorage.getItem(dismissedKey);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      if (!dismissed) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm p-4 bg-white rounded-lg shadow-lg border-2 border-[#9B8AAB] z-50">
      <h3 className="font-bold text-[#9B8AAB] mb-2">SalonRinkをインストール</h3>
      <p className="text-sm text-gray-700 mb-4">
        ホーム画面に追加してオフラインでも使用できます
      </p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={handleDismiss}
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
        >
          後で
        </button>
        <button
          onClick={handleInstall}
          className="px-4 py-2 text-sm bg-[#9B8AAB] text-white rounded hover:bg-[#8a7b9b]"
        >
          インストール
        </button>
      </div>
    </div>
  );
}
