-- Add brightness and contrast columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS brightness INTEGER DEFAULT 100;
ALTER TABLE products ADD COLUMN IF NOT EXISTS contrast INTEGER DEFAULT 100;
