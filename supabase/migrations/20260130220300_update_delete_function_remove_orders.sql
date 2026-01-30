-- Update delete function to not use orders table and restore wishlist
-- Gets set_id directly from envios and restores deleted set to wishlist

DROP FUNCTION IF EXISTS public.delete_assignment_and_rollback(UUID);

CREATE OR REPLACE FUNCTION public.delete_assignment_and_rollback(p_envio_id UUID)
RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
    v_set_id UUID;
BEGIN
    -- Get user_id and set_id directly from envios
    SELECT user_id, set_id INTO v_user_id, v_set_id
    FROM public.envios
    WHERE id = p_envio_id;

    -- If envio doesn't exist, raise exception
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Envio with ID % not found', p_envio_id;
    END IF;

    -- 1. Delete the envio record (this will also delete related operaciones_recepcion if any due to CASCADE)
    DELETE FROM public.envios WHERE id = p_envio_id;

    -- 2. Rollback inventory: increment total qty, decrement en_envio
    UPDATE public.inventory_sets
    SET inventory_set_total_qty = inventory_set_total_qty + 1,
        en_envio = GREATEST(en_envio - 1, 0)
    WHERE set_id = v_set_id;

    -- 3. Re-add to wishlist (if not already there)
    INSERT INTO public.wishlist (user_id, set_id)
    VALUES (v_user_id, v_set_id)
    ON CONFLICT (user_id, set_id) DO NOTHING;

    -- 4. Update user status back to appropriate state
    -- If user has other active envios, keep current status
    -- Otherwise, set to 'sin set'
    UPDATE public.users
    SET user_status = CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.envios 
            WHERE user_id = v_user_id 
            AND estado_envio IN ('preparacion', 'ruta_envio')
        ) THEN user_status
        ELSE 'sin set'
    END
    WHERE user_id = v_user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permissions
REVOKE EXECUTE ON FUNCTION public.delete_assignment_and_rollback FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_assignment_and_rollback TO authenticated;

COMMENT ON FUNCTION public.delete_assignment_and_rollback IS 'Deletes an assignment (envio) and rolls back all changes including inventory and wishlist restoration';
