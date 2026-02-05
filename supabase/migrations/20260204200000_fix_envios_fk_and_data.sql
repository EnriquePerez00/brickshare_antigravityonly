-- Fix Envios Relationships and Data
-- 1. Populate set_id based on set_ref (so joins work for existing data)
-- 2. Add FK to public.users (so PostgREST can join 'users' table)

DO $$
BEGIN
    -- 1. Populate set_id
    UPDATE public.envios e
    SET set_id = s.id
    FROM public.sets s
    WHERE e.set_ref = s.set_ref -- (set_ref was renamed from lego_ref, assuming alignment)
      AND e.set_id IS NULL;
      
    -- Note: Ensure we use the correct column names. 
    -- sets table has 'set_ref' (renamed from lego_ref in 20260127100000_global_refactor.sql)
    -- envios table has 'set_ref' (added in 20260127125500_add_set_ref_to_envios.sql)

    -- 2. Add FK to public.users
    -- PostgREST needs this FK to detect the relationship 'users'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'envios_user_id_fkey_public_users'
    ) THEN
        ALTER TABLE public.envios
        ADD CONSTRAINT envios_user_id_fkey_public_users
        FOREIGN KEY (user_id)
        REFERENCES public.users(user_id)
        ON DELETE CASCADE;
    END IF;

END $$;
