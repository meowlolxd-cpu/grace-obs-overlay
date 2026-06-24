# Инициализация Supabase

## 1. Создание таблиц (SQL Editor)

Откройте Supabase Dashboard → Project → SQL Editor и выполните этот скрипт:

```sql
-- Enable pgcrypto
create extension if not exists "pgcrypto";

-- Rooms table
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Sources table
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  type text not null,
  properties jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- TTS settings table
create table if not exists public.tts_settings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  voice text,
  language text,
  created_at timestamptz default now()
);

-- Playback commands table
create table if not exists public.playback_commands (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  action text not null,
  url text,
  created_at timestamptz default now()
);

-- Enable RLS and create permissive policies for all tables
alter table public.rooms enable row level security;
create policy "rooms_public_all" on public.rooms for all using (true) with check (true);

alter table public.sources enable row level security;
create policy "sources_public_all" on public.sources for all using (true) with check (true);

alter table public.tts_settings enable row level security;
create policy "tts_public_all" on public.tts_settings for all using (true) with check (true);

alter table public.playback_commands enable row level security;
create policy "playback_public_all" on public.playback_commands for all using (true) with check (true);
```

## 2. Создание Storage Buckets

Откройте Supabase Dashboard → Project → Storage и создайте 3 bucket'а:

### a) Bucket: `images`
- Click "New bucket"
- Name: `images`
- Public checkbox: ✅ (нужно для публичного доступа к файлам)
- Create

### b) Bucket: `videos`
- Click "New bucket"
- Name: `videos`
- Public checkbox: ✅
- Create

### c) Bucket: `audios`
- Click "New bucket"
- Name: `audios`
- Public checkbox: ✅
- Create

## 3. Проверка .env файла

Убедитесь, что в `.env` указаны правильные credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

После этого всё должно работать!
