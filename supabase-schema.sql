-- JS Invoice: Supabase Database Schema
-- To apply: Copy and paste this script into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql and click "Run".

-- 1. Invoices Table
create table if not exists public.invoices (
  id text primary key,
  user_id text,
  number text not null,
  title text default 'Tax Invoice',
  issue_date text,
  due_date text,
  currency text default 'INR',
  status text default 'draft',
  grand_total numeric default 0,
  amount_paid numeric default 0,
  balance_due numeric default 0,
  data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Clients Table
create table if not exists public.clients (
  id text primary key,
  user_id text,
  name text not null,
  company_name text,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text default 'India',
  tax_id text,
  currency text default 'INR',
  notes text,
  data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Quotes / Estimates Table
create table if not exists public.quotes (
  id text primary key,
  user_id text,
  number text not null,
  title text default 'Estimate / Quotation',
  issue_date text,
  expiry_date text,
  currency text default 'INR',
  status text default 'draft',
  grand_total numeric default 0,
  data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Payments Table
create table if not exists public.payments (
  id text primary key,
  user_id text,
  invoice_id text,
  invoice_number text,
  client_id text,
  client_name text,
  amount numeric not null,
  currency text default 'INR',
  payment_date text,
  method text default 'bank_transfer',
  transaction_ref text,
  notes text,
  data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Products / Inventory Table
create table if not exists public.products (
  id text primary key,
  user_id text,
  name text not null,
  description text,
  unit text default 'hrs',
  unit_price numeric default 0,
  default_tax_rate numeric default 0,
  data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. User Profiles / Settings
create table if not exists public.user_settings (
  user_id text primary key,
  data jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.invoices enable row level security;
alter table public.clients enable row level security;
alter table public.quotes enable row level security;
alter table public.payments enable row level security;
alter table public.products enable row level security;
alter table public.user_settings enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow all operations for anon" on public.invoices;
drop policy if exists "Allow all operations for anon" on public.clients;
drop policy if exists "Allow all operations for anon" on public.quotes;
drop policy if exists "Allow all operations for anon" on public.payments;
drop policy if exists "Allow all operations for anon" on public.products;
drop policy if exists "Allow all operations for anon" on public.user_settings;

-- Public / Anon access policies for seamless client-side usage:
create policy "Allow all operations for anon" on public.invoices for all using (true) with check (true);
create policy "Allow all operations for anon" on public.clients for all using (true) with check (true);
create policy "Allow all operations for anon" on public.quotes for all using (true) with check (true);
create policy "Allow all operations for anon" on public.payments for all using (true) with check (true);
create policy "Allow all operations for anon" on public.products for all using (true) with check (true);
create policy "Allow all operations for anon" on public.user_settings for all using (true) with check (true);
