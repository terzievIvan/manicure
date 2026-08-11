import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export interface ClientItem {
  id: string;
  name: string;
  phone: string;
  lastVisit?: string;
  notes?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration?: number;
  icon?: string;
}

export interface AppointmentItem {
  id: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceIds?: string[];
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
}

// Mock Data (для локального тестирования и фоллбэка)
export const MOCK_CLIENTS: ClientItem[] = [
  { id: '1', name: 'Анна Смирнова', phone: '+41 79 123 45 67', lastVisit: '2023-10-01' },
  { id: '2', name: 'Елена Попова', phone: '+41 78 765 43 21', lastVisit: '2023-10-15' },
  { id: '3', name: 'Мария Иванова', phone: '+41 76 111 22 33', lastVisit: '2023-09-20' },
];

export const MOCK_SERVICES: ServiceItem[] = [
  { id: '1', name: 'Маникюр + Гель-лак', price: 85, duration: 90, icon: 'Sparkles' },
  { id: '2', name: 'Наращивание ногтей', price: 140, duration: 120, icon: 'Wand2' },
  { id: '3', name: 'Педикюр', price: 95, duration: 60, icon: 'Footprints' },
  { id: '4', name: 'Снятие', price: 20, duration: 30, icon: 'Eraser' },
];

export const MOCK_APPOINTMENTS: AppointmentItem[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Анна Смирнова',
    serviceId: '1',
    serviceIds: ['1'],
    serviceName: 'Маникюр + Гель-лак (85)',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:30',
    status: 'Ожидает',
    notes: '',
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Елена Попова',
    serviceId: '3',
    serviceIds: ['3'],
    serviceName: 'Педикюр (95)',
    date: new Date().toISOString().split('T')[0],
    startTime: '13:00',
    endTime: '14:00',
    status: 'Ожидает',
    notes: '',
  },
];

// Helper for localStorage fallback
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

// --- КЛИЕНТЫ ---
export async function getClients(): Promise<ClientItem[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('clients').select('*');
      if (!error && data) {
        return data.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          phone: c.phone || '',
          lastVisit: c.last_visit || '',
        }));
      }
    } catch (e) {
      console.error('Error fetching clients from Supabase:', e);
    }
  }
  return getLocal('manic_clients', MOCK_CLIENTS);
}

export async function saveClient(client: ClientItem): Promise<void> {
  const current = getLocal('manic_clients', MOCK_CLIENTS);
  const idx = current.findIndex((c) => c.id === client.id);
  if (idx !== -1) {
    current[idx] = client;
  } else {
    current.push(client);
  }
  setLocal('manic_clients', current);

  if (supabase) {
    try {
      await supabase.from('clients').upsert({
        id: client.id,
        name: client.name,
        phone: client.phone,
        last_visit: client.lastVisit,
      });
    } catch (e) {
      console.error('Error saving client to Supabase:', e);
    }
  }
}

export async function deleteClient(id: string): Promise<void> {
  const current = getLocal('manic_clients', MOCK_CLIENTS);
  const updated = current.filter((c) => c.id !== id);
  setLocal('manic_clients', updated);

  if (supabase) {
    try {
      await supabase.from('clients').delete().eq('id', id);
    } catch (e) {
      console.error('Error deleting client from Supabase:', e);
    }
  }
}

// --- УСЛУГИ ---
export async function getServices(): Promise<ServiceItem[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('services').select('*');
      if (!error && data) {
        return data.map((s: any) => ({
          id: String(s.id),
          name: s.name,
          price: Number(s.price),
          duration: s.duration || 60,
          icon: s.icon || 'Sparkles',
        }));
      }
    } catch (e) {
      console.error('Error fetching services from Supabase:', e);
    }
  }
  return getLocal('manic_services', MOCK_SERVICES);
}

export async function saveService(service: ServiceItem): Promise<void> {
  const current = getLocal('manic_services', MOCK_SERVICES);
  const idx = current.findIndex((s) => s.id === service.id);
  if (idx !== -1) {
    current[idx] = service;
  } else {
    current.push(service);
  }
  setLocal('manic_services', current);

  if (supabase) {
    try {
      await supabase.from('services').upsert({
        id: service.id,
        name: service.name,
        price: service.price,
        duration: service.duration || 60,
        icon: service.icon || 'Sparkles',
      });
    } catch (e) {
      console.error('Error saving service to Supabase:', e);
    }
  }
}

export async function deleteService(id: string): Promise<void> {
  const current = getLocal('manic_services', MOCK_SERVICES);
  const updated = current.filter((s) => s.id !== id);
  setLocal('manic_services', updated);

  if (supabase) {
    try {
      await supabase.from('services').delete().eq('id', id);
    } catch (e) {
      console.error('Error deleting service from Supabase:', e);
    }
  }
}

