-- ============================================================
-- UndisputedComics (金牌漫画) — Supabase Database Setup
-- Run this in Supabase SQL Editor:
--   https://fdusyudelkhoomakdfel.supabase.co → SQL Editor
-- ============================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES (user data linked to Supabase Auth)
create table if not exists profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  name      text not null default '读者',
  email     text,
  phone     text,
  address   text,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

-- Add role column for admin access
 alter table profiles add column if not exists role text not null default 'customer';

create policy "Users can read own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can upsert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- 3. ENUMS
create type stock_status as enum ('in_stock', 'limited', 'out_of_stock', 'pre_order');
create type order_status as enum ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
create type coupon_type as enum ('percentage', 'fixed');
create type points_txn_type as enum ('earn', 'redeem');

-- 3. PRODUCTS TABLE
create table if not exists products (
  id          text primary key,
  title_zh    text not null,
  title_en    text,
  price       numeric(10,2) not null default 0,
  original_price numeric(10,2),
  publisher   text,
  category_id text not null default 'shonen',
  stock_status stock_status not null default 'in_stock',
  description_zh text,
  cover_image text,
  images      text[] default '{}',
  is_featured boolean not null default false,
  is_new      boolean not null default false,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 4. ORDERS TABLE
create table if not exists orders (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete set null,
  status          order_status not null default 'pending',
  customer_name   text not null,
  customer_phone  text not null,
  customer_email  text,
  customer_address text,
  subtotal        numeric(10,2) not null default 0,
  shipping        numeric(10,2) not null default 0,
  discount        numeric(10,2) not null default 0,
  total           numeric(10,2) not null default 0,
  coupon_code     text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 5. ORDER ITEMS TABLE
create table if not exists order_items (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references orders(id) on delete cascade,
  product_id      text not null,
  product_title   text not null,
  quantity        int not null default 1,
  price           numeric(10,2) not null,
  created_at      timestamptz not null default now()
);

-- 6. RATINGS TABLE
create table if not exists ratings (
  id          uuid primary key default uuid_generate_v4(),
  product_id  text not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  rating      int not null check (rating >= 1 and rating <= 5),
  created_at  timestamptz not null default now(),
  unique(product_id, user_id)
);

-- 7. FAVORITES TABLE
create table if not exists favorites (
  id          uuid primary key default uuid_generate_v4(),
  product_id  text not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(product_id, user_id)
);

-- 8. COUPONS TABLE
create table if not exists coupons (
  id          uuid primary key default uuid_generate_v4(),
  code        text unique not null,
  type        coupon_type not null default 'percentage',
  value       numeric(10,2) not null,
  min_spend   numeric(10,2) not null default 0,
  max_uses    int,
  used_count  int not null default 0,
  is_active   boolean not null default true,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- 9. SUBSCRIBERS TABLE
create table if not exists subscribers (
  id          uuid primary key default uuid_generate_v4(),
  email       text unique not null,
  name        text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 10. SITE SETTINGS (single-row)
create table if not exists site_settings (
  id              int primary key default 1 check (id = 1),
  store_name_zh   text not null default '金牌漫画',
  store_name_en   text not null default 'UndisputedComics',
  store_phone     text not null default '+60123456789',
  store_email     text,
  shipping_flat_west numeric(10,2) not null default 8.00,
  shipping_flat_east numeric(10,2) not null default 15.00,
  shipping_free_min numeric(10,2) not null default 150.00,
  coupons_enabled boolean not null default false,
  points_enabled  boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Insert default settings
insert into site_settings (id) values (1) on conflict do nothing;

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table ratings enable row level security;
alter table favorites enable row level security;
alter table coupons enable row level security;
alter table subscribers enable row level security;
alter table site_settings enable row level security;

-- Products: anyone can read, only authenticated can write (admin check later)
create policy "Products are viewable by everyone" on products
  for select using (true);

-- Orders: users read own, guests read by phone
create policy "Users can view own orders" on orders
  for select using (auth.uid() = user_id);

create policy "Anyone can create orders" on orders
  for insert with check (true);

-- Order items: viewable if you can view the order
create policy "Order items viewable by order owner" on order_items
  for select using (
    exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );

create policy "Anyone can create order items" on order_items
  for insert with check (true);

-- Ratings: anyone can read, authenticated can create/update own
create policy "Ratings viewable by everyone" on ratings
  for select using (true);

create policy "Users can rate once per product" on ratings
  for insert with check (auth.uid() = user_id);

create policy "Users can update own rating" on ratings
  for update using (auth.uid() = user_id);

create policy "Users can delete own rating" on ratings
  for delete using (auth.uid() = user_id);

-- Favorites: same pattern
create policy "Favorites viewable by everyone" on favorites
  for select using (true);

create policy "Users can manage own favorites" on favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can remove own favorites" on favorites
  for delete using (auth.uid() = user_id);

-- Coupons: anyone can read active, only admin can CRUD
create policy "Active coupons viewable by everyone" on coupons
  for select using (is_active = true);

-- Subscribers: public can insert, admin can read
create policy "Anyone can subscribe" on subscribers
  for insert with check (true);

-- Site settings: public read
create policy "Settings viewable by everyone" on site_settings
  for select using (true);

-- ============================================================
-- ADMIN HELPER FUNCTION
-- ============================================================
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ============================================================
-- ADMIN POLICIES (bypass-friendly for is_admin() users)
-- ============================================================

-- Products: admin full access
create policy "Admins manage products" on products
  for all using (is_admin())
  with check (is_admin());

-- Orders: admin can view and update all
create policy "Admins view all orders" on orders
  for select using (is_admin());

create policy "Admins update orders" on orders
  for update using (is_admin())
  with check (is_admin());

-- Order items: admin can view all
create policy "Admins view all order items" on order_items
  for select using (is_admin());

-- Ratings: admin full access
create policy "Admins manage ratings" on ratings
  for all using (is_admin())
  with check (is_admin());

-- Favorites: admin full access
create policy "Admins manage favorites" on favorites
  for all using (is_admin())
  with check (is_admin());

-- Coupons: admin full access
create policy "Admins manage coupons" on coupons
  for all using (is_admin())
  with check (is_admin());

-- Subscribers: admin can view
create policy "Admins view subscribers" on subscribers
  for select using (is_admin());

-- Profiles: admin can view all (for customer management)
create policy "Admins view all profiles" on profiles
  for select using (is_admin() or auth.uid() = id);

-- Site settings: admin can write
create policy "Admins manage settings" on site_settings
  for all using (is_admin())
  with check (is_admin());

-- ============================================================
-- SEED DATA: Products from data/products.json
-- ============================================================
insert into products (id, title_zh, title_en, price, original_price, publisher, category_id, stock_status, description_zh, is_featured, is_new, sort_order)
values
  ('one-piece-108',   '海賊王 第108卷',    'One Piece Vol. 108',       28.00, null,  '東立', 'shonen',       'in_stock',  '路飞与伙伴们的新冒险继续！和之国篇高潮迭起，精彩不容错过。', true,  false, 1),
  ('jjk-23',          '咒術迴戰 第23卷',   'Jujutsu Kaisen Vol. 23',  26.00, null,  '東立', 'shonen',       'in_stock',  '咒术师与咒灵的激战进入白热化阶段。最新卷精彩呈现！',       false, true,  2),
  ('yona-38',         '晨曦公主 第38卷',   'Yona of the Dawn Vol. 38',24.00, 26.00, '尖端', 'shojo',        'in_stock',  '尤娜的冒险之旅继续展开，命运之线将引向何方？',              false, false, 3),
  ('fruits-basket-12','魔法水果籃 第12卷', 'Fruits Basket Vol. 12',   22.00, 24.00, '東立', 'shojo',        'limited',   '经典少女漫画，十二生肖的秘密即将揭晓。限量发售！',          false, false, 4),
  ('chainsaw-man-23', '鏈鋸人 第23卷',     'Chainsaw Man Vol. 23',    22.00, null,  '東立', 'seinen',       'in_stock',  '淀治的疯狂冒险继续！藤本树最新力作，黑暗英雄的诞生。',      true,  false, 5),
  ('monster-1',       '怪物 完全版 第1卷', 'Monster Complete Vol. 1', 35.00, null,  '東販', 'seinen',       'pre_order', '浦泽直树经典悬疑漫画完全版！天才外科医生与怪物的对决。',    false, true,  6),
  ('dragon-ball-1',   '七龍珠 完全版 第1卷','Dragon Ball Complete 1',  38.00, 42.00, '東立', 'classics',     'in_stock',  '鸟山明不朽经典！完全版收录彩色页面，收藏价值极高。',        true,  false, 7),
  ('slam-dunk-1',     '灌籃高手 新裝版 第1卷','Slam Dunk New Ed 1',   32.00, null,  '尖端', 'classics',     'in_stock',  '井上雄彦篮球漫画巅峰之作！新版重制，画质大幅提升。',        false, false, 8),
  ('spy-family-12',   '間諜家家酒 第12卷', 'Spy x Family Vol. 12',    24.00, null,  '東立', 'new-releases', 'in_stock',  '间谍、杀手、超能力少女的搞笑家庭日常！最新卷爆笑来袭。',    true,  true,  9),
  ('demon-slayer-23', '鬼滅之刃 第23卷',   'Demon Slayer Vol. 23',    26.00, null,  '東立', 'new-releases', 'in_stock',  '最终决战！炭治郎与鬼舞辻无惨的终极对决。完结篇！',          false, true,  10)
on conflict do nothing;

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_featured on products(is_featured) where is_featured = true;
create index if not exists idx_products_new on products(is_new) where is_new = true;
create index if not exists idx_products_active on products(is_active) where is_active = true;
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_ratings_product on ratings(product_id);
create index if not exists idx_ratings_user on ratings(user_id);
create index if not exists idx_favorites_user on favorites(user_id);

-- ============================================================
-- STORAGE: Create Media Bucket
-- ============================================================
-- Note: Create the bucket manually first in Supabase Dashboard:
--   Storage → New Bucket → Name: "media" → Public bucket: ON → File size limit: 5MB
--   Then run the policies below:

-- Create or update bucket via SQL
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, '{image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/avif}')
on conflict (id) do update set public = true;

-- Storage policies
create policy "Admins can upload media" on storage.objects
  for insert with check (bucket_id = 'media' and is_admin());

create policy "Admins can delete media" on storage.objects
  for delete using (bucket_id = 'media' and is_admin());

create policy "Media is publicly viewable" on storage.objects
  for select using (bucket_id = 'media');
