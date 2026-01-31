-- Update check constraint for envios.estado_envio to include 'entregado'

ALTER TABLE public.envios DROP CONSTRAINT IF EXISTS check_estado_envio;

ALTER TABLE public.envios
ADD CONSTRAINT check_estado_envio
CHECK (estado_envio IN ('preparacion', 'ruta_envio', 'entregado', 'devolucion', 'ruta_devolucion'));

COMMENT ON COLUMN public.envios.estado_envio IS 'Allowed values: preparacion, ruta_envio, entregado, devolucion, ruta_devolucion';
