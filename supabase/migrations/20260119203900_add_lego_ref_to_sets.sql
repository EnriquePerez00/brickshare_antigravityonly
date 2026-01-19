-- Add Lego_ref column to sets table
ALTER TABLE public.sets 
ADD COLUMN lego_ref TEXT;

-- Add a comment for clarity
COMMENT ON COLUMN public.sets.lego_ref IS 'Official LEGO catalog reference number';
