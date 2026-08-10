-- 0. Сброс старых таблиц и политик (если они создавались с типом UUID)
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- 1. Создание таблицы Клиентов (id TEXT для универсальной совместимости)
CREATE TABLE public.clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    last_visit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Создание таблицы Услуг
CREATE TABLE public.services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    duration INTEGER DEFAULT 60,
    icon TEXT DEFAULT 'Sparkles',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создание таблицы Записей (Расписание)
CREATE TABLE public.appointments (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    service_id TEXT,
    service_ids TEXT[],
    service_name TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT DEFAULT 'Ожидает',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включение RLS (Row Level Security) и публичных правил доступа
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all access on clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on services" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

-- 4. Заполнение начальными данными (Seed Data)
INSERT INTO public.clients (id, name, phone, last_visit) VALUES
('1', 'Анна Смирнова', '+41 79 123 45 67', '2023-10-01'),
('2', 'Елена Попова', '+41 78 765 43 21', '2023-10-15'),
('3', 'Мария Иванова', '+41 76 111 22 33', '2023-09-20');

INSERT INTO public.services (id, name, price, duration, icon) VALUES
('1', 'Маникюр + Гель-лак', 85, 90, 'Sparkles'),
('2', 'Наращивание ногтей', 140, 120, 'Wand2'),
('3', 'Педикюр', 95, 60, 'Footprints'),
('4', 'Снятие', 20, 30, 'Eraser');

INSERT INTO public.appointments (id, client_id, client_name, service_id, service_ids, service_name, date, start_time, end_time, status) VALUES
('1', '1', 'Анна Смирнова', '1', ARRAY['1'], 'Маникюр + Гель-лак (85 CHF)', CURRENT_DATE::text, '10:00', '11:30', 'Ожидает'),
('2', '2', 'Елена Попова', '3', ARRAY['3'], 'Педикюр (95 CHF)', CURRENT_DATE::text, '13:00', '14:00', 'Ожидает');

-- 4. Таблица Расходов (Expenses)
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date TEXT NOT NULL,
    category TEXT DEFAULT 'Материалы',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on expenses" ON public.expenses;
CREATE POLICY "Allow public all access on expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

