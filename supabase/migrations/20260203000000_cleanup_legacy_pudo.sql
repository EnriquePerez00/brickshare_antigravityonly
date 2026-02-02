-- Migration: Cleanup legacy PUDO fields from users table
-- These fields have been superseded by the `users_correos_dropping` table.

ALTER TABLE public.users 
DROP COLUMN IF EXISTS pudo_id_correos,
DROP COLUMN IF EXISTS pudo_nombre,
DROP COLUMN IF EXISTS pudo_direccion_completa,
DROP COLUMN IF EXISTS pudo_tipo,
DROP COLUMN IF EXISTS pudo_fecha_seleccion;

-- Note: The policy "Users can update their own PUDO fields" created in 20260202193000 might need to be dropped if it referenced these columns specifically, 
-- but in Supabase policies are usually row-level. However, since the policy was FOR UPDATE, and we no longer need a special policy just for these fields (as standard update policy covers user profile), we can leave it or drop it.
-- Let's drop it to be clean if possible, but finding its name dynamically is hard in plain SQL migrations without knowing the exact name guaranteed.
-- The name was "Users can update their own PUDO fields".

DROP POLICY IF EXISTS "Users can update their own PUDO fields" ON public.users;
