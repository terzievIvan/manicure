import React from "react";
import { 
  Sparkles, 
  Wand2, 
  Footprints, 
  Eraser, 
  Brush, 
  Palette, 
  Crown, 
  Gem, 
  Heart, 
  Scissors, 
  Flame, 
  Droplet, 
  Sun, 
  Zap, 
  Smile, 
  Star 
} from "lucide-react";

export const SERVICE_ICONS = [
  { name: "Sparkles", label: "Маникюр / Блеск", Icon: Sparkles },
  { name: "Wand2", label: "Наращивание", Icon: Wand2 },
  { name: "Footprints", label: "Педикюр", Icon: Footprints },
  { name: "Eraser", label: "Снятие", Icon: Eraser },
  { name: "Brush", label: "Роспись", Icon: Brush },
  { name: "Palette", label: "Палитра / Дизайн", Icon: Palette },
  { name: "Crown", label: "Премиум", Icon: Crown },
  { name: "Gem", label: "Стразы / Кристаллы", Icon: Gem },
  { name: "Heart", label: "SPA / Забота", Icon: Heart },
  { name: "Scissors", label: "Коррекция / Стрижка", Icon: Scissors },
  { name: "Flame", label: "Парафин / Массаж", Icon: Flame },
  { name: "Droplet", label: "Масло / Увлажнение", Icon: Droplet },
  { name: "Sun", label: "Солярий / Загар", Icon: Sun },
  { name: "Zap", label: "Экспресс", Icon: Zap },
  { name: "Smile", label: "Маска", Icon: Smile },
  { name: "Star", label: "VIP Уход", Icon: Star },
];

export function ServiceIcon({ name, className = "h-5 w-5" }: { name?: string; className?: string }) {
  const found = SERVICE_ICONS.find((i) => i.name === name);
  const IconComponent = found ? found.Icon : Sparkles;
  return <IconComponent className={className} />;
}
