import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Инициализация Supabase клиента (если заданы переменные окружения)
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock Data для прототипа
export const MOCK_CLIENTS = [
  { id: '1', name: 'Анна Смирнова', phone: '+41 79 123 45 67', lastVisit: '2026-08-01' },
  { id: '2', name: 'Елена Попова', phone: '+41 78 765 43 21', lastVisit: '2026-08-05' },
  { id: '3', name: 'Мария Иванова', phone: '+41 76 111 22 33', lastVisit: '2026-07-20' },
];

export const MOCK_SERVICES = [
  { id: '1', name: 'Маникюр + Гель-лак', price: 85, duration: 90, icon: 'Sparkles' },
  { id: '2', name: 'Наращивание ногтей', price: 140, duration: 120, icon: 'Wand2' },
  { id: '3', name: 'Педикюр', price: 95, duration: 60, icon: 'Footprints' },
  { id: '4', name: 'Снятие', price: 20, duration: 30, icon: 'Eraser' },
];

export const MOCK_APPOINTMENTS = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Анна Смирнова',
    serviceId: '1',
    serviceName: 'Маникюр + Гель-лак (85 CHF)',
    date: new Date().toISOString().split('T')[0], // Сегодня
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
    date: new Date().toISOString().split('T')[0], // Сегодня
    startTime: '13:00',
    endTime: '14:00',
    status: 'Ожидает',
    notes: '',
  },
];
