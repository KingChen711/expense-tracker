-- Milestone 4: recurring transaction templates
-- Run this in the Supabase project's SQL Editor (Dashboard > SQL Editor > New query).

create table if not exists public.recurring_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(14, 2) not null check (amount > 0),
  note text,
  day_of_month smallint not null check (day_of_month between 1 and 31),
  start_date date not null default current_date,
  last_generated_on date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.recurring_templates enable row level security;

create policy "recurring_templates_select_own" on public.recurring_templates
  for select using (auth.uid() = user_id);
create policy "recurring_templates_insert_own" on public.recurring_templates
  for insert with check (auth.uid() = user_id);
create policy "recurring_templates_update_own" on public.recurring_templates
  for update using (auth.uid() = user_id);
create policy "recurring_templates_delete_own" on public.recurring_templates
  for delete using (auth.uid() = user_id);
