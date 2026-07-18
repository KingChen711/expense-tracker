-- Milestone 5: debt tracking (only the "I owe others" direction)
-- Run this in the Supabase project's SQL Editor (Dashboard > SQL Editor > New query).

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  creditor_name text not null,
  total_amount numeric(14, 2) not null check (total_amount > 0),
  due_date date,
  note text,
  status text not null default 'active' check (status in ('active', 'paid')),
  created_at timestamptz not null default now()
);

create table if not exists public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  debt_id uuid not null references public.debts(id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  paid_on date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists debt_payments_debt_idx on public.debt_payments (debt_id);

alter table public.debts enable row level security;
alter table public.debt_payments enable row level security;

create policy "debts_select_own" on public.debts
  for select using (auth.uid() = user_id);
create policy "debts_insert_own" on public.debts
  for insert with check (auth.uid() = user_id);
create policy "debts_update_own" on public.debts
  for update using (auth.uid() = user_id);
create policy "debts_delete_own" on public.debts
  for delete using (auth.uid() = user_id);

create policy "debt_payments_select_own" on public.debt_payments
  for select using (auth.uid() = user_id);
create policy "debt_payments_insert_own" on public.debt_payments
  for insert with check (auth.uid() = user_id);
create policy "debt_payments_update_own" on public.debt_payments
  for update using (auth.uid() = user_id);
create policy "debt_payments_delete_own" on public.debt_payments
  for delete using (auth.uid() = user_id);
