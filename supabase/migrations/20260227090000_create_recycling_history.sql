create table if not exists public.recycling_history (
  id uuid primary key,
  item text not null,
  category text not null,
  material text not null,
  confidence numeric not null default 0,
  contamination text not null default 'Medium',
  disposal text not null,
  city text,
  state text,
  country text,
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists recycling_history_timestamp_idx on public.recycling_history(timestamp desc);
create index if not exists recycling_history_category_idx on public.recycling_history(category);
