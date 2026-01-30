-- Fix ambiguous column reference in assign_sets_to_users function

CREATE OR REPLACE FUNCTION public.assign_sets_to_users()
RETURNS TABLE (user_id UUID, set_id UUID, status TEXT) AS $$
DECLARE
    r RECORD;
    target_set_id UUID;
BEGIN
    -- Loop through eligible users
    FOR r IN (
        SELECT u.user_id, u.full_name
        FROM public.users u
        WHERE u.estado_usuario IN ('sin set', 'set en devolución')
          AND EXISTS (SELECT 1 FROM public.wishlist w WHERE w.user_id = u.user_id)
    ) LOOP
        -- Find the first available set from user's wishlist (by creation order)
        -- Check that there is stock available
        -- Use table aliases to avoid ambiguous column references
        SELECT w.set_id INTO target_set_id
        FROM public.wishlist w
        JOIN public.inventory_sets i ON w.set_id = i.set_id
        WHERE w.user_id = r.user_id
          AND i.inventory_set_total_qty > 0
        ORDER BY w.created_at ASC  -- First item in wishlist (oldest entry)
        LIMIT 1;

        -- If a set is found, perform assignment
        IF target_set_id IS NOT NULL THEN
            -- 1. Update Inventory: decrement total stock and increment en_envio
            UPDATE public.inventory_sets
            SET inventory_set_total_qty = inventory_set_total_qty - 1,
                en_envio = en_envio + 1
            WHERE inventory_sets.set_id = target_set_id;

            -- 2. Create Order
            INSERT INTO public.orders (user_id, set_id, status)
            VALUES (r.user_id, target_set_id, 'pending');

            -- 3. Update User Status
            UPDATE public.users
            SET estado_usuario = 'set en envio'
            WHERE users.user_id = r.user_id;

            -- Return the result
            user_id := r.user_id;
            set_id := target_set_id;
            status := 'Assigned';
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
