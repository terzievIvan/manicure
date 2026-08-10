"use client";

import { useState, useEffect, useMemo } from "react";
import { getAppointments, getServices, AppointmentItem, ServiceItem } from "@/lib/supabase";
import { TrendingUp, CheckCircle2, DollarSign, Award, Calendar, ChevronDown, Filter } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  useEffect(() => {
    setMounted(true);
    getAppointments().then(setAppointments);
    getServices().then(setServices);
  }, []);

  // Extract list of unique available months (yyyy-MM) from appointments data + current month
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    
    // Always include current month
    const currentMonthStr = format(new Date(), "yyyy-MM");
    monthsSet.add(currentMonthStr);

    appointments.forEach((app) => {
      if (app.date && app.date.length >= 7) {
        monthsSet.add(app.date.substring(0, 7));
      }
    });

    // Sort descending (latest month first)
    return Array.from(monthsSet).sort().reverse();
  }, [appointments]);

  if (!mounted) return null;

  // Filter appointments by selected month
  const filteredAppointments = selectedMonth === "all" 
    ? appointments 
    : appointments.filter(a => a.date && a.date.startsWith(selectedMonth));

  // Filter completed appointments within the selected month
  const completedAppointments = filteredAppointments.filter(a => a.status === "Завершен");

  // Helper to extract total revenue from appointment
  const calculateAppointmentPrice = (app: AppointmentItem) => {
    const match = app.serviceName.match(/\((\d+)\s*CHF\)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    const service = services.find(s => s.id === app.serviceId);
    return service ? service.price : 85;
  };

  const totalRevenue = completedAppointments.reduce((sum, app) => sum + calculateAppointmentPrice(app), 0);
  const completedCount = completedAppointments.length;
  const avgCheck = completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0;

  const formatMonthLabel = (monthKey: string) => {
    if (monthKey === "all") return "За все время";
    try {
      const [year, month] = monthKey.split("-");
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      const formatted = format(date, "LLLL yyyy", { locale: ru });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return monthKey;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background pt-safe pb-24">
      {/* Sticky Header with Month Filter */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 pt-4 pb-4 border-b flex justify-between items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold">Аналитика</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Статистика доходов</p>
        </div>

        {/* Month Selector */}
        <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val || "all")}>
          <SelectTrigger className="w-[160px] h-10 rounded-xl text-xs font-semibold bg-card border-border/80 px-3 shadow-xs">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-primary shrink-0" />
            <SelectValue>{formatMonthLabel(selectedMonth)}</SelectValue>
          </SelectTrigger>
          <SelectContent className="p-1 rounded-2xl bg-card border border-border/80 shadow-xl z-50">
            <SelectItem value="all" className="text-xs font-semibold py-2.5 px-3 rounded-xl cursor-pointer">
              За все время
            </SelectItem>
            {availableMonths.map((m) => (
              <SelectItem key={m} value={m} className="text-xs font-semibold py-2.5 px-3 rounded-xl cursor-pointer">
                {formatMonthLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="p-4 space-y-6">
        {/* Main Revenue Card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/75">
                Заработок ({formatMonthLabel(selectedMonth).toLowerCase()})
              </p>
              <p className="text-4xl font-extrabold mt-1">{totalRevenue} CHF</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold bg-background/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span>{completedCount} завершенных визитов</span>
          </div>
        </div>

        {/* Metrics in 2 columns */}
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

        {/* List of completed visits for the selected month */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>История сеансов ({completedAppointments.length})</span>
            </div>
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
              <p className="text-sm font-medium">Нет завершенных сеансов {selectedMonth !== "all" ? "за выбранный месяц" : ""}</p>
              <p className="text-xs mt-1">Отмечайте сеансы завершенными в расписании, чтобы они учитывались в статистике</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
