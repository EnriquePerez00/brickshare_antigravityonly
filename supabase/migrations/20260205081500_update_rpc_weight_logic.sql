-- Update RPC to handle Weight Validation Logic
-- 1. Always decrement 'en_devolucion' in inventory_sets.
-- 2. If 'en reparacion', increment 'en_reparacion'.
-- 3. Always set 'estado_manipulacion' = TRUE in envios.
-- 4. Status update on sets table.

CREATE OR REPLACE FUNCTION public.update_set_status_from_return(p_set_id UUID, p_new_status TEXT, p_envio_id UUID DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
BEGIN
    -- Validate input status
    IF p_new_status NOT IN ('activo', 'inactivo', 'en reparacion') THEN
        RAISE EXCEPTION 'Invalid status: %', p_new_status;
    END IF;

    -- Update set status
    UPDATE public.sets 
    SET set_status = p_new_status,
        updated_at = now()
    WHERE id = p_set_id;

    -- Inventory Logic:
    -- 1. ALWAYS decrement 'en_devolucion' as the item has arrived.
    UPDATE public.inventory_sets
    SET en_devolucion = en_devolucion - 1,
        updated_at = now()
    WHERE set_id = p_set_id;

    -- 2. Conditional increments
    IF p_new_status = 'en reparacion' THEN
        -- Increment 'en_reparacion'
        UPDATE public.inventory_sets
        SET en_reparacion = en_reparacion + 1
        WHERE set_id = p_set_id;
    END IF;

    IF p_new_status = 'activo' THEN
         -- Stock logic temporarily disabled due to missing 'stock_central' column in global refactor
         -- TODO: Restore this once column name is verified (e.g. inventory_set_total_qty vs calculated)
         -- UPDATE public.inventory_sets SET stock_central = stock_central + 1 WHERE set_id = p_set_id;
         NULL; 
    END IF;
    
    -- Update Envio if ID provided
    IF p_envio_id IS NOT NULL THEN
        UPDATE public.envios
        SET fecha_recepcion_almacen = now(),
            estado_manipulacion = TRUE, -- Mark as processed
            updated_at = now()
        WHERE id = p_envio_id;
    END IF;

END;
$$;
