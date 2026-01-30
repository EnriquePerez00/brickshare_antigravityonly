-- Migration to automate set assignment and inventory management

-- 1. Add estado_usuario to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS estado_usuario TEXT DEFAULT 'sin set';

-- Add check constraint for allowed values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_estado_usuario'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT check_estado_usuario 
        CHECK (estado_usuario IN ('sin set', 'set en envio', 'set en devolución', 'con set', 'suspendido'));
    END IF;
END $$;

-- 2. Update inventario_sets for existing sets (2 units each)
INSERT INTO public.inventario_sets (set_id, set_ref, cantidad_total, stock_central)
SELECT id, lego_ref, 2, 2
FROM public.sets
ON CONFLICT (set_id) DO UPDATE 
SET cantidad_total = 2, stock_central = 2;

-- 3. Trigger for automatic inventory creation on new sets
CREATE OR REPLACE FUNCTION public.handle_new_set_inventory()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.inventario_sets (set_id, set_ref, cantidad_total, stock_central)
    VALUES (NEW.id, NEW.lego_ref, 2, 2)
    ON CONFLICT (set_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_set_created ON public.sets;
CREATE TRIGGER on_set_created
    AFTER INSERT ON public.sets
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_set_inventory();

-- 4. Function for random set assignment
CREATE OR REPLACE FUNCTION public.assign_sets_to_users()
RETURNS TABLE (user_id UUID, set_id UUID, status TEXT) AS $$
DECLARE
    r RECORD;
    target_set_id UUID;
BEGIN
    -- Loop through eligible users
    FOR r IN (
        SELECT p.user_id, p.full_name
        FROM public.profiles p
        WHERE p.estado_usuario IN ('sin set', 'set en devolución')
          AND EXISTS (SELECT 1 FROM public.wishlist w WHERE w.user_id = p.user_id)
    ) LOOP
        -- Find a random available set from user's wishlist
        SELECT w.product_id INTO target_set_id
        FROM public.wishlist w
        JOIN public.inventario_sets i ON w.product_id = i.set_id
        WHERE w.user_id = r.user_id
          AND i.cantidad_total > 0
        ORDER BY RANDOM()
        LIMIT 1;

        -- If a set is found, perform assignment
        IF target_set_id IS NOT NULL THEN
            -- 1. Update Inventory
            UPDATE public.inventario_sets
            SET cantidad_total = cantidad_total - 1,
                en_envio = en_envio + 1
            WHERE set_id = target_set_id;

            -- 2. Create Order
            INSERT INTO public.orders (user_id, set_id, status)
            VALUES (r.user_id, target_set_id, 'pending');

            -- 3. Update User Status
            UPDATE public.profiles
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.assign_sets_to_users FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_sets_to_users TO service_role;
GRANT EXECUTE ON FUNCTION public.assign_sets_to_users TO authenticated;

-- 5. Seed 5 sample users and wishlists
-- We'll try to insert into auth.users first, then let triggers handle profiles, or insert manually if needed.
DO $$
DECLARE
    new_user_id UUID;
    sample_set_ids UUID[];
    i INT;
    temp_user_id UUID;
BEGIN
    -- Get some random sets for wishlists
    SELECT array_agg(id) INTO sample_set_ids FROM (SELECT id FROM public.sets ORDER BY RANDOM() LIMIT 20) s;

    IF sample_set_ids IS NOT NULL THEN
        FOR i IN 1..5 LOOP
            new_user_id := gen_random_uuid();
            
            -- Insert into auth.users (minimal fields)
            -- We assume standard Supabase auth.users columns. If it fails, we catch it.
            BEGIN
                INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, instance_id)
                VALUES (
                    new_user_id, 
                    'sample_user_' || i || '_' || substr(new_user_id::text, 1, 8) || '@brickshare.test', 
                    '$2a$10$7p0P1p0P1p0P1p0P1p0P1p0P1p0P1p0P1p0P1p0P1p0P1p0P1p0P', -- dummy hash
                    now(),
                    jsonb_build_object('full_name', 'Sample User ' || i),
                    'authenticated',
                    'authenticated',
                    '00000000-0000-0000-0000-000000000000'
                );

                -- The trigger 'on_auth_user_created' should have created the profile.
                -- We update it with the status.
                UPDATE public.profiles SET estado_usuario = 'sin set' WHERE user_id = new_user_id;

                -- Add 3 random items to wishlist
                FOR j IN 1..3 LOOP
                    INSERT INTO public.wishlist (user_id, product_id)
                    VALUES (new_user_id, sample_set_ids[1 + ( floor(random() * array_length(sample_set_ids, 1)) )::int])
                    ON CONFLICT DO NOTHING;
                END LOOP;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not create sample user %: %', i, SQLERRM;
            END;
        END LOOP;
    END IF;
END $$;
