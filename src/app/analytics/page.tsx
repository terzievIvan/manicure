"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  getAppointments, 
  getServices, 
  getExpenses, 
  saveExpense, 
  deleteExpense, 
  AppointmentItem, 
  ServiceItem, 
  ExpenseItem 
} from "@/lib/supabase";
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  DollarSign, 
  Award, 
  Calendar, 
  Filter, 
  Plus, 
  Trash2, 
  Receipt, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EXPENSE_CATEGORIES = ["Материалы", "Аренда", "Оборудование", "Реклама", "Прочее"];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"income" | "expenses">("income");

  // Form state for new expense
  const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [expenseCategory, setExpenseCategory] = useState("Материалы");

  const refreshData = async () => {
    const [apps, srvs, exps] = await Promise.all([
      getAppointments(),
      getServices(),
      getExpenses(),
    ]);
    setAppointments(apps);
    setServices(srvs);
    setExpenses(exps);
  };

  useEffect(() => {
    setMounted(true);
    refreshData();
  }, []);

  // Extract list of unique available months (yyyy-MM) from appointments and expenses
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

    expenses.forEach((exp) => {
      if (exp.date && exp.date.length >= 7) {
        monthsSet.add(exp.date.substring(0, 7));
      }
    });

    // Sort descending (latest month first)
    return Array.from(monthsSet).sort().reverse();
  }, [appointments, expenses]);

  if (!mounted) return null;

  // Filter data by selected month
  const filteredAppointments = selectedMonth === "all" 
    ? appointments 
    : appointments.filter(a => a.date && a.date.startsWith(selectedMonth));

  const filteredExpenses = selectedMonth === "all"
    ? expenses
    : expenses.filter(e => e.date && e.date.startsWith(selectedMonth));

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
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
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

  const handleSaveExpense = async () => {
    if (!expenseTitle.trim() || !expenseAmount) return;
    const parsedAmount = parseFloat(expenseAmount) || 0;

    const newExp: ExpenseItem = {
      id: Math.random().toString(36).substring(7),
      title: expenseTitle,
      amount: parsedAmount,
      date: expenseDate,
      category: expenseCategory,
    };

    await saveExpense(newExp);
    await refreshData();

    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseDate(format(new Date(), "yyyy-MM-dd"));
    setExpenseCategory("Материалы");
    setIsExpenseSheetOpen(false);
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
    await refreshData();
  };

  const getSessionPlural = (count: number) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod100 >= 11 && mod100 <= 19) return `${count} сеансов`;
    if (mod10 === 1) return `${count} сеанс`;
    if (mod10 >= 2 && mod10 <= 4) return `${count} сеанса`;
    return `${count} сеансов`;
  };

  return (
    <div className="flex flex-col h-full bg-background pt-safe pb-24">
      {/* Sticky Header with Month Filter */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 pt-4 pb-4 border-b flex justify-between items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold">Аналитика</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Доходы и расходы</p>
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
        {/* Main Net Profit Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden ring-1 ring-white/10">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <PiggyBank className="w-32 h-32 text-white" />
          </div>
          
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Чистая прибыль ({formatMonthLabel(selectedMonth).toLowerCase()})
          </p>
          <p className={`text-4xl font-black mt-1 ${netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {netProfit >= 0 ? `+${netProfit}` : netProfit} CHF
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ArrowUpRight className="w-4 h-4 shrink-0" />
              <span>Доход: +{totalRevenue} CHF</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <ArrowDownRight className="w-4 h-4 shrink-0" />
              <span>Расход: -{totalExpenses} CHF</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card text-card-foreground p-4 rounded-2xl border border-border/50 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Выручка</span>
            </div>
            <p className="text-2xl font-black mt-3 text-emerald-600 dark:text-emerald-400">+{totalRevenue} CHF</p>
          </div>

          <div className="bg-card text-card-foreground p-4 rounded-2xl border border-border/50 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-rose-500">
              <TrendingDown className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Расходы</span>
            </div>
            <p className="text-2xl font-black mt-3 text-rose-500">-{totalExpenses} CHF</p>
          </div>

          <div className="bg-card text-card-foreground p-4 rounded-2xl border border-border/50 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Визиты</span>
            </div>
            <p className="text-2xl font-black mt-3">{getSessionPlural(completedCount)}</p>
          </div>

          <div className="bg-card text-card-foreground p-4 rounded-2xl border border-border/50 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-amber-500">
              <Award className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Средний чек</span>
            </div>
            <p className="text-2xl font-black mt-3">{avgCheck} CHF</p>
          </div>
        </div>

        {/* Tab Switcher: Income vs Expenses */}
        <div className="flex bg-muted p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("income")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "income"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-500" />
            Доходы ({completedAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "expenses"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="w-4 h-4 text-rose-500" />
            Расходы ({filteredExpenses.length})
          </button>
        </div>

        {/* Details Section */}
        {activeTab === "income" ? (
          <div className="space-y-3">
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
                <p className="text-sm font-medium">Нет завершенных сеансов {selectedMonth !== "all" ? "за этот месяц" : ""}</p>
                <p className="text-xs mt-1">Отмечайте сеансы завершенными в расписании</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={() => setIsExpenseSheetOpen(true)}
              className="w-full h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Добавить расход
            </Button>

            {filteredExpenses.length > 0 ? (
              filteredExpenses.map(exp => (
                <div key={exp.id} className="bg-card text-card-foreground p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-base">{exp.title}</p>
                      {exp.category && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          {exp.category}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{exp.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-rose-500">-{exp.amount} CHF</span>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg transition-colors"
                      title="Удалить расход"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-2xl p-4">
                <p className="text-sm font-medium">Нет внесенных расходов {selectedMonth !== "all" ? "за этот месяц" : ""}</p>
                <p className="text-xs mt-1">Нажмите "Добавить расход", чтобы учесть закупку материалов</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sheet Modal for Adding Expense */}
      <Sheet open={isExpenseSheetOpen} onOpenChange={setIsExpenseSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl flex flex-col pt-6">
          <SheetHeader className="mb-4 border-b pb-3">
            <SheetTitle className="text-left text-2xl font-bold">Новый расход</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-5 px-1 pb-6">
            <div className="space-y-2">
              <Label htmlFor="exp-title" className="text-base font-semibold">Название расхода</Label>
              <Input
                id="exp-title"
                placeholder="Например: Гель-лаки, Аренда..."
                className="h-14 rounded-2xl text-base bg-card px-4"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-amount" className="text-base font-semibold">Сумма (CHF)</Label>
              <Input
                id="exp-amount"
                type="number"
                placeholder="0"
                className="h-14 rounded-2xl text-base bg-card px-4"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-date" className="text-base font-semibold">Дата</Label>
              <Input
                id="exp-date"
                type="date"
                className="h-14 rounded-2xl text-base bg-card px-4"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Категория</Label>
              <Select value={expenseCategory} onValueChange={(val) => setExpenseCategory(val || "Материалы")}>
                <SelectTrigger className="w-full h-14 rounded-2xl text-base bg-card px-4">
                  <SelectValue>{expenseCategory}</SelectValue>
                </SelectTrigger>
                <SelectContent className="p-1 rounded-2xl bg-card border shadow-xl z-50">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-base py-3 px-3 rounded-xl cursor-pointer">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSaveExpense}
              disabled={!expenseTitle.trim() || !expenseAmount}
              className="w-full h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base mt-4 shadow-md"
            >
              Сохранить расход
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
