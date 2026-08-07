"use client";

import { useState, useEffect } from "react";
import { MOCK_APPOINTMENTS, MOCK_SERVICES } from "@/lib/supabase";
import { TrendingUp, CheckCircle2, DollarSign, Award, Calendar } from "lucide-react";

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Filter completed appointments
  const completedAppointments = MOCK_APPOINTMENTS.filter(a => a.status === "Завершен");

  // Helper to extract total revenue from appointment
  const calculateAppointmentPrice = (app: typeof MOCK_APPOINTMENTS[0]) => {
    // If appointment has serviceName with (X CHF)
    const match = app.serviceName.match(/\((\d+)\s*CHF\)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    // Fallback to service lookup
    const service = MOCK_SERVICES.find(s => s.id === app.serviceId);
    return service ? service.price : 85;
  };

  const totalRevenue = completedAppointments.reduce((sum, app) => sum + calculateAppointmentPrice(app), 0);
  const completedCount = completedAppointments.length;
  const pendingCount = MOCK_APPOINTMENTS.filter(a => a.status !== "Завершен").length;
  const avgCheck = completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0;

  return (
    <div className="flex flex-col h-full bg-background pt-safe pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 pt-4 pb-4 border-b">
        <h1 className="text-2xl font-bold">Аналитика и доходы</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Статистика по завершенным сеансам</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Карточка главного дохода */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-32 h-32" />
          </div>
          <p className="text-sm font-medium text-primary-foreground/80">Общий заработок</p>
          <p className="text-4xl font-extrabold mt-1">{totalRevenue} CHF</p>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold bg-background/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span>{completedCount} завершенных визитов</span>
          </div>
        </div>

        {/* Метрики в 2 колонки */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card text-card-foreground p-4 rounded-2xl border border-border/50 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Завершено</span>
            </div>
            <p className="text-2xl font-black mt-3">{completedCount} сеансов</p>
          </div>

          <div className="bg-card text-card-foreground p-4 rounded-2xl border border-border/50 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Award className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Средний чек</span>
            </div>
            <p className="text-2xl font-black mt-3">{avgCheck} CHF</p>
          </div>
        </div>

        {/* Список последних завершенных визитов */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            История сеансов ({completedAppointments.length})
          </h2>

          {completedAppointments.length > 0 ? (
            completedAppointments.map(app => {
              const price = calculateAppointmentPrice(app);
              return (
                <div key={app.id} className="bg-card text-card-foreground p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-base">{app.clientName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{app.serviceName}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{app.date} в {app.startTime}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">+{price} CHF</span>
                    <span className="block text-[10px] font-bold text-emerald-600/80 uppercase">Оплачено</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-2xl p-4">
              <p className="text-sm font-medium">Пока нет завершенных сеансов</p>
              <p className="text-xs mt-1">Нажмите "Сеанс завершен" в расписании, чтобы внести доход в статистику</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
