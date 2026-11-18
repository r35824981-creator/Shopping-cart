-- FootWear — InsForge (PostgreSQL) schema
--
-- Run this once in the InsForge SQL editor for a fresh project, then create the
-- first admin by updating a profile row's role to 'admin'.
--
-- The frontend also ships with an in-browser demo backend (see
-- src/lib/localAdapter.js). Demo mode is used automatically when
-- VITE_INSFORGE_URL / VITE_INSFORGE_ANON_KEY are not configured.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- True when the signed-in user has the admin role. SECURITY DEFINER avoids
-- recursive RLS checks on the profiles table inside policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  brand text not null,
  category text not null,
  price integer not null check (price >= 0),
  image_url text not null default '',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size text not null,
  stock integer not null default 0 check (stock >= 0),
  unique (product_id, size)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  size text not null,
  quantity integer not null default 1 check (quantity >= 1),
  created_at timestamptz not null default now(),
  unique (user_id, product_id, size)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount integer not null check (total_amount >= 0),
  payment_method text not null default 'COD' check (payment_method = 'COD'),
  delivery_name text not null,
  delivery_phone text not null,
  delivery_address text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  image_url text not null default '',
  size text not null,
  quantity integer not null check (quantity >= 1),
  unit_price integer not null check (unit_price >= 0)
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_brand_idx on public.products (brand);
create index if not exists cart_items_user_idx on public.cart_items (user_id);
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_sizes enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Profiles: read/update your own row; admins read every profile. Users cannot
-- change their own role because updates are restricted to name and phone.
drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own"
  on public.profiles for insert
  with check (id = auth.uid());

drop policy if exists "profiles update own details" on public.profiles;
create policy "profiles update own details"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = 'customer');

-- Products: anyone can read active products; admins manage everything.
drop policy if exists "products public read" on public.products;
create policy "products public read"
  on public.products for select
  using (is_active or public.is_admin());

drop policy if exists "products admin write" on public.products;
create policy "products admin write"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- Sizes follow their parent product.
drop policy if exists "product sizes public read" on public.product_sizes;
create policy "product sizes public read"
  on public.product_sizes for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active
    )
  );

drop policy if exists "product sizes admin write" on public.product_sizes;
create policy "product sizes admin write"
  on public.product_sizes for all
  using (public.is_admin())
  with check (public.is_admin());

-- Cart items belong to one user.
drop policy if exists "cart items own" on public.cart_items;
create policy "cart items own"
  on public.cart_items for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Orders: customers read their own; admins read all and update status. Orders
-- are only created by the place_order function below.
drop policy if exists "orders read own or admin" on public.orders;
create policy "orders read own or admin"
  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

-- Order items are readable with their parent order.
drop policy if exists "order items read own or admin" on public.order_items;
create policy "order items read own or admin"
  on public.order_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Atomic order placement
-- ---------------------------------------------------------------------------

-- Creates the order, copies the cart into order items, reduces stock and clears
-- the cart in one transaction. Prices come from the products table so the client
-- can never choose its own price.
create or replace function public.place_order(
  p_delivery_name text,
  p_delivery_phone text,
  p_delivery_address text
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_subtotal integer;
  v_delivery integer;
  v_order public.orders;
begin
  if v_user is null then
    raise exception 'You must be signed in to place an order.';
  end if;

  if not exists (select 1 from public.cart_items where user_id = v_user) then
    raise exception 'Your cart is empty.';
  end if;

  if exists (
    select 1
    from public.cart_items c
    join public.products p on p.id = c.product_id
    where c.user_id = v_user and not p.is_active
  ) then
    raise exception 'One or more items are no longer available.';
  end if;

  if exists (
    select 1
    from public.cart_items c
    join public.product_sizes s on s.product_id = c.product_id and s.size = c.size
    where c.user_id = v_user and s.stock < c.quantity
  ) then
    raise exception 'One or more items are no longer available in the requested quantity.';
  end if;

  select coalesce(sum(p.price * c.quantity), 0)
    into v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user;

  -- Keep in sync with src/utils/cart.js (free delivery over ₹4,999).
  v_delivery := case when v_subtotal >= 4999 then 0 else 149 end;

  insert into public.orders (
    user_id, status, total_amount, payment_method,
    delivery_name, delivery_phone, delivery_address
  )
  values (
    v_user, 'pending', v_subtotal + v_delivery, 'COD',
    trim(p_delivery_name), trim(p_delivery_phone), trim(p_delivery_address)
  )
  returning * into v_order;

  insert into public.order_items (
    order_id, product_id, product_name, image_url, size, quantity, unit_price
  )
  select v_order.id, p.id, p.name, p.image_url, c.size, c.quantity, p.price
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user;

  update public.product_sizes s
    set stock = s.stock - c.quantity
  from public.cart_items c
  where c.user_id = v_user
    and s.product_id = c.product_id
    and s.size = c.size;

  delete from public.cart_items where user_id = v_user;

  return v_order;
end;
$$;

revoke all on function public.place_order(text, text, text) from public;
grant execute on function public.place_order(text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

-- Create the bucket in the InsForge dashboard (Storage → New bucket):
--   name: product-images, public read: on
-- Then apply these policies so only admins can write files.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "product images admin write" on storage.objects;
create policy "product images admin write"
  on storage.objects for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

-- ---------------------------------------------------------------------------
-- First admin
-- ---------------------------------------------------------------------------

-- 1. Register the admin account through the app (it gets the customer role).
-- 2. Promote it once:
--    update public.profiles set role = 'admin' where id = (
--      select id from auth.users where email = 'admin@example.com'
--    );
