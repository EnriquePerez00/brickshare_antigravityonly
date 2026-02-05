-- Add estado_manipulacion column to envios
ALTER TABLE public.envios
ADD COLUMN IF NOT EXISTS estado_manipulacion BOOLEAN DEFAULT FALSE;

-- Update RPC to set estado_manipulacion = TRUE
-- Re-defining the function from previous step, adding the new field update.

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
         -- Stock logic temporarily disabled due to missing column
         NULL; 
    END IF;
    
    -- Update Envio if ID provided
    IF p_envio_id IS NOT NULL THEN
        UPDATE public.envios
        SET fecha_recepcion_almacen = now(),
            estado_manipulacion = TRUE, -- Mark as manipulated/processed
            updated_at = now()
        WHERE id = p_envio_id;
    END IF;

END;
$$;
