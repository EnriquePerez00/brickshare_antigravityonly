-- Migration: Add 'entregado' to envios and 'cancelado' to users
-- requested by user to support these specific statuses.

-- 1. Update envios constraint
ALTER TABLE public.envios DROP CONSTRAINT IF EXISTS check_estado_envio;

-- Clean up invalid values before applying constraint
UPDATE public.envios 
SET estado_envio = 'preparacion' 
WHERE estado_envio NOT IN ('preparacion', 'ruta_envio', 'entregado', 'devolucion', 'ruta_devolucion', 'cancelado');

ALTER TABLE public.envios
ADD CONSTRAINT check_estado_envio
CHECK (estado_envio IN ('preparacion', 'ruta_envio', 'entregado', 'devolucion', 'ruta_devolucion', 'cancelado')); 

-- 2. Update users constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_user_status;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_estado_usuario; -- legacy safety

-- Clean up invalid values before applying constraint
UPDATE public.users 
SET user_status = 'sin set' 
WHERE user_status NOT IN ('set en envio', 'sin set', 'recibido', 'set en devolucion', 'suspendido', 'cancelado');

ALTER TABLE public.users 
ADD CONSTRAINT check_user_status 
CHECK (user_status IN ('set en envio', 'sin set', 'recibido', 'set en devolucion', 'suspendido', 'cancelado'));

-- 3. Update comments
COMMENT ON COLUMN public.envios.estado_envio IS 'Allowed values: preparacion, ruta_envio, entregado, devolucion, ruta_devolucion, cancelado';
COMMENT ON COLUMN public.users.user_status IS 'Allowed values: set en envio, sin set, recibido, set en devolucion, suspendido, cancelado';
