-- Trigger: Automatically create a reception operation when a set arrives at the warehouse

CREATE OR REPLACE FUNCTION public.handle_envio_recibido_almacen()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the status changed to 'recibido_almacen' (or 'devuelto', using 'devuelto' to match schema docs if standard)
    -- Typically Correos might mark it as delivered to the return address.
    -- Let's use 'devuelto' as it's the standard final state for returns in the schema definition.
    IF NEW.estado_envio = 'devuelto' AND OLD.estado_envio != 'devuelto' THEN
        -- Insert a new operation record for the warehouse staff to process
        INSERT INTO public.operaciones_recepcion (event_id, user_id, set_id)
        VALUES (NEW.id, NEW.user_id, NEW.set_id);
        
        -- Also update the reception date on the envio
        NEW.fecha_recepcion_almacen = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid duplication
DROP TRIGGER IF EXISTS on_envio_recibido_almacen ON public.envios;

-- Create Trigger (BEFORE UPDATE to allow modifying NEW.fecha_recepcion_almacen)
CREATE TRIGGER on_envio_recibido_almacen
BEFORE UPDATE ON public.envios
FOR EACH ROW
EXECUTE FUNCTION public.handle_envio_recibido_almacen();