// --- ЗАПИСИ (РАСПИСАНИЕ) ---
export async function getAppointments(): Promise<AppointmentItem[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('appointments').select('*');
      if (!error && data) {
        return data.map((a: any) => ({
          id: String(a.id),
          clientId: String(a.client_id || ''),
          clientName: a.client_name,
          serviceId: String(a.service_id || ''),
          serviceIds: a.service_ids || (a.service_id ? [String(a.service_id)] : []),
          serviceName: a.service_name,
          date: a.date,
          startTime: a.start_time,
          endTime: a.end_time,
          status: a.status || 'Ожидает',
          notes: a.notes || '',
        }));
      }
    } catch (e) {
      console.error('Error fetching appointments from Supabase:', e);
    }
  }
  return getLocal('manic_appointments', MOCK_APPOINTMENTS);
}

export async function saveAppointment(appointment: AppointmentItem): Promise<void> {
  const current = getLocal('manic_appointments', MOCK_APPOINTMENTS);
  const idx = current.findIndex((a) => a.id === appointment.id);
  if (idx !== -1) {
    current[idx] = appointment;
  } else {
    current.push(appointment);
  }
  setLocal('manic_appointments', current);

  if (supabase) {
    try {
      await supabase.from('appointments').upsert({
        id: appointment.id,
        client_id: appointment.clientId,
        client_name: appointment.clientName,
        service_id: appointment.serviceId,
        service_ids: appointment.serviceIds || [appointment.serviceId],
        service_name: appointment.serviceName,
        date: appointment.date,
        start_time: appointment.startTime,
        end_time: appointment.endTime,
        status: appointment.status,
        notes: appointment.notes || '',
      });
    } catch (e) {
      console.error('Error saving appointment to Supabase:', e);
    }
  }
}

export async function updateAppointmentStatus(id: string, status: string): Promise<void> {
  const current = getLocal('manic_appointments', MOCK_APPOINTMENTS);
  const idx = current.findIndex((a) => a.id === id);
  if (idx !== -1) {
    current[idx].status = status;
    setLocal('manic_appointments', current);
  }

  if (supabase) {
    try {
      await supabase.from('appointments').update({ status }).eq('id', id);
    } catch (e) {
      console.error('Error updating appointment status in Supabase:', e);
    }
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  const current = getLocal('manic_appointments', MOCK_APPOINTMENTS);
  const updated = current.filter((a) => a.id !== id);
  setLocal('manic_appointments', updated);

  if (supabase) {
    try {
      await supabase.from('appointments').delete().eq('id', id);
    } catch (e) {
      console.error('Error deleting appointment from Supabase:', e);
    }
  }
}

// --- РАСХОДЫ ---
export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  date: string;
  category?: string;
}

export const MOCK_EXPENSES: ExpenseItem[] = [
  { id: '1', title: 'Гель-лаки и фрезы', amount: 45, date: new Date().toISOString().split('T')[0], category: 'Материалы' },
  { id: '2', title: 'Одноразовые пилочки', amount: 20, date: new Date().toISOString().split('T')[0], category: 'Материалы' },
];

export async function getExpenses(): Promise<ExpenseItem[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('expenses').select('*');
      if (!error && data) {
        const mapped = data.map((e: any) => ({
          id: String(e.id),
          title: e.title,
          amount: Number(e.amount),
          date: e.date,
          category: e.category || 'Материалы',
        }));
        setLocal('manic_expenses', mapped);
        return mapped;
      }
    } catch (e) {
      console.error('Error fetching expenses from Supabase:', e);
    }
  }
  return getLocal('manic_expenses', MOCK_EXPENSES);
}

export async function saveExpense(expense: ExpenseItem): Promise<void> {
  const current = getLocal('manic_expenses', MOCK_EXPENSES);
  const idx = current.findIndex((e) => e.id === expense.id);
  if (idx !== -1) {
    current[idx] = expense;
  } else {
    current.push(expense);
  }
  setLocal('manic_expenses', current);

  if (supabase) {
    try {
      await supabase.from('expenses').upsert({
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        date: expense.date,
        category: expense.category || 'Материалы',
      });
    } catch (e) {
      console.error('Error saving expense to Supabase:', e);
    }
  }
}

export async function deleteExpense(id: string): Promise<void> {
  const current = getLocal('manic_expenses', MOCK_EXPENSES);
  const updated = current.filter((e) => e.id !== id);
  setLocal('manic_expenses', updated);

  if (supabase) {
    try {
      await supabase.from('expenses').delete().eq('id', id);
    } catch (e) {
      console.error('Error deleting expense from Supabase:', e);
    }
  }
}

