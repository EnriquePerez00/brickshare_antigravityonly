-- Trigger: Automate inventory closure when a reception operation is marked as completed

CREATE OR REPLACE FUNCTION public.handle_cierre_recepcion()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the reception operation was just marked as completed
    IF NEW.status_recepcion = TRUE AND OLD.status_recepcion = FALSE THEN
        
        -- 1. Inventory Logic: Decrement 'en_devolucion' as it has been processed
        UPDATE public.inventory_sets
        SET en_devolucion = GREATEST(0, COALESCE(en_devolucion, 0) - 1),
            updated_at = now()
        WHERE set_id = NEW.set_id;

        -- 2. State Logic: Determine if it goes back to active pool or needs repair
        IF NEW.missing_parts IS NOT NULL AND TRIM(NEW.missing_parts) != '' THEN
            -- There are missing parts. Increment 'en_reparacion' and set parent status
            UPDATE public.inventory_sets
            SET en_reparacion = COALESCE(en_reparacion, 0) + 1
            WHERE set_id = NEW.set_id;

            UPDATE public.sets
            SET set_status = 'en reparacion',
                updated_at = now()
            WHERE id = NEW.set_id;
        ELSE
            -- Everything is fine. It returns to the available pool implicitly 
            -- (by no longer being in 'en_devolucion').
            UPDATE public.sets
            SET set_status = 'activo',
                updated_at = now()
            WHERE id = NEW.set_id;
        END IF;

        -- 3. Update the original Envio record to mark manipulation as done
        UPDATE public.envios
        SET estado_manipulacion = TRUE,
            updated_at = now()
        WHERE id = NEW.event_id;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid duplication
DROP TRIGGER IF EXISTS on_recepcion_completada ON public.operaciones_recepcion;

-- Create Trigger
CREATE TRIGGER on_recepcion_completada
AFTER UPDATE ON public.operaciones_recepcion
FOR EACH ROW
EXECUTE FUNCTION public.handle_cierre_recepcion();
