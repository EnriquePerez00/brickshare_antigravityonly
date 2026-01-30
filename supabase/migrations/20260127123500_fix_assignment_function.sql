-- Fix assignment function to use 'users' table instead of 'profiles'

-- 1. Add estado_usuario to users table if not exists
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS estado_usuario TEXT DEFAULT 'sin set';

-- Add check constraint for allowed values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_estado_usuario_users'
    ) THEN
        ALTER TABLE public.users 
        ADD CONSTRAINT check_estado_usuario_users 
        CHECK (estado_usuario IN ('sin set', 'set en envio', 'set en devolución', 'con set', 'suspendido'));
    END IF;
END $$;

-- 2. Update the assign_sets_to_users function to use 'users' table
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
        -- Find a random available set from user's wishlist
        SELECT w.set_id INTO target_set_id
        FROM public.wishlist w
        JOIN public.inventory_sets i ON w.set_id = i.set_id
        WHERE w.user_id = r.user_id
          AND i.inventory_set_total_qty > 0
        ORDER BY RANDOM()
        LIMIT 1;

        -- If a set is found, perform assignment
        IF target_set_id IS NOT NULL THEN
            -- 1. Update Inventory
            UPDATE public.inventory_sets
            SET inventory_set_total_qty = inventory_set_total_qty - 1,
                en_envio = en_envio + 1
            WHERE set_id = target_set_id;

            -- 2. Create Order
            INSERT INTO public.orders (user_id, set_id, status)
            VALUES (r.user_id, target_set_id, 'pending');

            -- 3. Update User Status
            UPDATE public.users
            SET estado_usuario = 'set en envio'
            WHERE user_id = r.user_id;

            -- Return the result
            user_id := r.user_id;
            set_id := target_set_id;
            status := 'Assigned';
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
