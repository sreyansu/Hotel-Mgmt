-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role text not null check (role in ('customer', 'super_admin', 'hotel_manager', 'staff')),
  full_name text,
  phone text,
  hotel_id uuid, -- For managers/staff, null for customers/super_admin
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- HOTELS
create table public.hotels (
  id uuid default uuid_generate_v4() primary key,
  slug text not null unique,
  name text not null,
  description text,
  address text,
  images text[], -- Array of image URLs
  amenities text[], -- Array of amenities strings
  contact_email text,
  contact_phone text,
  created_at timestamptz default now()
);

alter table public.hotels enable row level security;

-- ROOMS
create table public.rooms (
  id uuid default uuid_generate_v4() primary key,
  hotel_id uuid references public.hotels(id) on delete cascade not null,
  name text not null, -- e.g. "Deluxe Suite"
  description text,
  price_per_night numeric not null,
  capacity smallint not null default 2,
  images text[],
  amenities text[],
  total_units integer not null default 1,
  created_at timestamptz default now()
);

alter table public.rooms enable row level security;

-- BOOKINGS
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  hotel_id uuid references public.hotels(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null, -- Nullable if we allow guest checkout later, but for now strict
  room_id uuid references public.rooms(id) on delete restrict not null,
  check_in_date date not null,
  check_out_date date not null,
  total_price numeric not null,
  status text not null check (status in ('pending_payment', 'confirmed', 'cancelled', 'checked_in', 'checked_out')) default 'pending_payment',
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  stripe_payment_id text, -- or razorpay_order_id, generic for now
  payment_status text check (payment_status in ('pending', 'paid', 'failed', 'refunded')) default 'pending',
  created_at timestamptz default now()
);

alter table public.bookings enable row level security;

-- POLICIES

-- Profiles: 
-- Users can read their own profile.
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

-- Updates: Users can update their own profile.
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Hotels & Rooms:
-- Everyone can read hotels and rooms (Public)
create policy "Public hotels view" on public.hotels
  for select using (true);

create policy "Public rooms view" on public.rooms
  for select using (true);

-- Bookings:
-- Users can read their own bookings
create policy "Users view own bookings" on public.bookings
  for select using (auth.uid() = user_id);

-- Users can insert bookings (Authenticated)
create policy "Users insert bookings" on public.bookings
  for insert with check (auth.uid() = user_id);

-- Storage for Images (Optional Bucket Setup)
insert into storage.buckets (id, name, public) 
values ('hotel-images', 'hotel-images', true)
on conflict (id) do nothing;

create policy "Public Access Hotel Images" on storage.objects
  for select using (bucket_id = 'hotel-images');

-- FUNCTIONS
-- Auto-create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (new.id, new.email, 'customer', new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
