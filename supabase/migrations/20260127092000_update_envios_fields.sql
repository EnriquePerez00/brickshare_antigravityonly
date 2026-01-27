-- Add missing fields to envios table based on operations panel requirements
ALTER TABLE public.envios
ADD COLUMN IF NOT EXISTS fecha_recogida_almacen TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fecha_solicitud_devolucion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS proveedor_recogida TEXT;

-- Add comments for clarity
COMMENT ON COLUMN public.envios.fecha_recogida_almacen IS 'Date when the shipment was picked up from the warehouse';
COMMENT ON COLUMN public.envios.fecha_solicitud_devolucion IS 'Date when the user requested a return';
COMMENT ON COLUMN public.envios.proveedor_recogida IS 'Carrier or entity in charge of the return pickup';
