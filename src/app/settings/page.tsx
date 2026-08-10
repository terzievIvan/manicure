"use client";

import { useState, useEffect } from "react";
import { isIosStandalone } from "@/lib/isIosStandalone";
import { Bell, Info, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock function for saving subscription
const saveSubscriptionToSupabase = async (subscription: PushSubscription) => {
  console.log("Mock: Saving subscription to Supabase:", subscription);
  // Example RPC call:
  // await supabase.rpc('save_push_subscription', { subscription });
  return true;
};

// Mock function for removing subscription
const removeSubscriptionFromSupabase = async () => {
  console.log("Mock: Removing subscription from Supabase");
  // Example RPC call:
  // await supabase.rpc('remove_push_subscription');
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

  const handleEnableNotifications = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push-уведомления не поддерживаются в этом браузере.");
      return;
    }

    try {
      setIsSubscribing(true);
      
      // Request permission (must be triggered by user gesture)
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted") {
        const registration = await navigator.serviceWorker.ready;
        
        // Subscribe to push service
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: VAPID_PUBLIC_KEY,
        });

        // Save to DB
        await saveSubscriptionToSupabase(subscription);
        setIsSubscribed(true);
        alert("Уведомления успешно включены!");
      } else {
        alert("Вы отклонили запрос на уведомления.");
      }
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      alert("Произошла ошибка при настройке уведомлений.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDisableNotifications = async () => {
    try {
      setIsSubscribing(true);
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await removeSubscriptionFromSupabase();
      }
      setIsSubscribed(false);
      alert("Уведомления отключены.");
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      alert("Произошла ошибка при отключении уведомлений.");
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Настройки</h1>

      <div className="bg-card text-card-foreground p-5 rounded-3xl shadow-sm ring-1 ring-border/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-primary/10 rounded-2xl">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Уведомления</h2>
            <p className="text-sm text-muted-foreground">Напоминания о записях</p>
          </div>
        </div>

        {permission === "granted" && isSubscribed ? (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center text-sm font-medium">
              <Info className="w-5 h-5 mr-2 shrink-0" />
              Уведомления включены
            </div>
            <Button
              onClick={handleDisableNotifications}
              disabled={isSubscribing}
              variant="outline"
              className="w-full h-12 rounded-2xl text-base font-bold shadow-sm border-destructive/20 text-destructive hover:bg-destructive/10"
            >
              <BellOff className="w-4 h-4 mr-2" />
              {isSubscribing ? "Отключение..." : "Отключить уведомления"}
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            <Button
              onClick={handleEnableNotifications}
              disabled={!isStandalone || isSubscribing}
              className="w-full h-12 rounded-2xl text-base font-bold shadow-sm"
            >
              {isSubscribing ? "Включение..." : "Включить уведомления"}
            </Button>
            
            {!isStandalone && (
              <p className="text-xs text-muted-foreground mt-3 text-center flex items-center justify-center">
                <Info className="w-4 h-4 mr-1 shrink-0" />
                Для работы уведомлений добавьте приложение на экран "Домой" (Share &rarr; На экран "Домой")
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
