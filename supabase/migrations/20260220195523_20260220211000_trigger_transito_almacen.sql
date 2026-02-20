-- Trigger: Update inventory_sets.en_devolucion when shipment is in return transit

CREATE OR REPLACE FUNCTION public.handle_envio_ruta_devolucion_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the status changed to 'ruta_devolucion'
    IF NEW.estado_envio = 'ruta_devolucion' AND OLD.estado_envio != 'ruta_devolucion' THEN
        -- Increase the 'en_devolucion' count for the associated set
        UPDATE public.inventory_sets
        SET en_devolucion = COALESCE(en_devolucion, 0) + 1,
            updated_at = now()
        WHERE set_id = NEW.set_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid duplication
DROP TRIGGER IF EXISTS on_envio_ruta_devolucion_inv ON public.envios;

-- Create Trigger
CREATE TRIGGER on_envio_ruta_devolucion_inv
AFTER UPDATE ON public.envios
FOR EACH ROW
EXECUTE FUNCTION public.handle_envio_ruta_devolucion_inventory();
