-- 
-- metastock Database Schema for Supabase (Public Schema)
-- 

-- Enable Extensions (usually in public)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 0.1 Function to generate random code
create or replace function public.generate_random_code(length int) 
returns text as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i int := 0;
begin
  while i < length loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    i := i + 1;
  end loop;
  return result;
end;
$$ language plpgsql;

-- 1. Profiles: Custom user data, balance, and administrative status
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  first_name text,
  last_name text,
  code text default public.generate_random_code(6),
  phone_number text,
  address text,
  kyc_status text default 'unverified',
  bank_network text,
  bank_account text,
  bank_name text,
  avatar_url text,
  balance decimal(18,2) default 0.00,
  is_admin boolean default false,
  password text, -- Added for specific auth flows as requested
  updated_at timestamp with time zone default now(),
  
  constraint username_length check (char_length(username) >= 3)
);

-- 2. Transactions: Ledger for all buy, sell, deposit, and withdraw events
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text check (type in ('buy', 'sell', 'deposit', 'withdraw')),
  asset_symbol text not null,
  amount decimal(36,18) not null, -- High precision for crypto
  price decimal(18,2) not null,
  total decimal(18,2) not null, -- Total USD value
  status text default 'success' check (status in ('success', 'pending', 'failed')),
  created_at timestamp with time zone default now()
);

-- 3. Portfolio: Current holdings of assets for each user
create table if not exists public.portfolio (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  asset_symbol text not null,
  units decimal(36,18) default 0, -- Current amount owned
  updated_at timestamp with time zone default now(),
  
  unique(user_id, asset_symbol)
);

-- 4. Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.portfolio enable row level security;

-- Policies: Only the data owner can see/modify their own data (Fully Qualified)
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can view their own transactions" on public.transactions;
create policy "Users can view their own transactions" on public.transactions for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own transactions" on public.transactions;
create policy "Users can insert their own transactions" on public.transactions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can view their own portfolio" on public.portfolio;
create policy "Users can view their own portfolio" on public.portfolio for select using (auth.uid() = user_id);
drop policy if exists "Users can update their own portfolio" on public.portfolio;
create policy "Users can update their own portfolio" on public.portfolio for all using (auth.uid() = user_id);

-- 5. Automatic Profile Creation on Signup
-- Create a profile whenever a new user signs up in Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, first_name, last_name, avatar_url, password)
  values (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'password'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to prevent error on re-run
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Global Settings: Application settings manageable by administrators
create table if not exists public.global_settings (
  id text primary key default 'main',
  contact_phone text default '',
  contact_line text default '',
  contact_telegram text default '',
  updated_at timestamp with time zone default now()
);

-- Insert default setting
insert into public.global_settings (id) 
values ('main') 
on conflict (id) do nothing;

-- 7. Row Level Security (RLS) for Settings
alter table public.global_settings enable row level security;

drop policy if exists "Anyone can view global settings" on public.global_settings;
create policy "Anyone can view global settings" on public.global_settings
  for select using (true);

drop policy if exists "Only admins can update global settings" on public.global_settings;
create policy "Only admins can update global settings" on public.global_settings
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- 8. Extended Admin Policies for Profiles
-- Allow admins to view all profiles
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Allow admins to update non-admin profiles (balance, full_name, etc)
drop policy if exists "Admins can update non-admin profiles" on public.profiles;
create policy "Admins can update non-admin profiles" on public.profiles
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
    and is_admin = false
  );

-- 9. Extended Admin Policies for Transactions
-- Allow admins to view all transactions
drop policy if exists "Admins can view all transactions" on public.transactions;
create policy "Admins can view all transactions" on public.transactions
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Allow admins to insert transactions for any user (e.g. top-up deposits)
drop policy if exists "Admins can insert transactions for any user" on public.transactions;
create policy "Admins can insert transactions for any user" on public.transactions
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- 10. RPC: Secure Password Update with current password verification
create or replace function public.update_password(
  current_plain_password text,
  new_plain_password text
) returns text as $$
declare
  user_id uuid;
  is_valid boolean;
begin
  -- Get the current authenticated user ID
  user_id := auth.uid();
  
  -- Check if user is logged in
  if user_id is null then
    return 'unauthorized';
  end if;

  -- Verify current password against auth.users
  select exists (
    select 1 from auth.users 
    where id = user_id 
    and encrypted_password = crypt(current_plain_password, auth.users.encrypted_password)
  ) into is_valid;
  
  if not is_valid then
    return 'incorrect';
  end if;
  
  -- Update the password in auth.users
  update auth.users 
  set encrypted_password = crypt(new_plain_password, gen_salt('bf'))
  where id = user_id;
  
  return 'success';
end;
$$ language plpgsql security definer;

-- Restrict execution to authenticated users
revoke execute on function public.update_password(text, text) from public;
grant execute on function public.update_password(text, text) to authenticated;
