-- Run this once in your Supabase project's SQL Editor (Project -> SQL Editor -> New query).

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text default '',
  contact text default '',
  industry text default '',
  stage text default 'Lead',
  churned boolean default false,
  priority text default 'Medium',
  overview text default '',
  next_action text default '',
  next_action_date date,
  last_contact date,
  issues jsonb default '[]'::jsonb,
  specs jsonb default '[]'::jsonb,
  gtd jsonb default '[]'::jsonb,
  gathering jsonb default '[]'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security: only logged-in users can touch this table at all.
alter table clients enable row level security;

create policy "Authenticated users can view all clients"
  on clients for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert clients"
  on clients for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update clients"
  on clients for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete clients"
  on clients for delete
  using (auth.role() = 'authenticated');

-- Live sync so teammates see each other's changes without refreshing.
alter publication supabase_realtime add table clients;
