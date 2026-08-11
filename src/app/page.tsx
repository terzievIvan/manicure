"use client";

import { useState, useEffect } from "react";
import { Plus, CalendarDays, Trash2, User, Clock, Sparkles, FileText, Calendar as CalendarIcon, Check, CheckCircle2, PlayCircle, ChevronDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getAppointments, 
  saveAppointment, 
  updateAppointmentStatus, 
  deleteAppointment, 
  getClients, 
  getServices, 
  AppointmentItem, 
  ClientItem, 
  ServiceItem 
} from "@/lib/supabase";
import { format, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { ServiceIcon } from "@/components/ServiceIcon";
import { useAppBadge } from "@/hooks/useAppBadge";
import { useCurrency } from "@/components/CurrencyProvider";

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [mounted, setMounted] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [clientsList, setClientsList] = useState<ClientItem[]>([]);
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const { currency } = useCurrency();

  // Badging API hook
  useAppBadge(appointments);

  // Form & Edit state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [newClientId, setNewClientId] = useState("");
  const [newServiceIds, setNewServiceIds] = useState<string[]>([]);
  const [newDate, setNewDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [newTime, setNewTime] = useState("10:00");
  const [newNotes, setNewNotes] = useState("");

  const refreshData = async () => {
    const [apps, cls, srvs] = await Promise.all([
      getAppointments(),
      getClients(),
      getServices(),
    ]);
    setAppointments(apps);
    setClientsList(cls);
    setServicesList(srvs);
  };

  useEffect(() => {
    setMounted(true);
    refreshData();
  }, []);

  // Dynamic status calculator (В ожидании / В работе / Завершен)
  const getAppointmentStatus = (app: AppointmentItem) => {
    if (app.status === "Завершен") return "Завершен";

    const now = new Date();
    const currentDateStr = format(now, "yyyy-MM-dd");

    if (app.date < currentDateStr) {
      return "В работе";
    } else if (app.date === currentDateStr) {
      const [hours, minutes] = app.startTime.split(":").map(Number);
      const appStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      if (now >= appStartTime) {
        return "В работе";
      }
    }

    return "В ожидании";
  };

  // Update newDate when selectedDate changes (only if sheet is not open)
  useEffect(() => {
    if (!isSheetOpen && !editingAppointmentId) {
      setNewDate(format(selectedDate, "yyyy-MM-dd"));
    }
  }, [selectedDate, isSheetOpen, editingAppointmentId]);

  // Generate 7 days for the slider
  const days = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  if (!mounted) return null;

  const appointmentsForDate = appointments.filter(
    (app) => app.date === format(selectedDate, "yyyy-MM-dd")
  );

  const handleOpenNewAppointment = () => {
    setEditingAppointmentId(null);
    setNewClientId("");
    setNewServiceIds([]);
    setNewDate(format(selectedDate, "yyyy-MM-dd"));
    setNewTime("10:00");
    setNewNotes("");
    setIsServicesDropdownOpen(false);
    setIsSheetOpen(true);
  };

  const handleEditClick = (app: AppointmentItem) => {
    setEditingAppointmentId(app.id);
    setNewClientId(app.clientId);
    setNewServiceIds(app.serviceIds || (app.serviceId ? [app.serviceId] : []));
    setNewDate(app.date);
    setNewTime(app.startTime);
    setNewNotes(app.notes || "");
    setIsServicesDropdownOpen(false);
    setIsSheetOpen(true);
  };

  const handleToggleService = (serviceId: string) => {
    if (newServiceIds.includes(serviceId)) {
      setNewServiceIds(newServiceIds.filter(id => id !== serviceId));
    } else {
      setNewServiceIds([...newServiceIds, serviceId]);
    }
  };

  const handleCompleteSession = async (id: string) => {
    await updateAppointmentStatus(id, "Завершен");
    await refreshData();
  };

  const handleSaveAppointment = async () => {
    if (!newClientId || newServiceIds.length === 0 || !newDate || !newTime) return;

    const client = clientsList.find(c => c.id === newClientId);
    const selectedServices = servicesList.filter(s => newServiceIds.includes(s.id));
    if (!client || selectedServices.length === 0) return;

    const serviceName = selectedServices.map(s => s.name).join(", ");
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = selectedServices.reduce((sum, s) => sum + (s.duration || 60), 0);

    const [hours, minutes] = newTime.split(":").map(Number);
    const startDate = new Date(0, 0, 0, hours, minutes);
    const endDate = new Date(startDate.getTime() + totalDuration * 60000);
    const endTime = endDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    const targetId = editingAppointmentId || Math.random().toString(36).substring(7);

    const newAppointment: AppointmentItem = {
      id: targetId,
      clientId: client.id,
      clientName: client.name,
      serviceId: newServiceIds[0],
      serviceIds: newServiceIds,
      serviceName: `${serviceName} (${totalPrice} ${currency})`,
      date: newDate,
      startTime: newTime,
      endTime: endTime,
      status: editingAppointmentId ? (appointments.find(a => a.id === editingAppointmentId)?.status || 'Ожидает') : 'Ожидает',
      notes: newNotes,
    };

    await saveAppointment(newAppointment);
    await refreshData();
    setIsSheetOpen(false);
  };

  const handleDeleteAppointment = async () => {
    if (!editingAppointmentId) return;
    await deleteAppointment(editingAppointmentId);
    await refreshData();
    setIsSheetOpen(false);
  };

  const selectedServicesList = servicesList.filter(s => newServiceIds.includes(s.id));
  const totalPrice = newServiceIds.reduce((sum, id) => sum + (servicesList.find(s => s.id === id)?.price || 0), 0);
  const totalDuration = newServiceIds.reduce((sum, id) => sum + (servicesList.find(s => s.id === id)?.duration || 60), 0);
  const currentEditingApp = appointments.find(a => a.id === editingAppointmentId);

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}ч ${m}мин`;
    if (h > 0) return `${h}ч`;
    return `${m}мин`;
  };

  return (
    <div className="flex flex-col h-full bg-background pt-safe">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 pt-4 pb-2 border-b">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Расписание</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setViewMode(viewMode === "week" ? "month" : "week")}
          >
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
        
        {viewMode === "week" ? (
          <div className="grid grid-cols-7 gap-1 pb-2">
            {days.map((day) => {
              const isSelected = day.toDateString() === selectedDate.toDateString();
              const dateStr = format(day, "yyyy-MM-dd");
              const appCount = appointments.filter(app => app.date === dateStr).length;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`relative flex flex-col items-center justify-center py-1.5 h-18 rounded-xl transition-all p-1 leading-none ${
                    isSelected 
                      ? "bg-primary text-primary-foreground shadow-md font-bold" 
                      : appCount > 0 
                        ? "bg-primary/20 text-primary hover:bg-primary/30 border-2 border-primary/40" 
                        : "bg-secondary/70 text-muted-foreground hover:bg-secondary border border-border/60"
                  }`}
                >
                  <span className={`text-[10px] font-semibold uppercase mb-0.5 ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                    {format(day, "EEEEEE", { locale: ru })}
                  </span>
                  <span className={`text-sm font-bold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                    {format(day, "d")}
                  </span>
                  {appCount > 0 ? (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full mt-1 leading-none shadow-sm z-30 ${
                      isSelected 
                        ? "bg-amber-400 text-slate-950 font-black" 
                        : "bg-primary text-primary-foreground"
                    }`}>
                      {appCount}
                    </span>
                  ) : (
                    <span className="h-3" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex justify-center pb-2 px-1 max-w-full overflow-hidden">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) setSelectedDate(date);
              }}
              locale={ru}
              className="rounded-2xl border bg-card text-card-foreground shadow-sm w-full p-2 sm:p-3 [--cell-size:2.6rem] sm:[--cell-size:3.3rem] max-w-full"
              components={{
                DayButton: ({ day, modifiers, ...props }) => {
                  const dateStr = format(day.date, "yyyy-MM-dd");
                  const count = appointments.filter(a => a.date === dateStr).length;
                  const isSelected = modifiers.selected;

                  return (
                    <CalendarDayButton 
                      day={day} 
                      modifiers={modifiers} 
                      {...props} 
                      className={`!relative !flex !flex-col !items-center !justify-center !h-full !w-full !rounded-xl !transition-all !p-1 !leading-none ${
                        isSelected 
                          ? "!bg-primary !text-primary-foreground !shadow-md font-bold" 
                          : count > 0 
                            ? "!bg-primary/20 !text-primary hover:!bg-primary/30 !border-2 !border-primary/40" 
                            : "!bg-secondary/70 !text-muted-foreground hover:!bg-secondary border border-border/60"
                      }`}
                    >
                      <div className={`text-sm font-bold ${isSelected ? "!text-primary-foreground" : "text-foreground"}`}>
                        {day.date.getDate()}
                      </div>
                      {count > 0 ? (
                        <div className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full mt-1 leading-none shadow-sm z-30 ${
                          isSelected 
                            ? "!bg-amber-400 !text-slate-950 font-black" 
                            : "!bg-primary !text-primary-foreground"
                        }`}>
                          {count}
                        </div>
                      ) : (
                        <div className="h-3" />
                      )}
                    </CalendarDayButton>
                  );
                }
              }}
            />
          </div>
        )}
      </div>

      <div className="p-4 space-y-4 pb-24">
        {appointmentsForDate.length > 0 ? (
          appointmentsForDate.map((app) => {
            const calculatedStatus = getAppointmentStatus(app);
            const isCompleted = calculatedStatus === "Завершен";
            const isInProgress = calculatedStatus === "В работе";

            return (
              <div 
                key={app.id} 
                onClick={() => handleEditClick(app)}
                className={`bg-card text-card-foreground p-4 rounded-2xl shadow-sm ring-1 transition-all cursor-pointer ${
                  isCompleted 
                    ? "ring-emerald-500/40 bg-emerald-500/5" 
                    : isInProgress 
                      ? "ring-blue-500/50 bg-blue-500/5" 
                      : "ring-border/50 hover:bg-muted/50"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg">{app.startTime} - {app.endTime}</span>
                  {isCompleted ? (
                    <span className="inline-flex items-center text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                      Завершен
                    </span>
                  ) : isInProgress ? (
                    <span className="inline-flex items-center text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2.5 py-1 rounded-full animate-pulse">
                      <PlayCircle className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                      В работе
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-amber-400" />
                      В ожидании
                    </span>
                  )}
                </div>
                <p className="font-medium text-lg">{app.clientName}</p>
                <p className="text-muted-foreground text-base mt-1">{app.serviceName}</p>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
            <p className="text-lg font-medium">Нет записей</p>
            <p className="text-sm">На этот день пока ничего не запланировано.</p>
          </div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger 
          onClick={handleOpenNewAppointment}
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg shrink-0 z-40 bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl flex flex-col pt-6">
          <SheetHeader className="mb-4 flex flex-row items-center justify-between border-b pb-3">
            <SheetTitle className="text-left text-2xl font-bold">
              {editingAppointmentId ? "Редактировать запись" : "Новая запись"}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-6 px-1 pb-6">
            {editingAppointmentId && currentEditingApp && currentEditingApp.status !== "Завершен" && (
              <Button
                type="button"
                onClick={() => {
                  handleCompleteSession(editingAppointmentId);
                  setIsSheetOpen(false);
                }}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-base font-bold shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Отметить сеанс как завершенный
              </Button>
            )}

            {/* Выпадающий список клиентов */}
            <div className="space-y-2">
              <Label htmlFor="client" className="flex items-center text-base font-semibold">
                <User className="h-5 w-5 text-primary mr-2" />
                Клиент
              </Label>
              <Select value={newClientId} onValueChange={(val) => setNewClientId(val || "")}>
                <SelectTrigger id="client" className="w-full h-15 rounded-2xl text-base font-semibold bg-card hover:bg-muted/30 border border-border/80 px-4 shadow-xs transition-all text-foreground">
                  <SelectValue>
                    {clientsList.find(c => c.id === newClientId)?.name || "Выберите клиента..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="p-2 max-h-[350px] rounded-2xl w-[var(--radix-select-trigger-width)] min-w-[320px] shadow-2xl bg-card border border-border/80 backdrop-blur-xl">
                  {clientsList.map(c => (
                    <SelectItem 
                      key={c.id} 
                      value={c.id} 
                      className="text-base py-3.5 px-3 font-medium rounded-xl my-1 border-b border-border/10 last:border-0 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors"
                    >
                      <div className="flex justify-between items-center w-full gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {c.name.substring(0, 1)}
                          </div>
                          <span className="font-semibold text-base text-foreground">{c.name}</span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3 text-muted-foreground/70" />
                          {c.phone}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Дата и Время */}
            <div className="flex gap-3 w-full">
              <div className="flex-1 space-y-2 min-w-0">
                <Label htmlFor="date" className="flex items-center text-base font-semibold">
                  <CalendarIcon className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span className="truncate">Дата</span>
                </Label>
                <Input 
                  type="date" 
                  id="date" 
                  className="h-14 rounded-2xl text-base font-medium bg-card border-border/80 w-full px-3 sm:px-4 shadow-xs appearance-none" 
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                <Label htmlFor="time" className="flex items-center text-base font-semibold">
                  <Clock className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span className="truncate">Время</span>
                </Label>
                <Input 
                  type="time" 
                  id="time" 
                  className="h-14 rounded-2xl text-base font-medium bg-card border-border/80 w-full px-3 sm:px-4 shadow-xs appearance-none" 
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
            </div>

            {/* Выпадающий список выбора услуг */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="flex items-center text-base font-semibold">
                  <Sparkles className="h-5 w-5 text-primary mr-2" />
                  Услуги {newServiceIds.length > 0 && `(${newServiceIds.length})`}
                </Label>
              </div>

              {/* Выпадающая кнопка триггер */}
              <button
                type="button"
                onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                className="w-full min-h-[60px] p-3.5 rounded-2xl bg-card hover:bg-muted/30 border border-border/80 flex items-center justify-between shadow-xs transition-all text-left"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="truncate">
                    {selectedServicesList.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedServicesList.map(s => (
                          <span key={s.id} className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                            <ServiceIcon name={s.icon} className="w-3 h-3" />
                            {s.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-base">Выберите услуги из списка...</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {newServiceIds.length > 0 && (
                    <span className="text-xs font-black text-primary bg-primary/15 px-2.5 py-1 rounded-full">
                      {totalPrice} {currency} • {formatDuration(totalDuration)}
                    </span>
                  )}
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isServicesDropdownOpen ? "rotate-180 text-primary" : ""}`} />
                </div>
              </button>

              {/* Содержимое выпадающего списка услуг */}
              {isServicesDropdownOpen && (
                <div className="p-2 max-h-[350px] overflow-y-auto rounded-2xl w-full shadow-2xl bg-card border border-border/80 backdrop-blur-xl mt-2 space-y-1 animate-in fade-in-80 slide-in-from-top-2">
                  {servicesList.map(s => {
                    const isSelected = newServiceIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleToggleService(s.id)}
                        className={`w-full p-3 rounded-xl text-left flex justify-between items-center transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-primary/15 border-l-4 border-l-primary text-primary font-semibold shadow-xs" 
                            : "hover:bg-muted/40 text-foreground border-l-4 border-l-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            isSelected ? "bg-primary text-primary-foreground font-bold shadow-xs" : "bg-primary/10 text-primary"
                          }`}>
                            <ServiceIcon name={s.icon} className="h-4 w-4 shrink-0" />
                          </div>
                          <span className="font-semibold text-base text-foreground">{s.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-extrabold text-primary block">{s.price} {currency}</span>
                          <span className="text-xs font-medium text-muted-foreground">{formatDuration(s.duration || 60)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center text-base font-semibold">
                <FileText className="h-5 w-5 text-primary mr-2" />
                Заметки
              </Label>
              <Input 
                id="notes" 
                placeholder="Особые пожелания..." 
                className="h-14 rounded-2xl text-base font-medium bg-muted/30 border-muted px-4" 
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              {editingAppointmentId && (
                <Button 
                  type="button"
                  variant="outline"
                  className="h-14 rounded-2xl border-destructive text-destructive hover:bg-destructive/10 px-4 text-base font-semibold"
                  onClick={handleDeleteAppointment}
                >
                  Удалить
                </Button>
              )}
              <Button 
                className="flex-1 h-14 rounded-2xl text-base font-bold shadow-md"
                onClick={handleSaveAppointment}
              >
                {editingAppointmentId ? "Сохранить изменения" : "Создать запись"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
