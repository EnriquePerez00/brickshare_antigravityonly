-- Update RPC to optionally close the return shipment (mark as processed)
-- Added p_envio_id parameter.
-- Updates envios table: sets fecha_recepcion_almacen = now().
-- We might consider changing status to 'entregado' (Delivered to warehouse), but for now updating timestamp is safe.
-- Actually, let's update status to 'entregado' so it leaves the 'Pending Returns' list if the filter is strict.
-- Wait, 'entregado' usually means 'Delivered to User'.
-- Maybe we need a 'procesado' status? Or just rely on 'devuelto' + fecha_recepcion?
-- User constraint: 'preparacion', 'ruta_envio', 'entregado', 'devuelto', 'ruta_devolucion', 'cancelado'
-- Let's stick to updating the timestamp for now, and maybe the frontend can filter by that?
-- Or, if we want it to leave the list, we might need a new status or reuse 'entregado' (ambiguous).
-- Let's just update the function signature for now and log the reception date.

DROP FUNCTION IF EXISTS public.update_set_status_from_return(UUID, TEXT);

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
    IF p_new_status = 'en reparacion' THEN
        -- ONLY increment 'en_reparacion'
        UPDATE public.inventario_sets
        SET en_reparacion = en_reparacion + 1,
            updated_at = now()
        WHERE set_id = p_set_id;
    END IF;

    IF p_new_status = 'activo' THEN
         UPDATE public.inventario_sets
         SET stock_central = stock_central + 1,
             updated_at = now()
         WHERE set_id = p_set_id;
    END IF;
    
    -- Update Envio if ID provided
    IF p_envio_id IS NOT NULL THEN
        UPDATE public.envios
        SET fecha_recepcion_almacen = now(),
            updated_at = now()
            -- Optionally: status?
        WHERE id = p_envio_id;
    END IF;

END;
$$;
