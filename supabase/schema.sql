-- Milestone 1: categories + transactions
-- Run this in the Supabase project's SQL Editor (Dashboard > SQL Editor > New query).

create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text not null default '#6b7280',
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(14, 2) not null check (amount > 0),
  occurred_on date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, occurred_on desc);

alter table public.categories enable row level security;
alter table public.transactions enable row level security;

create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

-- Seed a starter set of categories automatically whenever a new auth user is
-- created (i.e. when you add yourself via Dashboard > Authentication > Users > Add user).
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, type, color) values
    (new.id, 'Ăn uống', 'expense', '#f97316'),
    (new.id, 'Di chuyển', 'expense', '#3b82f6'),
    (new.id, 'Mua sắm', 'expense', '#a855f7'),
    (new.id, 'Hóa đơn', 'expense', '#ef4444'),
    (new.id, 'Giải trí', 'expense', '#ec4899'),
    (new.id, 'Khác', 'expense', '#6b7280'),
    (new.id, 'Lương', 'income', '#22c55e'),
    (new.id, 'Thu nhập khác', 'income', '#14b8a6');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.seed_default_categories();
