-- Modify inventory table to have more granular tracking
ALTER TABLE public.inventory DROP COLUMN IF EXISTS rented_count;

ALTER TABLE public.inventory ADD COLUMN shipping_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE public.inventory ADD COLUMN being_used_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE public.inventory ADD COLUMN returning_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE public.inventory ADD COLUMN being_completed_count INTEGER DEFAULT 0 NOT NULL;
