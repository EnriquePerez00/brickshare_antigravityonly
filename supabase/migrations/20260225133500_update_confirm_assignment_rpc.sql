-- Update confirm_assign_sets_to_users RPC to include PUDO and set details
-- This allows the Edge Function to perform Correos pre-registration immediately after assignment

CREATE OR REPLACE FUNCTION public.confirm_assign_sets_to_users(p_user_ids UUID[])
RETURNS TABLE (
    envio_id UUID, 
    user_id UUID, 
    set_id UUID, 
    order_id UUID, 
    user_name TEXT, 
    user_email TEXT,
    user_phone TEXT,
    set_name TEXT, 
    set_ref TEXT,
    set_weight NUMERIC,
    set_dim TEXT,
    pudo_id TEXT,
    pudo_name TEXT,
    pudo_address TEXT,
    pudo_cp TEXT,
    pudo_city TEXT,
    pudo_province TEXT,
    created_at TIMESTAMPTZ
) AS $$
DECLARE
    r RECORD;
    target_set_id UUID;
    new_order_id UUID;
    new_envio_id UUID;
    v_set_name TEXT;
    v_set_ref TEXT;
    v_set_weight NUMERIC;
    v_set_dim TEXT;
    v_user_email TEXT;
    v_user_phone TEXT;
    v_pudo_id TEXT;
    v_pudo_name TEXT;
    v_pudo_address TEXT;
    v_pudo_cp TEXT;
    v_pudo_city TEXT;
    v_pudo_province TEXT;
    v_created_at TIMESTAMPTZ;
BEGIN
    -- Loop through specified users only
    FOR r IN (
        SELECT u.user_id, u.full_name, u.email, u.phone,
               p.correos_id_pudo, p.correos_nombre, p.correos_direccion_completa,
               p.correos_codigo_postal, p.correos_ciudad, p.correos_provincia
        FROM public.users u
        LEFT JOIN public.users_correos_dropping p ON u.user_id = p.user_id
        WHERE u.user_id = ANY(p_user_ids)
          AND u.user_status IN ('sin set', 'set en devolucion')
          AND EXISTS (SELECT 1 FROM public.wishlist w WHERE w.user_id = u.user_id AND w.status = true)
    ) LOOP
        -- Find the first available set from user's wishlist (by creation order)
        SELECT w.set_id, s.set_name, s.set_ref, s.set_weight, s.set_dim
        INTO target_set_id, v_set_name, v_set_ref, v_set_weight, v_set_dim
        FROM public.wishlist w
        JOIN public.inventory_sets i ON w.set_id = i.set_id
        JOIN public.sets s ON w.set_id = s.id
        WHERE w.user_id = r.user_id
          AND w.status = true
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

            -- 2. Create Order
            INSERT INTO public.orders (user_id, set_id, status)
            VALUES (r.user_id, target_set_id, 'pending')
            RETURNING id INTO new_order_id;

            -- 3. Create Envio record with PUDO data
            INSERT INTO public.envios (
                order_id, 
                user_id, 
                estado_envio,
                direccion_envio,
                ciudad_envio,
                codigo_postal_envio,
                pais_envio
            )
            VALUES (
                new_order_id,
                r.user_id,
                'pendiente',
                COALESCE(r.correos_direccion_completa, 'Pendiente de asignación'),
                COALESCE(r.correos_ciudad, 'Pendiente'),
                COALESCE(r.correos_codigo_postal, '00000'),
                'España'
            )
            RETURNING envios.id, envios.created_at INTO new_envio_id, v_created_at;

            -- 4. Update User Status
            UPDATE public.users
            SET user_status = 'set en envio'
            WHERE users.user_id = r.user_id;

            -- 5. Update Wishlist Status
            UPDATE public.wishlist
            SET status = false,
                status_changed_at = now()
            WHERE wishlist.user_id = r.user_id 
              AND wishlist.set_id = target_set_id;

            -- Populate return variables
            confirm_assign_sets_to_users.envio_id := new_envio_id;
            confirm_assign_sets_to_users.user_id := r.user_id;
            confirm_assign_sets_to_users.set_id := target_set_id;
            confirm_assign_sets_to_users.order_id := new_order_id;
            confirm_assign_sets_to_users.user_name := r.full_name;
            confirm_assign_sets_to_users.user_email := r.email;
            confirm_assign_sets_to_users.user_phone := r.phone;
            confirm_assign_sets_to_users.set_name := v_set_name;
            confirm_assign_sets_to_users.set_ref := v_set_ref;
            confirm_assign_sets_to_users.set_weight := v_set_weight;
            confirm_assign_sets_to_users.set_dim := v_set_dim;
            confirm_assign_sets_to_users.pudo_id := r.correos_id_pudo;
            confirm_assign_sets_to_users.pudo_name := r.correos_nombre;
            confirm_assign_sets_to_users.pudo_address := r.correos_direccion_completa;
            confirm_assign_sets_to_users.pudo_cp := r.correos_codigo_postal;
            confirm_assign_sets_to_users.pudo_city := r.correos_ciudad;
            confirm_assign_sets_to_users.pudo_province := r.correos_provincia;
            confirm_assign_sets_to_users.created_at := v_created_at;
            
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
