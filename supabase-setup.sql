-- Run this in your Supabase SQL Editor
-- Project: jhvwbvokhjdifilbsxpa

create table if not exists logos (
  id            uuid        default gen_random_uuid() primary key,
  business_name text        not null,
  tagline       text,
  industry      text,
  style         text,
  palette       text,
  svg_code      text        not null,
  variant_name  text,
  created_at    timestamptz default now()
);

-- Row Level Security
alter table logos enable row level security;

-- Allow anyone to insert and read (update to auth-based later)
create policy "public insert" on logos for insert with check (true);
create policy "public select" on logos for select using (true);

-- Optional: index for fast lookups by name
create index logos_business_name_idx on logos (business_name);
