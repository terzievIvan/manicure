import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Mock Data для тестирования и разработки
export const MOCK_CLIENTS = [
  { id: '1', name: 'Анна Смирнова', phone: '+41 79 123 45 67', lastVisit: '2023-10-01' },
  { id: '2', name: 'Елена Попова', phone: '+41 78 765 43 21', lastVisit: '2023-10-15' },
  { id: '3', name: 'Мария Иванова', phone: '+41 76 111 22 33', lastVisit: '2023-09-20' },
];

export const MOCK_SERVICES = [
  { id: '1', name: 'Маникюр + Гель-лак', price: 85, duration: 90, icon: 'Sparkles' },
  { id: '2', name: 'Наращивание ногтей', price: 140, duration: 120, icon: 'Wand2' },
  { id: '3', name: 'Педикюр', price: 95, duration: 60, icon: 'Footprints' },
  { id: '4', name: 'Снятие', price: 20, duration: 30, icon: 'Eraser' },
];

export const MOCK_APPOINTMENTS: Array<{
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
}> = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Анна Смирнова',
    serviceId: '1',
    serviceName: 'Маникюр + Гель-лак (85 CHF)',
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
    serviceName: 'Педикюр (95 CHF)',
    date: new Date().toISOString().split('T')[0],
    startTime: '13:00',
    endTime: '14:00',
    status: 'Ожидает',
    notes: '',
  },
];
