-- Add Brickset value columns to sets table
ALTER TABLE public.sets 
ADD COLUMN IF NOT EXISTS current_value_new NUMERIC,
ADD COLUMN IF NOT EXISTS current_value_used NUMERIC,
ADD COLUMN IF NOT EXISTS set_pvp_release NUMERIC;
