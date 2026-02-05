-- Rename 'devolucion' to 'devuelto' in envios.estado_envio
-- Requested by user.

-- 1. Drop existing constraint
ALTER TABLE public.envios DROP CONSTRAINT IF EXISTS check_estado_envio;

-- 2. Update existing data
UPDATE public.envios
SET estado_envio = 'devuelto'
WHERE estado_envio = 'devolucion';

-- 3. Add new constraint with 'devuelto' instead of 'devolucion'
-- Allowed: preparacion, ruta_envio, entregado, devuelto, ruta_devolucion, cancelado
ALTER TABLE public.envios
ADD CONSTRAINT check_estado_envio
CHECK (estado_envio IN ('preparacion', 'ruta_envio', 'entregado', 'devuelto', 'ruta_devolucion', 'cancelado'));

COMMENT ON COLUMN public.envios.estado_envio IS 'Allowed values: preparacion, ruta_envio, entregado, devuelto, ruta_devolucion, cancelado';
