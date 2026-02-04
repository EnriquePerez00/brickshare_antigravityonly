-- Drop set_dim column as it is no longer needed
ALTER TABLE public.sets DROP COLUMN IF EXISTS set_dim;
