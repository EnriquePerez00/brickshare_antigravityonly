-- Rename year to year_released and add weight_set to sets table
ALTER TABLE public.sets RENAME COLUMN year TO year_released;
ALTER TABLE public.sets ADD COLUMN weight_set INTEGER; -- weight in grams
