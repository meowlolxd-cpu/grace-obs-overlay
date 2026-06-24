-- supabase-init.sql
-- Run this in Supabase SQL editor (Project -> SQL) to create the required tables
-- WARNING: the policies below are permissive (FOR QUICK DEV). Adjust for production.

-- Enable pgcrypto (for gen_random_uuid())
create extension if not exists "pgcrypto";

-- Rooms
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Sources (image/sound/tts/video) with properties stored as jsonb
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  type text not null,
  properties jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- TTS settings per room
create table if not exists public.tts_settings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  voice text,
  language text,
  created_at timestamptz default now()
);

-- Playback commands (used to send play_url etc.)
create table if not exists public.playback_commands (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  action text not null,
  url text,
  created_at timestamptz default now()
);

-- NOTE: Supabase projects often have Row Level Security (RLS) enabled by default.
-- The following policy blocks are intentionally permissive for quick prototyping.
-- Remove or tighten them for production.

-- Rooms policies
alter table public.rooms enable row level security;
create policy rooms_public_all on public.rooms for all using (true) with check (true);

-- Sources policies
alter table public.sources enable row level security;
create policy sources_public_all on public.sources for all using (true) with check (true);

-- TTS settings policies
alter table public.tts_settings enable row level security;
create policy tts_public_all on public.tts_settings for all using (true) with check (true);

-- Playback commands policies
alter table public.playback_commands enable row level security;
create policy playback_public_all on public.playback_commands for all using (true) with check (true);

-- End of file
