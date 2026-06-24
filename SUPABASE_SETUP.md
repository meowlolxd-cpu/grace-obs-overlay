# Supabase Setup for Grace OBS Overlay

This project uses Supabase for storage and realtime data.

## Required Supabase resources

### 1. Project config
Use the same Supabase URL and anon key from `.env`:

- `VITE_SUPABASE_URL=https://pxbpqxvegeywdaytaqgp.supabase.co`
- `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4YnBxeHZlZ2V5d2RheXRhcWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTAwMjgsImV4cCI6MjA5NzM2NjAyOH0.PfSsQupiA7mmWF4mjjaZ86Prs2oHZ5A5-mvG2HenEDo

> If you use a different Supabase project, update `.env` accordingly.

### 2. Storage bucket
Create a bucket named `images`.

- Open Supabase dashboard
- Go to Storage -> Buckets
- Create bucket `images`
- Set bucket to `public` if you want `getPublicUrl()` to work without extra auth

If you want a private bucket, you must update controller logic to generate signed URLs instead of `getPublicUrl()`.

### 3. Database tables
Run these SQL statements in Supabase SQL editor:

```sql
-- rooms table
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- sources table
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  type text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- playback commands table
create table if not exists public.playback_commands (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  action text not null,
  url text,
  created_at timestamptz not null default now()
);

-- tts settings table
create table if not exists public.tts_settings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  voice text,
  speed numeric,
  pitch numeric,
  created_at timestamptz not null default now()
);
```

### 4. Realtime / permissions

To use the app without auth, make sure RLS is disabled for these tables or add permissive policies.

If you are using Supabase Auth, then create policies for anonymous users.

### 5. Debugging

If you still see errors after creating tables and the bucket:

- verify the bucket name is exactly `images`
- verify the tables are in schema `public`
- verify `.env` contains the correct project URL and anon key

## Why this is not Firebase

This project uses Supabase, not Firebase. The code expects Supabase URL/key, Storage bucket named `images`, and tables `rooms`, `sources`, `playback_commands`, `tts_settings` in the `public` schema.
