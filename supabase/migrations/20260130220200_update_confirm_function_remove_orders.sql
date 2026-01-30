-- Update confirm function to not use orders table and delete from wishlist
-- Creates envios directly with set_id, deletes from wishlist after assignment

DROP FUNCTION IF EXISTS public.confirm_assign_sets_to_users(UUID[]);

CREATE OR REPLACE FUNCTION public.confirm_assign_sets_to_users(p_user_ids UUID[])
RETURNS TABLE (
    envio_id UUID, 
    user_id UUID, 
    set_id UUID, 
    user_name TEXT, 
    set_name TEXT, 
    set_ref TEXT,
    created_at TIMESTAMPTZ
) AS $$
DECLARE
    r RECORD;
    target_set_id UUID;
    new_envio_id UUID;
    v_set_name TEXT;
    v_set_ref TEXT;
    v_created_at TIMESTAMPTZ;
BEGIN
    -- Loop through specified users only
    FOR r IN (
        SELECT u.user_id, u.full_name
        FROM public.users u
        WHERE u.user_id = ANY(p_user_ids)
          AND u.user_status IN ('sin set', 'set en devolucion')
          AND EXISTS (SELECT 1 FROM public.wishlist w WHERE w.user_id = u.user_id)
    ) LOOP
        -- Find the first available set from user's wishlist (by creation order)
        SELECT w.set_id, s.set_name, s.set_ref 
        INTO target_set_id, v_set_name, v_set_ref
        FROM public.wishlist w
        JOIN public.inventory_sets i ON w.set_id = i.set_id
        JOIN public.sets s ON w.set_id = s.id
        WHERE w.user_id = r.user_id
          AND i.inventory_set_total_qty > 0
        ORDER BY w.created_at ASC
        LIMIT 1;

        -- If a set is found, perform assignment
        IF target_set_id IS NOT NULL THEN
            -- 1. Update Inventory: decrement total stock and increment en_envio
            UPDATE public.inventory_sets
            SET inventory_set_total_qty = inventory_set_total_qty - 1,
                en_envio = en_envio + 1
            WHERE inventory_sets.set_id = target_set_id;

            -- 2. Create Envio record (NO ORDER NEEDED)
            INSERT INTO public.envios (
                user_id,
                set_id,
                estado_envio,
                direccion_envio,
                ciudad_envio,
                codigo_postal_envio
            )
            VALUES (
                r.user_id,
                target_set_id,
                'preparacion',
                'Pendiente de asignación',
                'Pendiente',
                '00000'
            )
            RETURNING envios.id, envios.created_at INTO new_envio_id, v_created_at;

            -- 3. Delete from wishlist
            DELETE FROM public.wishlist
            WHERE user_id = r.user_id AND set_id = target_set_id;

            -- 4. Update User Status
            UPDATE public.users
            SET user_status = 'set en envio'
            WHERE users.user_id = r.user_id;

            -- Return the result with full details
            envio_id := new_envio_id;
            user_id := r.user_id;
            set_id := target_set_id;
            user_name := r.full_name;
            set_name := v_set_name;
            set_ref := v_set_ref;
            created_at := v_created_at;
            
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.confirm_assign_sets_to_users IS 'Executes set assignments for confirmed user IDs - creates envios directly without orders, deletes from wishlist';
