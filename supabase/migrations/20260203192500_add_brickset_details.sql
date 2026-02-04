-- Add subtheme and barcode columns to sets table
ALTER TABLE public.sets 
ADD COLUMN IF NOT EXISTS set_subtheme TEXT,
ADD COLUMN IF NOT EXISTS barcode_upc TEXT,
ADD COLUMN IF NOT EXISTS barcode_ean TEXT;
