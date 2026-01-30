-- Update estado_envio constraint to new allowed values
-- New values: preparacion, ruta_envio, devolucion, ruta_devolucion

-- 1. Update existing values to new schema
UPDATE public.envios
SET estado_envio = CASE
    WHEN estado_envio IN ('pendiente', 'asignado') THEN 'preparacion'
    WHEN estado_envio = 'en_transito' THEN 'ruta_envio'
    WHEN estado_envio = 'devuelto' THEN 'ruta_devolucion'
    WHEN estado_envio = 'entregado' THEN 'preparacion'
    WHEN estado_envio = 'cancelado' THEN 'preparacion'
    ELSE 'preparacion'
END;

-- 2. Drop old constraint if exists
ALTER TABLE public.envios DROP CONSTRAINT IF EXISTS check_estado_envio;

-- 3. Add new CHECK constraint
ALTER TABLE public.envios
ADD CONSTRAINT check_estado_envio
CHECK (estado_envio IN ('preparacion', 'ruta_envio', 'devolucion', 'ruta_devolucion'));

-- 4. Update column comment
COMMENT ON COLUMN public.envios.estado_envio IS 'Allowed values: preparacion (en preparación, no recogido), ruta_envio (de camino a usuario), devolucion (solicitada devolución, no recogido), ruta_devolucion (en devolución)';
