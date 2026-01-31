-- Update allowed statuses for envios.estado_envio

-- 1. Drop existing constraint
ALTER TABLE public.envios DROP CONSTRAINT IF EXISTS check_estado_envio;

-- 2. Normalize data
-- User requested changing 'en devolucion' to 'devuelto'. 
-- Also mapping 'devolucion' (old value) to 'devuelto' to unify.
UPDATE public.envios SET estado_envio = 'devuelto' WHERE estado_envio IN ('devolucion', 'en devolucion');

-- 3. Add new Constraint
-- Allowed values:
-- preparacion
-- ruta_envio
-- entregado
-- devuelto (New finalized return state)
-- ruta_devolucion (In transit return)
ALTER TABLE public.envios
ADD CONSTRAINT check_estado_envio
CHECK (estado_envio IN ('preparacion', 'ruta_envio', 'entregado', 'devuelto', 'ruta_devolucion'));

COMMENT ON COLUMN public.envios.estado_envio IS 'Allowed values: preparacion, ruta_envio, entregado, devuelto, ruta_devolucion';
