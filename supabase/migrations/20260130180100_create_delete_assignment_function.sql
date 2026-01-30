-- Create function to delete assignment and rollback all related changes
-- This function handles cascading deletions and inventory rollback

CREATE OR REPLACE FUNCTION public.delete_assignment_and_rollback(p_envio_id UUID)
RETURNS VOID AS $$
DECLARE
    v_order_id UUID;
    v_user_id UUID;
    v_set_id UUID;
BEGIN
    -- Get the related IDs from the envio record
    SELECT order_id, user_id INTO v_order_id, v_user_id
    FROM public.envios
    WHERE id = p_envio_id;

    -- If envio doesn't exist, raise exception
    IF v_order_id IS NULL THEN
        RAISE EXCEPTION 'Envio with ID % not found', p_envio_id;
    END IF;

    -- Get set_id from the order
    SELECT set_id INTO v_set_id
    FROM public.orders
    WHERE id = v_order_id;

    -- 1. Delete the envio record (this will also delete related operaciones_recepcion if any due to CASCADE)
    DELETE FROM public.envios WHERE id = p_envio_id;

    -- 2. Delete the order record
    DELETE FROM public.orders WHERE id = v_order_id;

    -- 3. Rollback inventory: increment total qty, decrement en_envio
    UPDATE public.inventory_sets
    SET inventory_set_total_qty = inventory_set_total_qty + 1,
        en_envio = GREATEST(en_envio - 1, 0)
    WHERE set_id = v_set_id;

    -- 4. Update user status back to appropriate state
    -- If user has other active orders, keep current status
    -- Otherwise, set to 'sin set'
    UPDATE public.users
    SET user_status = CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.orders 
            WHERE user_id = v_user_id 
            AND status IN ('pending', 'delivered')
        ) THEN user_status
        ELSE 'sin set'
    END
    WHERE user_id = v_user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permissions
REVOKE EXECUTE ON FUNCTION public.delete_assignment_and_rollback FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_assignment_and_rollback TO authenticated;

COMMENT ON FUNCTION public.delete_assignment_and_rollback IS 'Deletes an assignment (envio) and rolls back all related changes including inventory and user status';
