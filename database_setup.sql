-- Habilitar la extensión UUID para generar IDs únicos
create extension if not exists "uuid-ossp";

-- Tabla de Productos
create table products (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  price numeric not null,
  category text not null,
  description text,
  main_image text,
  additional_images text[], -- Array de URLs de imágenes
  featured boolean default false,
  in_stock boolean default true,
  stock integer default 0, -- Stock total
  variants jsonb -- Array de variantes: [{ "size": "40cm", "stock": 5 }, ...]
);

-- Tabla de Pedidos (Orders)
create table orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  order_code text not null unique, -- Código único para que el cliente consulte (ej: ORD-123456)
  customer_name text not null,
  customer_dni text not null,
  customer_phone text not null,
  shipping_address text not null,
  items jsonb not null, -- Guardamos los items como JSON
  total_amount numeric not null,
  payment_method text not null,
  status text not null default 'Recibido' check (status in ('Recibido', 'Confirmado', 'En proceso', 'Entregado'))
);

-- Políticas de Seguridad (RLS) - Opcional pero recomendado
alter table products enable row level security;
alter table orders enable row level security;

-- Permitir lectura pública de productos
create policy "Productos son públicos"
  on products for select
  using (true);

-- Permitir lectura de pedidos solo por código (esto se maneja en la query del front, 
-- pero para RLS estricto necesitaríamos una función o política más compleja. 
-- Por ahora permitimos select público para simplificar la consulta por código)
create policy "Pedidos consultables por código"
  on orders for select
  using (true);

-- Permitir inserción de pedidos a cualquiera (anon)
create policy "Cualquiera puede crear pedidos"
  on orders for insert
  with check (true);

-- Permitir actualizar pedidos (necesario para que el Admin cambie el estado)
create policy "Permitir actualizar pedidos"
  on orders for update
  using (true)
  with check (true);

-- Permitir gestión total de productos (para el Admin)
create policy "Permitir gestión de productos"
  on products
  for all
  using (true)
  with check (true);

-- Permitir inserción de pedidos a cualquiera (anon)
create policy "Cualquiera puede crear pedidos"
  on orders for insert
  with check (true);
