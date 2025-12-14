-- SCRIPT DE ACTUALIZACIÓN (MIGRACIÓN)
-- Ejecuta este script en el SQL Editor de Supabase para actualizar tu base de datos
-- sin perder los datos existentes.

-- 1. Agregar columnas nuevas a la tabla de productos (si no existen)
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer default 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants jsonb;

-- 2. Actualizar Políticas de Seguridad (RLS)
-- Primero eliminamos las políticas existentes para evitar conflictos de nombres
DROP POLICY IF EXISTS "Productos son públicos" ON products;
DROP POLICY IF EXISTS "Permitir gestión de productos" ON products;
DROP POLICY IF EXISTS "Pedidos consultables por código" ON orders;
DROP POLICY IF EXISTS "Cualquiera puede crear pedidos" ON orders;
DROP POLICY IF EXISTS "Permitir actualizar pedidos" ON orders;

-- 3. Recrear las políticas con los permisos correctos

-- Productos: Lectura pública
CREATE POLICY "Productos son públicos" 
  ON products FOR SELECT 
  USING (true);

-- Productos: Gestión total (Crear, Editar, Borrar) - Permitido para todos (protegido por login en frontend)
CREATE POLICY "Permitir gestión de productos" 
  ON products FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Pedidos: Lectura pública
CREATE POLICY "Pedidos consultables por código" 
  ON orders FOR SELECT 
  USING (true);

-- Pedidos: Creación pública (cualquier cliente puede comprar)
CREATE POLICY "Cualquiera puede crear pedidos" 
  ON orders FOR INSERT 
  WITH CHECK (true);

-- Pedidos: Actualización pública (necesario para que el Admin cambie estados)
CREATE POLICY "Permitir actualizar pedidos" 
  ON orders FOR UPDATE 
  USING (true) 
  WITH CHECK (true);
