import React from "react";
import { 
  Sparkles, 
  Hand,
  Wand2, 
  Footprints, 
  Eraser, 
  Brush, 
  Paintbrush,
  Palette, 
  Gem, 
  Crown, 
  Heart, 
  Pipette,
  Droplet, 
  Flame, 
  SunDim,
  Layers,
  ShieldCheck,
  Scissors, 
  Eye,
  Flower2,
  Feather,
  SprayCan,
  Waves,
  Zap
} from "lucide-react";

export const SERVICE_ICONS = [
  { name: "Sparkles", label: "Манікюр / Блиск", Icon: Sparkles },
  { name: "Hand", label: "Руки / Догляд за нігтями", Icon: Hand },
  { name: "Wand2", label: "Нарощування нігтів", Icon: Wand2 },
  { name: "Footprints", label: "Педикюр", Icon: Footprints },
  { name: "Eraser", label: "Зняття покриття", Icon: Eraser },
  { name: "Brush", label: "Художній розпис", Icon: Brush },
  { name: "Paintbrush", label: "Тонкий дизайн", Icon: Paintbrush },
  { name: "Palette", label: "Палітра / Френч", Icon: Palette },
  { name: "Gem", label: "Стрази / Кристали", Icon: Gem },
  { name: "Crown", label: "Преміум / VIP сервіс", Icon: Crown },
  { name: "Heart", label: "SPA догляд", Icon: Heart },
  { name: "Pipette", label: "Олії та сироватки", Icon: Pipette },
  { name: "Droplet", label: "Зволоження", Icon: Droplet },
  { name: "Flame", label: "Гарячий манікюр / Парафін", Icon: Flame },
  { name: "SunDim", label: "UV / LED Лампа", Icon: SunDim },
  { name: "Layers", label: "Укріплення гелем / База", Icon: Layers },
  { name: "ShieldCheck", label: "Стерилізація / Гігієна", Icon: ShieldCheck },
  { name: "Scissors", label: "Чистка / Кутикула", Icon: Scissors },
  { name: "Eye", label: "Вії та брови", Icon: Eye },
  { name: "Flower2", label: "Еко / Натуральний догляд", Icon: Flower2 },
  { name: "Feather", label: "Ніжний догляд", Icon: Feather },
  { name: "SprayCan", label: "Аерографія / Градієнт", Icon: SprayCan },
  { name: "Waves", label: "Ванночка для нігтів", Icon: Waves },
  { name: "Zap", label: "Експрес манікюр", Icon: Zap },
];

export function ServiceIcon({ name, className = "h-5 w-5" }: { name?: string; className?: string }) {
  const found = SERVICE_ICONS.find((i) => i.name === name);
  const IconComponent = found ? found.Icon : Sparkles;
  return <IconComponent className={className} />;
}
