"use client";

import { useState, useEffect } from "react";
import { isIosStandalone } from "@/lib/isIosStandalone";
import { Bell, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Mock function for saving subscription
const saveSubscriptionToSupabase = async (subscription: PushSubscription) => {
  console.log("Mock: Saving subscription to Supabase:", subscription);
  return true;
};

// Mock function for removing subscription
const removeSubscriptionFromSupabase = async () => {
  console.log("Mock: Removing subscription from Supabase");
  return true;
};

// Generated VAPID public key for Web Push
const VAPID_PUBLIC_KEY = "BDLYQIuqjjuNlz5pxM0jFVC3toC1iyZacP5dG7m873y6WUj__EL9NNGNgU-RdGTJ_f9H_A8HFwTe_1uGego1bII";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsStandalone(isIosStandalone());
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    
    // Check if we already have an active subscription
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setIsSubscribed(subscription !== null);
        });
      });
    }
  }, []);

  const handleToggleNotifications = async (checked: boolean) => {
    if (checked) {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        alert("Push-уведомления не поддерживаются в этом браузере.");
        return;
      }

      try {
        setIsSubscribing(true);
        const perm = await Notification.requestPermission();
        setPermission(perm);

        if (perm === "granted") {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: VAPID_PUBLIC_KEY,
          });

          await saveSubscriptionToSupabase(subscription);
          setIsSubscribed(true);
        } else {
          alert("Вы отклонили запрос на доступ к уведомлениям.");
          setIsSubscribed(false);
        }
      } catch (error) {
        console.error("Error subscribing to push notifications:", error);
        alert("Произошла ошибка при включении уведомлений.");
        setIsSubscribed(false);
      } finally {
        setIsSubscribing(false);
      }
    } else {
      try {
        setIsSubscribing(true);
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          await removeSubscriptionFromSupabase();
        }
        setIsSubscribed(false);
      } catch (error) {
        console.error("Error unsubscribing from push notifications:", error);
        alert("Произошла ошибка при отключении уведомлений.");
      } finally {
        setIsSubscribing(false);
      }
    }
  };

  if (!mounted) return null;

  const isEnabled = permission === "granted" && isSubscribed;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Настройки</h1>

      <div className="bg-card text-card-foreground p-5 rounded-3xl shadow-sm ring-1 ring-border/50 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl shrink-0">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold">Push-уведомления</h2>
              <p className="text-xs text-muted-foreground">Напоминания о клиентах и записях</p>
            </div>
          </div>

          <Switch
            checked={isEnabled}
            disabled={!isStandalone || isSubscribing}
            onCheckedChange={handleToggleNotifications}
          />
        </div>

        {!isStandalone && (
          <p className="text-xs text-muted-foreground pt-2 border-t border-border/40 flex items-center">
            <Info className="w-4 h-4 mr-1.5 shrink-0 text-amber-500" />
            Для включения добавьте приложение на экран "Домой" (Поделиться &rarr; На экран "Домой")
          </p>
        )}
      </div>
    </div>
  );
}
