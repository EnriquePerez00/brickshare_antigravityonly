-- Add set_price column to sets table
ALTER TABLE public.sets 
ADD COLUMN IF NOT EXISTS set_price NUMERIC DEFAULT 100.00;
