"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Phone, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getClients, saveClient, deleteClient, ClientItem } from "@/lib/supabase";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<ClientItem[]>([]);
  
  useEffect(() => {
    getClients().then(setClients);
  }, []);

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(search.toLowerCase()) || 
    client.phone.includes(search)
  );

  const handleAddClient = async () => {
    if (!name.trim()) return;

    const newClient: ClientItem = {
      id: Math.random().toString(36).substring(7),
      name,
      phone,
      lastVisit: new Date().toISOString().split('T')[0],
    };

    await saveClient(newClient);
    const updated = await getClients();
    setClients(updated);
    
    // Reset form and close sheet
    setName("");
    setPhone("");
    setNotes("");
    setIsSheetOpen(false);
  };

  const handleDeleteClient = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteClient(id);
    const updated = await getClients();
    setClients(updated);
  };

  return (
    <div className="flex flex-col h-full bg-background pt-safe">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 pt-4 pb-4 border-b">
        <h1 className="text-2xl font-bold mb-4">Клиенты</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Поиск по имени или телефону..." 
            className="pl-10 h-12 rounded-xl text-base bg-muted/50 border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4 space-y-3 pb-24">
        {filteredClients.length > 0 ? (
          filteredClients.map(client => (
            <Link href={`/clients/${client.id}`} key={client.id} className="block">
              <div className="bg-card text-card-foreground p-4 rounded-2xl shadow-sm ring-1 ring-border/50 flex flex-col gap-2 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">{client.name}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <div className="flex items-center text-sm text-primary">
                    <Phone className="h-4 w-4 mr-1" />
                    {client.phone}
                  </div>
                  <span className="text-xs">Был(а): {client.lastVisit ? new Date(client.lastVisit).toLocaleDateString('ru-RU') : "Недавно"}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>Клиенты не найдены</p>
          </div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg shrink-0 z-40 bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
          <Plus className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl flex flex-col pt-8">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left text-2xl">Новый клиент</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto space-y-6 px-1">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input 
                id="name" 
                placeholder="Иван Иванов" 
                className="h-12 rounded-xl text-base" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input 
                type="tel" 
                id="phone" 
                placeholder="+41 79 000 00 00" 
                className="h-12 rounded-xl text-base block" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Заметки</Label>
              <Input 
                id="notes" 
                placeholder="Аллергии, предпочтения..." 
                className="h-12 rounded-xl text-base" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button 
              className="w-full h-14 rounded-xl text-lg font-semibold mt-4"
              onClick={handleAddClient}
            >
              Добавить
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
