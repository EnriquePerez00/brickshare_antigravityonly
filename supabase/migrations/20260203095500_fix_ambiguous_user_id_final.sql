-- Fix ambiguous column reference in confirm_assign_sets_to_users
-- The error "user_id is ambiguous" happens because the function returns a column named user_id, 
-- creating a conflict in SQL statements within the function.

CREATE OR REPLACE FUNCTION public.confirm_assign_sets_to_users(p_user_ids UUID[])
RETURNS TABLE (
    envio_id UUID, 
    user_id UUID, 
    set_id UUID, 
    user_name TEXT, 
    set_name TEXT, 
    set_ref TEXT,
    set_price DECIMAL,
    created_at TIMESTAMPTZ
) AS $$
DECLARE
    r RECORD;
    v_target_set_id UUID;
    v_new_envio_id UUID;
    v_set_name TEXT;
    v_set_ref TEXT;
    v_set_price DECIMAL;
    v_created_at TIMESTAMPTZ;
BEGIN
    -- Loop through specified users only
    FOR r IN (
        SELECT u.user_id as target_uid, u.full_name
        FROM public.users u
        WHERE u.user_id = ANY(p_user_ids)
          AND u.user_status IN ('sin set', 'set en devolucion')
          AND EXISTS (SELECT 1 FROM public.wishlist w WHERE w.user_id = u.user_id)
    ) LOOP
        -- Find the first available set from user's wishlist
        SELECT w.set_id, s.set_name, s.set_ref, COALESCE(s.set_price, 100.00)
        INTO v_target_set_id, v_set_name, v_set_ref, v_set_price
        FROM public.wishlist w
        JOIN public.inventory_sets i ON w.set_id = i.set_id
        JOIN public.sets s ON w.set_id = s.id
        WHERE w.user_id = r.target_uid
          AND i.inventory_set_total_qty > 0
        ORDER BY w.created_at ASC
        LIMIT 1;

        -- If a set is found, perform assignment
        IF v_target_set_id IS NOT NULL THEN
            -- 1. Update Inventory
            UPDATE public.inventory_sets
            SET inventory_set_total_qty = inventory_set_total_qty - 1,
                en_envio = en_envio + 1
            WHERE public.inventory_sets.set_id = v_target_set_id;

            -- 2. Create Envio record
            INSERT INTO public.envios (
                user_id,
                set_id,
                set_ref,
                estado_envio,
                direccion_envio,
                ciudad_envio,
                codigo_postal_envio
            )
            VALUES (
                r.target_uid,
                v_target_set_id,
                v_set_ref,
                'preparacion',
                'Pendiente de asignación',
                'Pendiente',
                '00000'
            )
            RETURNING id, public.envios.created_at INTO v_new_envio_id, v_created_at;

            -- 3. Delete from wishlist (using table qualification to avoid ambiguity)
            DELETE FROM public.wishlist
            WHERE public.wishlist.user_id = r.target_uid AND public.wishlist.set_id = v_target_set_id;

            -- 4. Update User Status
            UPDATE public.users
            SET user_status = 'set en envio'
            WHERE public.users.user_id = r.target_uid;

            -- Explicitly assign variables for return table
            -- We must use 'assign' to specific return columns if names conflict
            -- but in RETURNS TABLE, these names are in scope.
            -- To be safe, we assign them one by one.
            envio_id := v_new_envio_id;
            user_id := r.target_uid; -- assigning to the return table column
            set_id := v_target_set_id;
            user_name := r.full_name;
            set_name := v_set_name;
            set_ref := v_set_ref;
            set_price := v_set_price;
            created_at := v_created_at;
            
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
