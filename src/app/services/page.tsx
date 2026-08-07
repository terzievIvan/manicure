"use client";

import { useState } from "react";
import { Plus, Sparkles, Trash2, Edit2, Tag, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MOCK_SERVICES } from "@/lib/supabase";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { ServiceIcon, SERVICE_ICONS } from "@/components/ServiceIcon";

export default function ServicesPage() {
  const [services, setServices] = useState(MOCK_SERVICES);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [selectedIcon, setSelectedIcon] = useState("Sparkles");

  const handleOpenNewService = () => {
    setEditingServiceId(null);
    setName("");
    setPrice("");
    setDuration("60");
    setSelectedIcon("Sparkles");
    setIsSheetOpen(true);
  };

  const handleOpenEditService = (service: typeof MOCK_SERVICES[0] & { duration?: number; icon?: string }) => {
    setEditingServiceId(service.id);
    setName(service.name);
    setPrice(service.price.toString());
    setDuration((service.duration || 60).toString());
    setSelectedIcon(service.icon || "Sparkles");
    setIsSheetOpen(true);
  };

  const handleSaveService = () => {
    if (!name.trim() || !price) return;
    const parsedPrice = parseFloat(price) || 0;
    const parsedDuration = parseInt(duration, 10) || 60;

    if (editingServiceId) {
      // Edit
      const updated = services.map(s => {
        if (s.id === editingServiceId) {
          return { ...s, name, price: parsedPrice, duration: parsedDuration, icon: selectedIcon };
        }
        return s;
      });
      const mockIdx = MOCK_SERVICES.findIndex(s => s.id === editingServiceId);
      if (mockIdx !== -1) {
        MOCK_SERVICES[mockIdx] = { ...MOCK_SERVICES[mockIdx], name, price: parsedPrice, duration: parsedDuration, icon: selectedIcon };
      }
      setServices(updated);
    } else {
      // Add new
      const newService = {
        id: Math.random().toString(36).substring(7),
        name,
        price: parsedPrice,
        duration: parsedDuration,
        icon: selectedIcon,
      };
      MOCK_SERVICES.push(newService);
      setServices([...MOCK_SERVICES]);
    }

    setName("");
    setPrice("");
    setDuration("60");
    setSelectedIcon("Sparkles");
    setIsSheetOpen(false);
  };

  const handleDeleteService = () => {
    if (!editingServiceId) return;
    const updated = services.filter(s => s.id !== editingServiceId);
    const mockIdx = MOCK_SERVICES.findIndex(s => s.id === editingServiceId);
    if (mockIdx !== -1) {
      MOCK_SERVICES.splice(mockIdx, 1);
    }
    setServices(updated);
    setIsSheetOpen(false);
  };

  const formatDuration = (mins: number) => {
    if (!mins || mins <= 0) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}ч ${m}мин`;
    if (h > 0) return `${h}ч`;
    return `${m}мин`;
  };

  return (
    <div className="flex flex-col h-full bg-background pt-safe pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 pt-4 pb-4 border-b flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Услуги</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Управление прайс-листом</p>
        </div>
        <Button 
          onClick={handleOpenNewService} 
          className="rounded-xl px-4 font-semibold gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Добавить
        </Button>
      </div>

      <div className="p-4 space-y-3">
        {services.length > 0 ? (
          services.map(service => (
            <div 
              key={service.id} 
              onClick={() => handleOpenEditService(service)}
              className="bg-card text-card-foreground p-4 rounded-2xl shadow-sm ring-1 ring-border/50 flex justify-between items-center hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <ServiceIcon name={service.icon} className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-base">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDuration(service.duration || 60)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-extrabold text-base text-primary">{service.price} CHF</span>
                <Edit2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">Список услуг пуст</p>
            <p className="text-sm">Нажмите "Добавить", чтобы создать первую услугу</p>
          </div>
        )}
      </div>

      {/* Sheet для добавления/редактирования услуги */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[75vh] rounded-t-3xl flex flex-col pt-6">
          <SheetHeader className="mb-4 flex flex-row items-center justify-between border-b pb-3">
            <SheetTitle className="text-left text-2xl font-bold">
              {editingServiceId ? "Редактировать услугу" : "Новая услуга"}
            </SheetTitle>
            {editingServiceId && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDeleteService}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 mr-4"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-5 px-1 pb-4">
            {/* Название услуги */}
            <div className="space-y-2">
              <Label htmlFor="service-name" className="flex items-center text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary mr-2" />
                Название услуги
              </Label>
              <Input 
                id="service-name" 
                placeholder="например, Маникюр + Гель-лак" 
                className="h-13 rounded-2xl text-base bg-muted/30 border-muted" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Выбор иконки */}
            <div className="space-y-2">
              <Label className="flex items-center text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary mr-2" />
                Иконка услуги
              </Label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2 bg-muted/20 border border-muted/70 rounded-2xl">
                {SERVICE_ICONS.map((item) => {
                  const isSelected = selectedIcon === item.name;
                  const Icon = item.Icon;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setSelectedIcon(item.name)}
                      title={item.label}
                      className={`h-12 w-full rounded-xl flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary scale-105"
                          : "bg-card hover:bg-muted text-foreground border border-border/40"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Стоимость и Длительность */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="service-price" className="flex items-center text-sm font-semibold">
                  <Tag className="h-4 w-4 text-primary mr-2" />
                  Стоимость (CHF)
                </Label>
                <Input 
                  type="number" 
                  id="service-price" 
                  placeholder="85" 
                  className="h-13 rounded-2xl text-base bg-muted/30 border-muted" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-duration" className="flex items-center text-sm font-semibold">
                  <Clock className="h-4 w-4 text-primary mr-2" />
                  Длительность (мин)
                </Label>
                <Input 
                  type="number" 
                  id="service-duration" 
                  placeholder="60" 
                  className="h-13 rounded-2xl text-base bg-muted/30 border-muted" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {editingServiceId && (
                <Button 
                  type="button"
                  variant="outline"
                  className="h-14 rounded-2xl border-destructive text-destructive hover:bg-destructive/10 px-4"
                  onClick={handleDeleteService}
                >
                  Удалить
                </Button>
              )}
              <Button 
                className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-md"
                onClick={handleSaveService}
              >
                {editingServiceId ? "Сохранить изменения" : "Добавить услугу"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
