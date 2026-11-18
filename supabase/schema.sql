-- FootWear — Supabase (PostgreSQL) schema
--
-- Run once against a fresh Supabase project (SQL Editor, or `supabase db push`).
-- After the first account is registered through the app, promote it:
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
--
-- The frontend also ships with an in-browser demo backend (src/lib/localAdapter.js).
-- Demo mode is used automatically when VITE_SUPABASE_URL /
-- VITE_SUPABASE_PUBLISHABLE_KEY are not configured.
--
-- Order matters: public.is_admin() reads public.profiles, and PostgreSQL
-- validates SQL function bodies at creation time, so the tables come first.

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

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists products_category_idx on public.products (category);
create index if not exists products_brand_idx on public.products (brand);
create index if not exists cart_items_user_idx on public.cart_items (user_id);
create index if not exists cart_items_product_idx on public.cart_items (product_id);
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_items_product_idx on public.order_items (product_id);

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

-- Supabase creates the auth.users row inside its own transaction, so a trigger
-- is the only reliable place to create the matching profile. This works whether
-- or not "Confirm email" is enabled (the client never holds a session then).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'Customer'
    ),
    '',
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger functions never need API access; leave them uncallable.
revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_sizes enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- `auth.uid()` and `is_admin()` are wrapped in `(select ...)` so PostgreSQL
-- evaluates them once per query (an InitPlan) instead of once per row.

-- Profiles: read/update your own row; admins read every profile. Users cannot
-- change their own role because updates are restricted to name and phone.
drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "profiles update own details" on public.profiles;
create policy "profiles update own details"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = 'customer');

-- Products: anyone can read active products; admins manage everything. The
-- admin policies are split per action so SELECT does not evaluate two policies.
drop policy if exists "products public read" on public.products;
create policy "products public read"
  on public.products for select
  to anon, authenticated
  using (is_active or (select public.is_admin()));

drop policy if exists "products admin insert" on public.products;
create policy "products admin insert"
  on public.products for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "products admin update" on public.products;
create policy "products admin update"
  on public.products for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "products admin delete" on public.products;
create policy "products admin delete"
  on public.products for delete
  to authenticated
  using ((select public.is_admin()));

-- Sizes follow their parent product.
drop policy if exists "product sizes public read" on public.product_sizes;
create policy "product sizes public read"
  on public.product_sizes for select
  to anon, authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active
    )
  );

drop policy if exists "product sizes admin insert" on public.product_sizes;
create policy "product sizes admin insert"
  on public.product_sizes for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "product sizes admin update" on public.product_sizes;
create policy "product sizes admin update"
  on public.product_sizes for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "product sizes admin delete" on public.product_sizes;
create policy "product sizes admin delete"
  on public.product_sizes for delete
  to authenticated
  using ((select public.is_admin()));

-- Cart items belong to one user.
drop policy if exists "cart items own" on public.cart_items;
create policy "cart items own"
  on public.cart_items for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Orders: customers read their own; admins read all and update status. Orders
-- are only created by the place_order function below.
drop policy if exists "orders read own or admin" on public.orders;
create policy "orders read own or admin"
  on public.orders for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update"
  on public.orders for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Order items are readable with their parent order.
drop policy if exists "order items read own or admin" on public.order_items;
create policy "order items read own or admin"
  on public.order_items for select
  to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- API grants
-- ---------------------------------------------------------------------------

-- RLS still decides which rows are visible; these grants only open the tables
-- and functions to the API roles that need them.
grant usage on schema public to anon, authenticated;

grant select on public.products, public.product_sizes to anon, authenticated;
grant insert, update, delete on public.products, public.product_sizes to authenticated;

grant select, insert, update, delete on public.cart_items to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;

grant select, insert, update on public.profiles to authenticated;

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

-- Product images: public read, admin-only writes. The bucket is created here so
-- a fresh project needs no dashboard clicks.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "product images admin write" on storage.objects;
create policy "product images admin write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));

drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));

drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
