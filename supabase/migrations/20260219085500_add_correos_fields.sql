-- Database migration to add Correos-related fields to the envios table

-- Add columns for external IDs and tracking
ALTER TABLE public.envios
ADD COLUMN IF NOT EXISTS correos_shipment_id TEXT,
ADD COLUMN IF NOT EXISTS label_url TEXT,
ADD COLUMN IF NOT EXISTS pickup_id TEXT,
ADD COLUMN IF NOT EXISTS last_tracking_update TIMESTAMP WITH TIME ZONE;

-- Create index for external shipment ID for fast lookups
CREATE INDEX IF NOT EXISTS idx_envios_correos_shipment_id ON public.envios(correos_shipment_id);

-- Add comments for documentation
COMMENT ON COLUMN public.envios.correos_shipment_id IS 'External shipment identifier returned by Correos Preregister API';
COMMENT ON COLUMN public.envios.label_url IS 'Path to the generated shipping label in storage';
COMMENT ON COLUMN public.envios.pickup_id IS 'External identifier for the scheduled pickup';
COMMENT ON COLUMN public.envios.last_tracking_update IS 'Timestamp of the last synchronization with Correos Tracking API';
