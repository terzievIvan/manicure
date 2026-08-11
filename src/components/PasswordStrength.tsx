"use client";

import { useTranslation } from "@/components/I18nProvider";

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  const { t } = useTranslation();

  if (!password) return null;

  const hasMinLength = password.length >= 6;
  const hasEightChars = password.length >= 8;
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);

  let score = 0;
  if (hasMinLength) score += 1;
  if (hasEightChars) score += 1;
  if (hasNumberOrSymbol) score += 1;
  if (hasUpperAndLower) score += 1;

  const getLabel = () => {
    switch (score) {
      case 1:
        return { text: t("auth.strength_weak"), color: "text-rose-500", bar: "bg-rose-500" };
      case 2:
        return { text: t("auth.strength_medium"), color: "text-amber-500", bar: "bg-amber-500" };
      case 3:
        return { text: t("auth.strength_strong"), color: "text-emerald-500", bar: "bg-emerald-500" };
      case 4:
        return { text: t("auth.strength_very_strong"), color: "text-emerald-400 font-bold", bar: "bg-emerald-400" };
      default:
        return { text: t("auth.strength_weak"), color: "text-rose-500", bar: "bg-rose-500" };
    }
  };

  const info = getLabel();

  return (
    <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">{t("auth.strength_label")}:</span>
        <span className={`font-semibold transition-colors duration-300 ${info.color}`}>
          {info.text}
        </span>
      </div>

      {/* 4 segments */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((step) => {
          const isActive = score >= step;
          return (
            <div
              key={step}
              className={`h-full rounded-full transition-all duration-300 ${
                isActive ? info.bar : "bg-muted/60"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
