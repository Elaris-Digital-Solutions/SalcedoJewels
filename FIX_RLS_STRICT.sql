-- Habilitar RLS en todas las tablas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Public read access" ON products;
DROP POLICY IF EXISTS "Admin full access" ON products;
DROP POLICY IF EXISTS "Public read access" ON product_images;
DROP POLICY IF EXISTS "Admin full access" ON product_images;
DROP POLICY IF EXISTS "Public read access" ON orders;
DROP POLICY IF EXISTS "Admin full access" ON orders;
DROP POLICY IF EXISTS "Allow anonymous updates" ON orders;

-- POLÍTICAS PARA PRODUCTOS (products)
-- Todo el mundo puede ver los productos
CREATE POLICY "Public read access" ON products
FOR SELECT TO anon, authenticated USING (true);

-- Solo usuarios autenticados pueden insertar, actualizar o eliminar
CREATE POLICY "Admin full access" ON products
FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- POLÍTICAS PARA IMÁGENES (product_images)
-- Todo el mundo puede ver las imágenes
CREATE POLICY "Public read access" ON product_images
FOR SELECT TO anon, authenticated USING (true);

-- Solo usuarios autenticados pueden modificar
CREATE POLICY "Admin full access" ON product_images
FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- POLÍTICAS PARA PEDIDOS (orders)
-- Todo el mundo puede ver pedidos (necesario para el tracking público)
-- Nota: En un sistema más estricto, el tracking debería ser por ID/UUID específico, 
-- pero por ahora permitimos lectura pública para que funcione la página de tracking.
CREATE POLICY "Public read access" ON orders
FOR SELECT TO anon, authenticated USING (true);

-- Permitir a cualquiera CREAR un pedido (Checkout)
CREATE POLICY "Public create access" ON orders
FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Solo usuarios autenticados pueden ACTUALIZAR o ELIMINAR pedidos (cambiar estado)
CREATE POLICY "Admin update access" ON orders
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin delete access" ON orders
FOR DELETE TO authenticated USING (true);
