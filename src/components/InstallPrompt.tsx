"use client";

import { useEffect, useState } from "react";
import { X, Share } from "lucide-react";
import { Button } from "./ui/button";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // Default true to avoid flash
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Check if PWA is already installed (standalone mode)
    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-ignore
      window.navigator.standalone ||
      document.referrer.includes("android-app://");
    
    setIsStandalone(!!isInStandaloneMode);

    // Show prompt if iOS and not installed, and hasn't been dismissed recently
    if (isIOSDevice && !isInStandaloneMode) {
      const dismissed = localStorage.getItem("installPromptDismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    }
  }, []);

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Remember for 7 days
    localStorage.setItem("installPromptDismissed", "true");
    setTimeout(() => {
      localStorage.removeItem("installPromptDismissed");
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-primary text-primary-foreground p-4 rounded-xl shadow-xl z-50 flex flex-col gap-3 animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">Установить приложение</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20" onClick={dismissPrompt}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm opacity-90">
        Установите наше приложение для быстрого доступа. Нажмите кнопку «Поделиться» <Share className="inline h-4 w-4 mx-1" /> на панели ниже и выберите <strong>«На экран Домой»</strong>.
      </p>
    </div>
  );
}
