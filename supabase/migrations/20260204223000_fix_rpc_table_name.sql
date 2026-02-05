-- Fix RPC table name: inventario_sets -> inventory_sets
-- AND handle missing stock_central column (Dropped in Global Refactor).
-- 'en_reparacion' logic is kept.
-- 'stock_central' logic is disabled to prevent errors until new column name is confirmed.

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
        UPDATE public.inventory_sets
        SET en_reparacion = en_reparacion + 1,
            updated_at = now()
        WHERE set_id = p_set_id;
    END IF;

    IF p_new_status = 'activo' THEN
         -- Increment stock logic.
         -- ALERT: 'stock_central' column was dropped. Disabling update to prevent crash.
         -- TODO: Identify correct column for 'Available Stock' (maybe derived from Total - Others?)
         -- UPDATE public.inventory_sets
         -- SET stock_central = stock_central + 1,
         --     updated_at = now()
         -- WHERE set_id = p_set_id;
         
         -- For now, we just update the set status to 'activo', which makes it available for assignment queries.
         NULL; 
    END IF;
    
    -- Update Envio if ID provided
    IF p_envio_id IS NOT NULL THEN
        UPDATE public.envios
        SET fecha_recepcion_almacen = now(),
            updated_at = now()
        WHERE id = p_envio_id;
    END IF;

END;
$$;
