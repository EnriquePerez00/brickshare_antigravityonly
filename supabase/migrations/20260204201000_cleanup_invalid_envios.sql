-- Cleanup invalid envios records
-- Rows without set_id cannot be displayed in the UI or linked to a product.
-- Since we cannot recover the set reference (no set_ref and order_id dropped/unreliable), we must remove them.

DELETE FROM public.envios WHERE set_id IS NULL;

-- Optional: Add constraint to prevent future nulls, if we are sure
-- ALTER TABLE public.envios ALTER COLUMN set_id SET NOT NULL;
