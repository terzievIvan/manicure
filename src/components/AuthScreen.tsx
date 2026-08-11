"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, AlertCircle, Globe } from "lucide-react";
import { useTranslation } from "@/components/I18nProvider";
import { SupportedLanguage } from "@/lib/i18n/translations";

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { t, language, setLanguage } = useTranslation();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (!isLogin && cooldown > 0) {
      setError(t("auth.err_rate_limit"));
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data?.user?.identities?.length === 0) {
          throw new Error("Пользователь с таким email уже существует.");
        }
        setMessage(t("auth.success"));
        setCooldown(60); // 60s cooldown after registration attempt
        setIsLogin(true); // Переключаем на вкладку входа после регистрации
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "";
      if (msg.includes("Invalid login credentials")) {
        setError(t("auth.err_credentials"));
      } else if (msg.includes("Password should be at least 6 characters")) {
        setError(t("auth.err_short_pass"));
      } else if (msg.toLowerCase().includes("rate limit")) {
        setError(t("auth.err_rate_limit"));
        setCooldown(120); // 120s cooldown on Supabase rate limit error
      } else if (msg.includes("already exists") || msg.includes("уже существует")) {
        setError(t("auth.err_already_exists"));
      } else {
        setError(msg || "Произошла ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      {/* Переключатель языка */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-card/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-border/60 shadow-xs">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
          className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer pr-1"
        >
          <option value="uk" className="bg-card text-foreground">Українська (UK)</option>
          <option value="en" className="bg-card text-foreground">English (EN)</option>
          <option value="de" className="bg-card text-foreground">Deutsch (DE)</option>
          <option value="fr" className="bg-card text-foreground">Français (FR)</option>
          <option value="ru" className="bg-card text-foreground">Русский (RU)</option>
        </select>
      </div>

      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manicure</h1>
          <p className="text-muted-foreground mt-2">
            {t("auth.subtitle")}
          </p>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-3xl shadow-sm ring-1 ring-border/50">
          <div className="flex bg-muted p-1 rounded-2xl mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
              className={`flex-1 text-sm font-semibold py-2 rounded-xl transition-colors ${
                isLogin ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("auth.login")}
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
              className={`flex-1 text-sm font-semibold py-2 rounded-xl transition-colors ${
                !isLogin ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("auth.register")}
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {message && (
              <div className="p-3 bg-emerald-500/10 text-emerald-600 text-sm rounded-xl flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="master@example.com"
                  className="pl-10 h-12 rounded-2xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.password_min")}
                  className="pl-10 h-12 rounded-2xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || (!isLogin && cooldown > 0)}
              className="w-full h-12 rounded-2xl font-bold text-base mt-2"
            >
              {loading
                ? t("auth.loading")
                : !isLogin && cooldown > 0
                  ? `${t("auth.btn_register")} (${cooldown}s)`
                  : isLogin
                    ? t("auth.btn_login")
                    : t("auth.btn_register")}
            </Button>
          </form>
        </div>
        
        <p className="text-center text-xs text-muted-foreground px-4">
          {t("auth.disclaimer")}
        </p>
      </div>
    </div>
  );
}
