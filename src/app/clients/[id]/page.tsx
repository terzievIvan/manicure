"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_CLIENTS } from "@/lib/supabase";

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [client, setClient] = useState({ name: "", phone: "", notes: "" });

  useEffect(() => {
    // В реальном приложении здесь будет запрос к Supabase
    // const { data } = await supabase.from('clients').select('*').eq('id', id).single();
    const found = MOCK_CLIENTS.find(c => c.id === id);
    if (found) {
      setClient({ name: found.name, phone: found.phone, notes: "Пример заметки..." });
    }
  }, [id]);

  const handleSave = () => {
    // Заглушка
    // await supabase.from('clients').update({ name, phone, notes }).eq('id', id);
    router.back();
  };

  const handleDelete = () => {
    // Заглушка
    // await supabase.from('clients').delete().eq('id', id);
    router.back();
  };

  return (
    <div className="flex flex-col h-full bg-background pt-safe pb-16">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 pt-4 pb-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Редактировать</h1>
        </div>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}>
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Имя</Label>
          <Input 
            id="name" 
            className="h-12 rounded-xl text-base" 
            value={client.name}
            onChange={(e) => setClient({ ...client, name: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <Input 
            type="tel" 
            id="phone" 
            className="h-12 rounded-xl text-base block" 
            value={client.phone}
            onChange={(e) => setClient({ ...client, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Заметки</Label>
          <Input 
            id="notes" 
            className="h-12 rounded-xl text-base" 
            value={client.notes}
            onChange={(e) => setClient({ ...client, notes: e.target.value })}
          />
        </div>

        <Button className="w-full h-14 rounded-xl text-lg font-semibold mt-4" onClick={handleSave}>
          <Save className="h-5 w-5 mr-2" />
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
}
