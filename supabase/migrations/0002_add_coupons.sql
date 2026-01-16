-- Migration to add Coupons
create table public.coupons (
  code text primary key,
  discount_percent integer not null check (discount_percent > 0 and discount_percent <= 100),
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.coupons enable row level security;

-- Public can read active coupons (or we can keep it private and check via RPC, but RLS read is simpler for now)
create policy "Public can read active coupons" on public.coupons
  for select using (is_active = true);
