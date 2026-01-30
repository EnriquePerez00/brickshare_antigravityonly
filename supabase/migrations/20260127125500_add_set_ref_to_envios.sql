-- Add set_ref field to envios table

ALTER TABLE public.envios
ADD COLUMN IF NOT EXISTS set_ref TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.envios.set_ref IS 'LEGO set reference (e.g., 75192) for quick reference';
