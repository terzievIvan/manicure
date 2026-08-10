"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, AlertCircle } from "lucide-react";

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

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
        setMessage("Регистрация успешна! Теперь вы можете войти.");
        setIsLogin(true); // Переключаем на вкладку входа после регистрации
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("Invalid login credentials")) {
        setError("Неверный email или пароль");
      } else if (err.message.includes("Password should be at least 6 characters")) {
        setError("Пароль должен содержать минимум 6 символов");
      } else {
        setError(err.message || "Произошла ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manic</h1>
          <p className="text-muted-foreground mt-2">
            CRM для бьюти-мастеров
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
              Вход
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
              className={`flex-1 text-sm font-semibold py-2 rounded-xl transition-colors ${
                !isLogin ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Регистрация
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
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Минимум 6 символов"
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
              disabled={loading}
              className="w-full h-12 rounded-2xl font-bold text-base mt-2"
            >
              {loading ? "Загрузка..." : isLogin ? "Войти в аккаунт" : "Создать аккаунт"}
            </Button>
          </form>
        </div>
        
        <p className="text-center text-xs text-muted-foreground px-4">
          При входе вы соглашаетесь с тем, что ваши данные будут синхронизированы в облаке.
        </p>
      </div>
    </div>
  );
}
