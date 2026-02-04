-- Add set_status column to sets table
ALTER TABLE public.sets 
ADD COLUMN IF NOT EXISTS set_status text CHECK (set_status IN ('active', 'inactive')) DEFAULT 'inactive';
