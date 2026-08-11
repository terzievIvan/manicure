"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Lock, AlertCircle } from "lucide-react";
import { useTranslation } from "@/components/I18nProvider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !newPassword) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setMessage(t("auth.password_updated"));
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Произошла ошибка");
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manicure</h1>
          <p className="text-muted-foreground mt-2">
            {t("auth.reset_password")}
          </p>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-3xl shadow-sm ring-1 ring-border/50">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
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
              <Label htmlFor="new-password">{t("auth.new_password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="new-password"
                  type="password"
                  placeholder={t("auth.password_min")}
                  className="pl-10 h-12 rounded-2xl"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              {loading ? t("auth.loading") : t("auth.update_password")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
