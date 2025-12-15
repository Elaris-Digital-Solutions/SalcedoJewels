-- Ejecuta este comando en el Editor SQL de Supabase para agregar la columna de cuotas
ALTER TABLE orders ADD COLUMN installments INTEGER DEFAULT 1;
