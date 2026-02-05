-- Ensure set_id exists in envios table
-- It seems it might be missing or not properly foreign-keyed, causing the join to fail or the column selection to fail.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'envios' AND column_name = 'set_id') THEN
        ALTER TABLE public.envios ADD COLUMN set_id UUID REFERENCES public.sets(id) ON DELETE SET NULL;
        CREATE INDEX idx_envios_set_id ON public.envios(set_id);
    END IF;
END $$;
