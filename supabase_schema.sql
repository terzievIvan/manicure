-- Таблицы для Manic (Beauty Salon PWA)

-- 1. Таблица клиентов
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  last_visit DATE
);

-- 2. Таблица услуг
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration INT DEFAULT 60 NOT NULL,
  icon TEXT DEFAULT 'Sparkles'
);

-- 3. Таблица записей / визитов
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  service_ids TEXT[] DEFAULT '{}',
  service_name TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT DEFAULT 'Ожидает' NOT NULL,
  notes TEXT
);

-- Включение Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Публичные политики доступа (для работы с публичным anon ключом)
CREATE POLICY "Allow public read clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert clients" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update clients" ON clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete clients" ON clients FOR DELETE USING (true);

CREATE POLICY "Allow public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Allow public insert services" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update services" ON services FOR UPDATE USING (true);
CREATE POLICY "Allow public delete services" ON services FOR DELETE USING (true);

CREATE POLICY "Allow public read appointments" ON appointments FOR SELECT USING (true);
CREATE POLICY "Allow public insert appointments" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update appointments" ON appointments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete appointments" ON appointments FOR DELETE USING (true);

-- Первоначальные тестовые данные (Seed Data)
INSERT INTO services (name, price, duration, icon) VALUES
  ('Маникюр + Гель-лак', 85, 90, 'Sparkles'),
  ('Наращивание ногтей', 140, 120, 'Wand2'),
  ('Педикюр', 95, 60, 'Footprints'),
  ('Снятие', 20, 30, 'Eraser');

INSERT INTO clients (name, phone, last_visit) VALUES
  ('Анна Смирнова', '+41 79 123 45 67', '2026-08-01'),
  ('Елена Попова', '+41 78 765 43 21', '2026-08-05'),
  ('Мария Иванова', '+41 76 111 22 33', '2026-07-20');
