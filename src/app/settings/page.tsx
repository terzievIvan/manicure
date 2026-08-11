"use client";

import { useState, useEffect } from "react";
import { isIosStandalone } from "@/lib/isIosStandalone";
import { useTheme } from "next-themes";
import { Bell, Info, Moon, Sun, Palette, UserCircle, LogOut, Coins } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { useTranslation } from "@/components/I18nProvider";
import { SupportedLanguage } from "@/lib/i18n/translations";
import { Button } from "@/components/ui/button";

// Mock function for saving subscription
const saveSubscriptionToSupabase = async (subscription: PushSubscription) => {
  console.log("Mock: Saving subscription to Supabase:", subscription);
  // Example RPC call:
  // await supabase.rpc('save_push_subscription', { subscription });
  return true;
};

// Generated VAPID public key for Web Push
const VAPID_PUBLIC_KEY = "BDLYQIuqjjuNlz5pxM0jFVC3toC1iyZacP5dG7m873y6WUj__EL9NNGNgU-RdGTJ_f9H_A8HFwTe_1uGego1bII";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage, t } = useTranslation();

  useEffect(() => {
    setMounted(true);
    setIsStandalone(isIosStandalone());
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications are not supported in this browser.");
      return;
    }

    try {
      setIsSubscribing(true);
      
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted") {
        const registration = await navigator.serviceWorker.ready;
        
        const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });

        await saveSubscriptionToSupabase(subscription);
        alert(t("settings.notifications_enabled"));
      } else {
        alert("Permission denied");
      }
    } catch (error: any) {
      console.error("Error subscribing to push notifications:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!("serviceWorker" in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("Запись через 1 час 💅", {
        body: "Анна Смирнова — Маникюр с покрытием (15:00)",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        data: { url: "/" },
      });
    } catch (e) {
      console.error("Test notification error:", e);
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">{t("settings.title")}</h1>

      <div className="bg-card text-card-foreground p-5 rounded-3xl shadow-sm ring-1 ring-border/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-primary/10 rounded-2xl">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("settings.notifications")}</h2>
            <p className="text-sm text-muted-foreground">{t("settings.notifications_desc")}</p>
          </div>
        </div>

        {permission === "granted" ? (
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center text-sm font-medium">
              <Info className="w-5 h-5 mr-2 shrink-0" />
              {t("settings.notifications_enabled")}
            </div>
            <Button
              onClick={handleSendTestNotification}
              variant="outline"
              className="w-full h-11 rounded-2xl text-sm font-semibold border-primary/20 text-primary hover:bg-primary/5"
            >
              🚀 {t("settings.test_notification")}
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            <Button
              onClick={handleEnableNotifications}
              disabled={!isStandalone || isSubscribing}
              className="w-full h-12 rounded-2xl text-base font-bold shadow-sm"
            >
              {isSubscribing ? "..." : t("settings.enable_notifications")}
            </Button>
            
            {!isStandalone && (
              <p className="text-xs text-muted-foreground mt-3 text-center flex items-center justify-center">
                <Info className="w-4 h-4 mr-1 shrink-0" />
                {t("settings.pwa_hint")}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-card text-card-foreground p-5 rounded-3xl shadow-sm ring-1 ring-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-primary/10 rounded-2xl">
            <Palette className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("settings.theme")}</h2>
            <p className="text-sm text-muted-foreground">{t("settings.theme_desc")}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/50'}`}
          >
            <Sun className={`w-6 h-6 mb-2 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs font-semibold ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`}>{t("settings.theme_light")}</span>
          </button>
          
          <button 
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/50'}`}
          >
            <Moon className={`w-6 h-6 mb-2 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`}>{t("settings.theme_dark")}</span>
          </button>

          <button 
            onClick={() => setTheme('pink')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${theme === 'pink' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/50'}`}
          >
            <div className={`w-6 h-6 rounded-full mb-2 ${theme === 'pink' ? 'bg-primary' : 'bg-muted-foreground/30'}`} style={theme !== 'pink' ? { backgroundColor: '#f472b6' } : {}} />
            <span className={`text-xs font-semibold ${theme === 'pink' ? 'text-primary' : 'text-muted-foreground'}`}>{t("settings.theme_pink")}</span>
          </button>
        </div>
      </div>

      <div className="bg-card text-card-foreground p-5 rounded-3xl shadow-sm ring-1 ring-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-primary/10 rounded-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("settings.language")}</h2>
            <p className="text-sm text-muted-foreground">{t("settings.language_desc")}</p>
          </div>
        </div>
        
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
          className="w-full h-12 px-4 rounded-2xl border-2 border-border bg-background text-base font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
        >
          <option value="uk">Українська (UK)</option>
          <option value="en">English (EN)</option>
          <option value="de">Deutsch (DE)</option>
          <option value="fr">Français (FR)</option>
          <option value="ru">Русский (RU)</option>
        </select>
      </div>

      <div className="bg-card text-card-foreground p-5 rounded-3xl shadow-sm ring-1 ring-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-primary/10 rounded-2xl">
            <Coins className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("settings.currency")}</h2>
            <p className="text-sm text-muted-foreground">{t("settings.currency_desc")}</p>
          </div>
        </div>
        
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as any)}
          className="w-full h-12 px-4 rounded-2xl border-2 border-border bg-background text-base font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
        >
          <option value="EUR">{t("currency.eur")} (EUR)</option>
          <option value="USD">{t("currency.usd")} (USD)</option>
          <option value="UAH">{t("currency.uah")} (UAH)</option>
        </select>
      </div>

      <div className="bg-card text-card-foreground p-5 rounded-3xl shadow-sm ring-1 ring-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-primary/10 rounded-2xl">
            <UserCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("settings.account")}</h2>
            <p className="text-sm text-muted-foreground">{user?.email || t("settings.not_authorized")}</p>
          </div>
        </div>
        
        <Button 
          variant="destructive"
          onClick={signOut}
          className="w-full h-12 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          {t("settings.logout")}
        </Button>
      </div>
    </div>
  );
}
