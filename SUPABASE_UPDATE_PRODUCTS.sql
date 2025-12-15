-- Ejecuta este comando en el Editor SQL de Supabase para agregar la columna de ordenamiento a los productos
ALTER TABLE products ADD COLUMN sort_order INTEGER DEFAULT 0;
