-- Update RPC function to separate inventory logic as requested
-- Logic: When setting status to 'en reparacion', ONLY increment 'en_reparacion'. Do NOT decrement 'en_devolucion'.

CREATE OR REPLACE FUNCTION public.update_set_status_from_return(p_set_id UUID, p_new_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_status TEXT;
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
        -- Do NOT decrement 'en_devolucion' (User Instruction: "no asumas que debo decrementar en_devolucion")
        UPDATE public.inventario_sets
        SET en_reparacion = en_reparacion + 1,
            updated_at = now()
        WHERE set_id = p_set_id;
    END IF;

    -- Logic for 'activo' (Return to stock)
    -- If moving TO 'activo', we assume it goes to 'stock_central'.
    -- We will also NOT decrement 'en_devolucion' here to be consistent with the "no assumption" rule,
    -- or should we? The user specific instruction was about "en reparacion" logic.
    -- However, "no asumas que debo decrementar en_devolucion" sounds general.
    -- I will apply the same pattern: Just increment where it goes.
    
    IF p_new_status = 'activo' THEN
         UPDATE public.inventario_sets
         SET stock_central = stock_central + 1,
             updated_at = now()
         WHERE set_id = p_set_id;
    END IF;
    
END;
$$;
