-- Refactor envios table to remove dependency on orders table
-- Add set_id directly to envios, migrate data, and drop orders

-- 1. Add set_id column to envios
ALTER TABLE public.envios 
ADD COLUMN set_id UUID REFERENCES public.sets(id) ON DELETE SET NULL;

-- 2. Migrate existing data: copy set_id from orders to envios
UPDATE public.envios e
SET set_id = o.set_id
FROM public.orders o
WHERE e.order_id = o.id;

-- 3. Drop order_id column (this will drop the foreign key constraint automatically)
ALTER TABLE public.envios DROP COLUMN order_id;

-- 4. Drop orders table completely
DROP TABLE IF EXISTS public.orders CASCADE;

-- 5. Add index on set_id for performance
CREATE INDEX IF NOT EXISTS idx_envios_set_id ON public.envios(set_id);

COMMENT ON COLUMN public.envios.set_id IS 'Direct reference to the set being shipped, eliminates need for orders table';
