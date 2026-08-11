"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClients, saveClient, deleteClient, ClientItem } from "@/lib/supabase";
import { useTranslation } from "@/components/I18nProvider";

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { t } = useTranslation();
  
  const [client, setClient] = useState<ClientItem>({ id: "", name: "", phone: "", lastVisit: "" });
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    getClients().then((clients) => {
      const found = clients.find(c => c.id === id);
      if (found) {
        setClient(found);
      }
    });
  }, [id]);

  const handleSave = async () => {
    if (!client.name.trim()) return;
    await saveClient(client);
    router.back();
  };

  const handleConfirmDelete = async () => {
    await deleteClient(id);
    setIsConfirmDeleteOpen(false);
    router.back();
  };

  return (
    <div className="flex flex-col h-full bg-background pt-safe pb-16">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 pt-4 pb-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">{t("clients.edit_client")}</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl" 
          onClick={() => setIsConfirmDeleteOpen(true)}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">{t("clients.name")}</Label>
          <Input 
            id="name" 
            className="h-12 rounded-xl text-base" 
            value={client.name}
            onChange={(e) => setClient({ ...client, name: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">{t("clients.phone")}</Label>
          <Input 
            type="tel" 
            id="phone" 
            className="h-12 rounded-xl text-base block" 
            value={client.phone}
            onChange={(e) => setClient({ ...client, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">{t("schedule.notes")}</Label>
          <Input 
            id="notes" 
            className="h-12 rounded-xl text-base" 
            value={client.notes || ""}
            onChange={(e) => setClient({ ...client, notes: e.target.value })}
          />
        </div>

        <Button className="w-full h-14 rounded-xl text-lg font-semibold mt-4" onClick={handleSave}>
          <Save className="h-5 w-5 mr-2" />
          {t("clients.save")}
        </Button>
      </div>

      {/* Всплывающее окно подтверждения удаления */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-80 duration-200">
          <div className="bg-card text-card-foreground p-6 rounded-3xl max-w-sm w-full shadow-2xl border border-border/80 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{t("clients.delete_title") || "Удалить клиента?"}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("clients.delete_desc") || "Вы уверены, что хотите удалить клиента?"} <span className="font-semibold text-foreground">"{client.name}"</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                variant="outline" 
                className="h-12 rounded-xl font-semibold border-border/80" 
                onClick={() => setIsConfirmDeleteOpen(false)}
              >
                {t("analytics.cancel") || "Отмена"}
              </Button>
              <Button 
                variant="destructive" 
                className="h-12 rounded-xl font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                onClick={handleConfirmDelete}
              >
                {t("schedule.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
