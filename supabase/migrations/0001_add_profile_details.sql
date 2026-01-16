-- Migration to add Profile details

alter table public.profiles 
add column if not exists date_of_birth date,
add column if not exists address text,
add column if not exists avatar_url text;

-- Security check (policies already cover update on own id)
