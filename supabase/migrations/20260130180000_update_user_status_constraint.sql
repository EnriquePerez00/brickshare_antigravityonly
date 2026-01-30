-- Update user_status constraint to allow only specific values
-- This migration updates the constraint to support the new business logic

-- 1. Update any users with 'con set' status to 'sin set'
UPDATE public.users 
SET user_status = 'sin set' 
WHERE user_status = 'con set';

-- 2. Drop the old constraint if it exists
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_estado_usuario_users;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_estado_usuario;

-- 3. Add the new constraint with the updated allowed values
ALTER TABLE public.users 
ADD CONSTRAINT check_user_status 
CHECK (user_status IN ('set en envio', 'sin set', 'recibido', 'set en devolucion', 'suspendido'));

-- 4. Add comment to explain the allowed values
COMMENT ON COLUMN public.users.user_status IS 'Allowed values: set en envio, sin set, recibido, set en devolucion, suspendido';
