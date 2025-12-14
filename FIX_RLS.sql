-- EJECUTA ESTE SQL EN EL EDITOR SQL DE SUPABASE PARA CORREGIR LOS PERMISOS

-- 1. Políticas para la tabla de Pedidos (Orders)
-- Permitir que cualquiera pueda crear un pedido
create policy "Cualquiera puede crear pedidos"
  on orders for insert
  with check (true);

-- Permitir actualizar pedidos (necesario para cambiar el estado en Admin)
create policy "Permitir actualizar pedidos"
  on orders for update
  using (true)
  with check (true);

-- 2. Políticas para la tabla de Productos
-- Permitir gestión total de productos (crear, editar, eliminar)
create policy "Permitir gestión de productos"
  on products
  for all
  using (true)
  with check (true);
